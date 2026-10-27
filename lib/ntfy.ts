/**
 * Push notifications to the store owner through ntfy (https://ntfy.sh).
 * NTFY_TOPIC_URL is the full topic URL, e.g. https://ntfy.sh/maal-pedidos-8f3k2x9q.
 * Anyone who knows a public topic name can read it, so keep it long and out of the code.
 * Optional NTFY_TOKEN for protected topics or a self-hosted server.
 */

type NtfyMessage = {
  title: string
  message: string
  tags?: string[]
  priority?: 1 | 2 | 3 | 4 | 5
  /** Opens when the notification is tapped */
  click?: string
}

export function isNtfyConfigured(): boolean {
  return !!process.env.NTFY_TOPIC_URL
}

/** Sends one notification; returns false instead of throwing so callers never break */
export async function sendNtfy(msg: NtfyMessage): Promise<boolean> {
  const topicUrl = process.env.NTFY_TOPIC_URL
  if (!topicUrl) return false

  try {
    const url = new URL(topicUrl)
    const topic = url.pathname.replace(/^\/+|\/+$/g, '')
    if (!topic) throw new Error('NTFY_TOPIC_URL has no topic')

    // JSON publishing keeps accents and emoji intact (HTTP headers can't carry them)
    const res = await fetch(url.origin, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NTFY_TOKEN ? { Authorization: `Bearer ${process.env.NTFY_TOKEN}` } : {}),
      },
      body: JSON.stringify({ topic, ...msg }),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) throw new Error(`ntfy responded ${res.status}`)
    return true
  } catch (error) {
    console.error('ntfy notification failed:', error)
    return false
  }
}
