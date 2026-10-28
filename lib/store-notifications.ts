import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import {
  customerOrderShippedEmail,
  customerWelcomeEmail,
  formatMXN,
  ownerLowStockEmail,
  ownerDropWaitlistEmail,
  ownerNewOrderEmail,
} from '@/lib/email-templates'
import { sendNtfy } from '@/lib/ntfy'
import {
  GENERAL_SETTINGS_KEY,
  NOTIFICATION_SETTINGS_KEY,
  readGeneralSettings,
  readNotificationSettings,
  type NotificationKey,
} from '@/lib/store-settings'

/**
 * Store events -> owner push (ntfy) and emails (Resend), gated by the switches in
 * Admin > Configuración > Notificaciones. Every function swallows its own errors:
 * a failed notification must never fail a payment webhook, a signup or an order update.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://www.maalline.com').replace(/\/$/, '')

async function isEnabled(key: NotificationKey): Promise<boolean> {
  const row = await prisma.storeSetting.findUnique({ where: { key: NOTIFICATION_SETTINGS_KEY } })
  return readNotificationSettings(row?.value)[key]
}

/** Owner inbox: the contact email from Configuración > General (contacto@maalline.com) */
async function ownerEmail(): Promise<string> {
  const row = await prisma.storeSetting.findUnique({ where: { key: GENERAL_SETTINGS_KEY } })
  return readGeneralSettings(row?.value).contactEmail
}

function run(label: string, work: () => Promise<unknown>): Promise<void> {
  return work().then(
    () => undefined,
    (error) => console.error(`Notification "${label}" failed:`, error)
  )
}

/** Payment confirmed (Stripe / MercadoPago webhooks, first confirmation only) */
export function notifyOrderPaid(orderId: string, provider: 'Stripe' | 'MercadoPago'): Promise<void> {
  return run('new_order', async () => {
    if (!(await isEnabled('newOrder'))) return
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        email: true,
        total: true,
        shippingAddress: true,
        items: { select: { productName: true, variantName: true, quantity: true } },
      },
    })
    if (!order) return

    const fullName = (order.shippingAddress as { fullName?: unknown } | null)?.fullName
    const customer = typeof fullName === 'string' && fullName ? fullName : order.email
    const total = Number(order.total)
    const units = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const lines = order.items
      .slice(0, 4)
      .map((item) => `• ${item.quantity}× ${item.productName}${item.variantName ? ` (${item.variantName})` : ''}`)
    if (order.items.length > 4) lines.push(`• y ${order.items.length - 4} más`)

    const email = ownerNewOrderEmail({ orderNumber: order.orderNumber, total, customer, email: order.email, provider, items: order.items })
    await Promise.all([
      sendNtfy({
        title: `💰 Pago confirmado · ${formatMXN(total)}`,
        message: [
          `Pedido ${order.orderNumber} · ${units} ${units === 1 ? 'artículo' : 'artículos'} · ${provider}`,
          customer === order.email ? order.email : `${customer} (${order.email})`,
          ...lines,
        ].join('\n'),
        tags: ['shopping_bags'],
        priority: 4,
        click: `${SITE_URL}/admin/orders?search=${encodeURIComponent(order.orderNumber)}`,
      }),
      sendEmail({
        to: await ownerEmail(),
        ...email,
        type: 'owner_new_order',
        replyTo: order.email,
        reference: { type: 'order', id: order.id },
      }),
    ])
  })
}

