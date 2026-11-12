/**
 * Trial WhatsApp connection for the MAAL LINE bot, using whatsapp-web.js (an unofficial
 * WhatsApp Web client). It only moves messages: every customer message goes to the app's
 * /api/whatsapp/inbound, which runs the bot and returns the replies to send.
 *
 * Unofficial clients break WhatsApp's terms and the number can be banned: use a spare SIM,
 * never the store's main number. The long-term setup is Meta's Cloud API.
 *
 * Env: APP_URL, WORKER_SECRET (same as WHATSAPP_WORKER_SECRET in Vercel), PORT,
 * DATA_DIR (persistent volume for the session), CHROME_PATH.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { timingSafeEqual } from 'node:crypto'
import QRCode from 'qrcode'
import wwebjs from 'whatsapp-web.js'

const { Client, LocalAuth } = wwebjs

const APP_URL = (process.env.APP_URL || '').trim().replace(/\/+$/, '')
const SECRET = (process.env.WORKER_SECRET || '').trim()
const PORT = Number(process.env.PORT) || 3000
const DATA_DIR = process.env.DATA_DIR || './data'

if (!APP_URL || SECRET.length < 32) {
  console.error('Set APP_URL and WORKER_SECRET (32+ characters) before starting.')
  process.exit(1)
}

let latestQr = null
let ready = false

// A crash can leave Chrome's profile lock behind on the volume, and Chrome then refuses to start
for (const dir of [path.join(DATA_DIR, 'session'), path.join(DATA_DIR, 'session', 'Default')]) {
  for (const name of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) {
    fs.rmSync(path.join(dir, name), { force: true })
  }
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: DATA_DIR }),
  // WhatsApp Web can take well over the default 30 s to load on a small container
  authTimeoutMs: 120_000,
  puppeteer: {
    headless: true,
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote'],
  },
})

client.on('qr', (qr) => {
  latestQr = qr
  ready = false
  console.log('Scan the QR code: open /qr?token=<WORKER_SECRET> on this service')
})
client.on('authenticated', () => console.log('Authenticated'))
client.on('auth_failure', (message) => console.error('Auth failure:', message))
client.on('ready', () => {
  ready = true
  latestQr = null
  console.log('WhatsApp connected and ready')
})
client.on('disconnected', (reason) => {
  console.error('Disconnected:', reason)
  // Railway restarts the service, which reconnects (or shows a new QR if the session was closed)
  process.exit(1)
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const digits = (value) => String(value).replace(/\D/g, '')

/** The customer's phone; newer WhatsApp chats may only expose a private id (@lid) */
async function resolvePhone(from) {
  if (from.endsWith('@c.us')) return digits(from.split('@')[0])
  if (from.endsWith('@lid')) {
    try {
      const [info] = await client.getContactLidAndPhone([from])
      if (info?.pn) return digits(info.pn.split('@')[0])
    } catch (error) {
      console.warn('Could not resolve phone for', from, error?.message)
    }
  }
  return null
}

async function forward(payload) {
  const res = await fetch(`${APP_URL}/api/whatsapp/inbound`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(75_000),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) console.error('App answered', res.status, data?.error)
  return Array.isArray(data?.replies) ? data.replies.filter((r) => typeof r === 'string' && r) : []
}

async function handleMessage(message) {
  const from = message.from
  if (message.fromMe || message.isStatus || !(from.endsWith('@c.us') || from.endsWith('@lid'))) return

  const phone = await resolvePhone(from)
  const chatKey = phone ?? `lid${digits(from.split('@')[0])}`
  const chat = await message.getChat()
  await chat.sendSeen().catch(() => {})
  await chat.sendStateTyping().catch(() => {})

  try {
    const replies = await forward({
      id: message.id._serialized,
      chatKey,
      phone,
      contactName: message._data?.notifyName || null,
      text: message.type === 'chat' ? message.body : null,
      type: message.type,
    })
    for (const text of replies) {
      // A short human-like pause between messages
      await sleep(700 + Math.random() * 1300)
      await client.sendMessage(from, text)
    }
  } finally {
    await chat.clearState().catch(() => {})
  }
}

