import { prisma } from '@/lib/db'
import { NOTIFICATION_SETTINGS_KEY, readNotificationSettings } from '@/lib/store-settings'

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

function appUrl(path: string): string | undefined {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
  return base ? new URL(path, base).toString() : undefined
}

const formatMXN = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)

/**
 * "Pago confirmado" push for a paid order. Respects the switch in
 * Admin > Configuración > Notificaciones. Never throws.
 */
export async function notifyOrderPaid(orderId: string, provider: 'Stripe' | 'MercadoPago'): Promise<void> {
  if (!isNtfyConfigured()) return
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { key: NOTIFICATION_SETTINGS_KEY } })
    if (!readNotificationSettings(setting?.value).paidOrderPush) return

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        email: true,
        total: true,
        shippingAddress: true,
        items: { select: { productName: true, variantName: true, quantity: true } },
      },
    })
    if (!order) return

    const customer = (order.shippingAddress as { fullName?: unknown } | null)?.fullName
    const units = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const lines = order.items
      .slice(0, 4)
      .map((item) => `• ${item.quantity}× ${item.productName}${item.variantName ? ` (${item.variantName})` : ''}`)
    if (order.items.length > 4) lines.push(`• y ${order.items.length - 4} más`)

    await sendNtfy({
      title: `💰 Pago confirmado · ${formatMXN(Number(order.total))}`,
      message: [
        `Pedido ${order.orderNumber} · ${units} ${units === 1 ? 'artículo' : 'artículos'} · ${provider}`,
        typeof customer === 'string' && customer ? `${customer} (${order.email})` : order.email,
        ...lines,
      ].join('\n'),
      tags: ['shopping_bags'],
      priority: 4,
      click: appUrl(`/admin/orders?search=${encodeURIComponent(order.orderNumber)}`),
    })
  } catch (error) {
    console.error('Paid order notification failed:', error)
  }
}
