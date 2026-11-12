import { timingSafeEqual } from 'node:crypto'
import { sendText } from '@/lib/whatsapp/cloud-api'

/**
 * Which WhatsApp connection is live. 'cloud' is Meta's official API (default);
 * 'webjs' is the whatsapp-web.js worker in /whatsapp-worker, meant only for trials.
 *
 * Env for 'webjs': WHATSAPP_TRANSPORT=webjs, WHATSAPP_WORKER_URL, WHATSAPP_WORKER_SECRET.
 */
export const whatsappTransport = (): 'cloud' | 'webjs' => (process.env.WHATSAPP_TRANSPORT === 'webjs' ? 'webjs' : 'cloud')

/** The Cloud API only allows free-form text within 24 hours of the customer's last message */
export const hasReplyWindow = () => whatsappTransport() === 'cloud'

/** Worker address and secret, forgiving stray spaces, a missing https:// or a trailing slash */
function workerConfig(): { base: string; secret: string } {
  const rawUrl = (process.env.WHATSAPP_WORKER_URL ?? '').trim().replace(/^["']|["']$/g, '')
  const secret = (process.env.WHATSAPP_WORKER_SECRET ?? '').trim()
  if (!rawUrl || !secret) throw new Error('WhatsApp worker is not configured (WHATSAPP_WORKER_URL / WHATSAPP_WORKER_SECRET)')
  const withScheme = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
  return { base: withScheme.replace(/\/+$/, ''), secret }
}

/** Constant-time check of the shared secret between the app and the worker */
export function isWorkerRequest(authorization: string | null): boolean {
  const secret = (process.env.WHATSAPP_WORKER_SECRET ?? '').trim()
  if (secret.length < 32 || !authorization?.startsWith('Bearer ')) return false
  const given = Buffer.from(authorization.slice('Bearer '.length))
  const expected = Buffer.from(secret)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/** Sends a staff reply through whichever connection is live */
export async function sendStaffMessage(chatKey: string, text: string): Promise<string | null> {
  if (whatsappTransport() === 'cloud') return sendText(chatKey, text)

  const { base, secret } = workerConfig()
  const res = await fetch(`${base}/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: chatKey, text }),
    signal: AbortSignal.timeout(20_000),
  })
  const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string }
  if (!res.ok) throw new Error(`WhatsApp worker ${res.status}: ${data.error ?? 'unknown error'}`)
  return typeof data.id === 'string' ? data.id : null
}

export type WorkerStatus = { ready: boolean; qr: string | null; number: string | null }

/** Calls the worker's admin endpoints (/status, /logout) with the shared secret */
export async function callWorker(path: '/status' | '/logout'): Promise<WorkerStatus | { ok: boolean }> {
  const { base, secret } = workerConfig()
  const res = await fetch(`${base}${path}`, {
    method: path === '/status' ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${secret}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`WhatsApp worker ${res.status}`)
  return res.json()
}

/** Host the app is trying to reach, for setup messages (never includes the secret) */
export function workerHost(): string | null {
  try {
    return new URL(workerConfig().base).host
  } catch {
    return null
  }
}
