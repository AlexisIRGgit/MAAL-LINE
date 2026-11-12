import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * WhatsApp Cloud API (Meta's official API): webhook signature, payload parsing and sending.
 * Nothing here knows about the business, so the same file serves any bot.
 *
 * Env: WHATSAPP_APP_SECRET (signature), WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID (sending),
 * optional WHATSAPP_GRAPH_VERSION.
 */

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0'
/** WhatsApp rejects text bodies over 4096 characters */
const MAX_TEXT_LENGTH = 4096

/** Checks X-Hub-Signature-256 (HMAC-SHA256 of the raw body with the app secret) in constant time */
export function isValidSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET
  if (!secret || !header?.startsWith('sha256=')) return false
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest()
  const received = Buffer.from(header.slice('sha256='.length), 'hex')
  return received.length === expected.length && timingSafeEqual(received, expected)
}

export type InboundMessage = {
  /** WhatsApp message id, used to drop retried webhooks */
  id: string
  /** Sender in E.164 digits without the plus */
  from: string
  contactName: string | null
  /** The text, or null for media and other types the bot can't read */
  text: string | null
  /** e.g. text, image, audio */
  type: string
}

type Obj = Record<string, unknown>
const obj = (v: unknown): Obj | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : null)
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null)

/** Pulls customer messages out of a webhook payload; delivery/read statuses are skipped */
export function parseInboundMessages(payload: unknown): InboundMessage[] {
  const root = obj(payload)
  if (root?.object !== 'whatsapp_business_account') return []

  const messages: InboundMessage[] = []
  for (const entry of arr(root.entry)) {
    for (const change of arr(obj(entry)?.changes)) {
      const value = obj(obj(change)?.value)
      if (!value) continue
      const names = new Map<string, string>()
      for (const contact of arr(value.contacts)) {
        const waId = str(obj(contact)?.wa_id)
        const name = str(obj(obj(contact)?.profile)?.name)
        if (waId && name) names.set(waId, name)
      }
      for (const raw of arr(value.messages)) {
        const m = obj(raw)
        const id = str(m?.id)
        const from = str(m?.from)
        const type = str(m?.type) ?? 'unknown'
        if (!m || !id || !from || !/^\d{6,20}$/.test(from)) continue
        const interactive = obj(m.interactive)
        const text =
          str(obj(m.text)?.body) ??
          str(obj(interactive?.button_reply)?.title) ??
          str(obj(interactive?.list_reply)?.title) ??
          str(obj(m.button)?.text)
        messages.push({ id, from, contactName: names.get(from) ?? null, text, type })
      }
    }
  }
  return messages
}

async function graphPost(body: Obj): Promise<Obj> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneNumberId) throw new Error('WhatsApp is not configured (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID)')

  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...body }),
    signal: AbortSignal.timeout(10_000),
  })
  const data = (await res.json().catch(() => ({}))) as Obj
  if (!res.ok) {
    const error = obj(data.error)
    throw new Error(`WhatsApp API ${res.status}: ${str(error?.message) ?? 'unknown error'}`)
  }
  return data
}

/** Sends a free-form text; only allowed within 24 hours of the customer's last message */
export async function sendText(to: string, text: string): Promise<string | null> {
  const data = await graphPost({
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: text.slice(0, MAX_TEXT_LENGTH), preview_url: true },
  })
  return str(obj(arr(data.messages)[0])?.id)
}

/** Shows the blue ticks on the customer's message; failures are ignored */
export async function markAsRead(messageId: string): Promise<void> {
  await graphPost({ status: 'read', message_id: messageId }).catch((error) =>
    console.warn('WhatsApp mark-as-read failed:', error instanceof Error ? error.message : error)
  )
}