/** Order moved to "shipped" in the admin: tell the customer, with tracking if there is one */
export function notifyOrderShipped(orderId: string): Promise<void> {
  return run('order_shipped', async () => {
    if (!(await isEnabled('orderShipped'))) return
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        orderNumber: true,
        email: true,
        shippingAddress: true,
        user: { select: { firstName: true } },
        items: { select: { productName: true, variantName: true, quantity: true } },
        shipments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { carrier: true, trackingNumber: true, trackingUrl: true },
        },
      },
    })
    if (!order) return

    const fullName = (order.shippingAddress as { fullName?: unknown } | null)?.fullName
    const firstName = order.user?.firstName || (typeof fullName === 'string' ? fullName.split(' ')[0] : null)
    const shipment = order.shipments[0]
    const email = customerOrderShippedEmail({
      orderNumber: order.orderNumber,
      firstName,
      items: order.items,
      carrier: shipment?.carrier ?? null,
      trackingNumber: shipment?.trackingNumber ?? null,
      trackingUrl: shipment?.trackingUrl ?? null,
    })
    await sendEmail({
      to: order.email,
      ...email,
      type: 'order_shipped',
      userId: order.userId,
      replyTo: await ownerEmail(),
      reference: { type: 'order', id: order.id },
    })
  })
}

/**
 * After a sale decremented stock: alert for variants that just crossed their
 * low-stock threshold (so each one alerts once, not on every later sale).
 */
export function notifyLowStock(sold: { variantId: string | null; quantity: number }[]): Promise<void> {
  return run('low_stock', async () => {
    const soldByVariant = new Map<string, number>()
    for (const item of sold) {
      if (item.variantId) soldByVariant.set(item.variantId, (soldByVariant.get(item.variantId) ?? 0) + item.quantity)
    }
    if (soldByVariant.size === 0 || !(await isEnabled('lowStock'))) return

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: Array.from(soldByVariant.keys()) } },
      select: {
        id: true,
        sku: true,
        size: true,
        color: true,
        stockQuantity: true,
        lowStockThreshold: true,
        product: { select: { name: true } },
      },
    })
    const crossed = variants.filter((v) => {
      const before = v.stockQuantity + (soldByVariant.get(v.id) ?? 0)
      return before > v.lowStockThreshold && v.stockQuantity <= v.lowStockThreshold
    })
    if (crossed.length === 0) return

    const items = crossed.map((v) => ({
      name: [v.product.name, [v.size, v.color].filter(Boolean).join(' / ')].filter(Boolean).join(' · '),
      sku: v.sku,
      stock: v.stockQuantity,
    }))
    const email = ownerLowStockEmail(items)
    await Promise.all([
      sendNtfy({
        title: email.subject,
        message: items.map((i) => `• ${i.name}: ${i.stock <= 0 ? 'agotado' : `quedan ${i.stock}`}`).join('\n'),
        tags: ['warning'],
        priority: 3,
        click: `${SITE_URL}/admin/inventory`,
      }),
      sendEmail({ to: await ownerEmail(), ...email, type: 'owner_low_stock' }),
    ])
  })
}

/** New customer signed up (email/password or first Google sign-in) */
export function notifyNewAccount(userId: string): Promise<void> {
  return run('new_account', async () => {
    if (!(await isEnabled('newAccount'))) return
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, authProvider: true },
    })
    if (!user) return

    const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
    const email = customerWelcomeEmail(user.firstName)
    await Promise.all([
      sendEmail({ to: user.email, ...email, type: 'welcome', userId: user.id, replyTo: await ownerEmail() }),
      sendNtfy({
        title: '👤 Nueva cuenta',
        message: `${name ? `${name} (${user.email})` : user.email}${user.authProvider === 'google' ? ' · con Google' : ''}`,
        tags: ['bust_in_silhouette'],
        priority: 2,
        click: `${SITE_URL}/admin/customers`,
      }),
    ])
  })
}

/** Someone joined the Drop 001 waitlist (first signup per email only); always on, email to the contact inbox */
export function notifyDropWaitlist(email: string, source: string): Promise<void> {
  return run('drop_waitlist', async () => {
    const [to, total] = await Promise.all([ownerEmail(), prisma.dropWaitlist.count()])
    const content = ownerDropWaitlistEmail({ email, source, total })
    await sendEmail({ to, ...content, type: 'owner_drop_waitlist', replyTo: email })
  })
}