// One queue per chat, so a customer's quick messages are answered in order
const queues = new Map()
client.on('message', (message) => {
  const previous = queues.get(message.from) ?? Promise.resolve()
  const next = previous
    .then(() => handleMessage(message))
    .catch((error) => console.error('Message handling failed:', error))
  queues.set(message.from, next)
  next.finally(() => {
    if (queues.get(message.from) === next) queues.delete(message.from)
  })
})

const authorized = (req, url) => {
  const header = req.headers.authorization || ''
  const given = header.startsWith('Bearer ') ? header.slice(7) : url.searchParams.get('token') || ''
  const a = Buffer.from(given)
  const b = Buffer.from(SECRET)
  return a.length === b.length && timingSafeEqual(a, b)
}

const send = (res, status, body, type = 'application/json') => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' })
  res.end(type === 'application/json' ? JSON.stringify(body) : body)
}

/** Staff replies from the admin inbox: `to` is the chat key the app stores */
async function sendStaffReply(to, text) {
  if (to.startsWith('lid')) return client.sendMessage(`${to.slice(3)}@lid`, text)
  const id = await client.getNumberId(to)
  if (!id) throw new Error('That number is not on WhatsApp')
  return client.sendMessage(id._serialized, text)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')

  if (url.pathname === '/health') return send(res, 200, { ready })

  if (!authorized(req, url)) return send(res, 401, { error: 'Unauthorized' })

  // For the admin's WhatsApp page: connection state, the QR to scan, and the linked number
  if (req.method === 'GET' && url.pathname === '/status') {
    return send(res, 200, {
      ready,
      qr: !ready && latestQr ? await QRCode.toDataURL(latestQr, { width: 320, margin: 2 }) : null,
      number: ready ? client.info?.wid?.user ?? null : null,
    })
  }

  // Unlinks the number; the restart then shows a fresh QR for another phone
  if (req.method === 'POST' && url.pathname === '/logout') {
    send(res, 200, { ok: true })
    await client.logout().catch((error) => console.error('Logout failed:', error))
    process.exit(1)
  }

  if (req.method === 'GET' && url.pathname === '/qr') {
    const body = ready
      ? '<h1>Conectado ✅</h1><p>WhatsApp ya está vinculado. Puedes cerrar esta página.</p>'
      : latestQr
        ? `<h1>Escanea con WhatsApp</h1><p>WhatsApp → Dispositivos vinculados → Vincular un dispositivo</p><img alt="QR" src="${await QRCode.toDataURL(latestQr, { width: 320, margin: 2 })}"><p>Se actualiza sola.</p>`
        : '<h1>Iniciando…</h1><p>Espera unos segundos.</p>'
    return send(
      res,
      200,
      `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="refresh" content="15"><title>WhatsApp</title><body style="font-family:system-ui;text-align:center;padding:24px">${body}</body>`,
      'text/html; charset=utf-8'
    )
  }

  if (req.method === 'POST' && url.pathname === '/send') {
    if (!ready) return send(res, 503, { error: 'WhatsApp is not connected' })
    let raw = ''
    for await (const chunk of req) {
      raw += chunk
      if (raw.length > 20_000) return send(res, 413, { error: 'Too large' })
    }
    let body
    try {
      body = JSON.parse(raw)
    } catch {
      return send(res, 400, { error: 'Invalid JSON' })
    }
    const to = typeof body?.to === 'string' ? body.to : ''
    const text = typeof body?.text === 'string' ? body.text.trim() : ''
    if (!/^(lid)?\d{6,17}$/.test(to) || !text || text.length > 4000) return send(res, 400, { error: 'Invalid message' })
    try {
      const sent = await sendStaffReply(to, text)
      return send(res, 200, { id: sent?.id?._serialized ?? null })
    } catch (error) {
      console.error('Staff reply failed:', error)
      return send(res, 502, { error: error?.message || 'Send failed' })
    }
  }

  return send(res, 404, { error: 'Not found' })
})

server.listen(PORT, () => console.log(`Worker listening on ${PORT}`))
client.initialize().catch((error) => {
  // Railway restarts the service, which tries again
  console.error('WhatsApp failed to start:', error)
  process.exit(1)
})

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, async () => {
    console.log(`${signal}: closing WhatsApp`)
    await client.destroy().catch(() => {})
    process.exit(0)
  })
}
