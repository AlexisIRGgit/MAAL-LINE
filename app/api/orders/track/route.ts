import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPublicStoreSettings } from '@/lib/public-store-settings'

// Best-effort throttle per IP so order numbers can't be guessed in bulk (each serverless instance keeps its own window)
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 12
const hits = new Map<string, number[]>()

function throttled(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

const ORDER_RE = /^ML-[A-Z0-9]{4,12}-[A-Z0-9_-]{4}$/
// Same answer for a wrong number and a wrong phone, so neither can be probed on its own
const NOT_FOUND = { error: 'No encontramos un pedido con esos datos. Revisa el número y tu teléfono.' }

/**
 * Guest order lookup for /rastrear. Needs the order number plus the last 4 digits of the
 * phone given at checkout. Orders placed from an account are only shown inside that account.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (throttled(ip)) {
    return NextResponse.json({ error: 'Demasiados intentos. Prueba en unos minutos.' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const orderNumber = typeof body?.orderNumber === 'string' ? body.orderNumber.trim().toUpperCase().slice(0, 30) : ''
  const last4 = typeof body?.phoneLast4 === 'string' ? body.phoneLast4.replace(/\D/g, '').slice(0, 4) : ''
  if (!ORDER_RE.test(orderNumber)) return NextResponse.json({ error: 'Escribe tu número de pedido completo, por ejemplo ML-ABC123-XY12.' }, { status: 400 })
  if (last4.length !== 4) return NextResponse.json({ error: 'Escribe los últimos 4 dígitos de tu teléfono.' }, { status: 400 })

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        userId: true,
        email: true,
        phone: true,
        status: true,
        paymentStatus: true,
        subtotal: true,
        shippingTotal: true,
        discountTotal: true,
        total: true,
        discountCode: true,
        shippingMethod: true,
        shippingAddress: true,
        createdAt: true,
        shippedAt: true,
        deliveredAt: true,
        items: {
          select: { productName: true, variantName: true, quantity: true, unitPrice: true, total: true, product: { select: { slug: true } } },
        },
        shipments: { orderBy: { createdAt: 'desc' }, take: 1, select: { carrier: true, trackingNumber: true, trackingUrl: true } },
      },
    })
    if (!order || !order.phone || !order.phone.replace(/\D/g, '').endsWith(last4)) {
      return NextResponse.json(NOT_FOUND, { status: 404 })
    }
    if (order.userId) {
      return NextResponse.json({ error: 'Este pedido se hizo con una cuenta. Inicia sesión para verlo en Mis pedidos.', account: true }, { status: 403 })
    }

    const { shipping } = await getPublicStoreSettings()
    const method = shipping.methods.find((m) => m.id === order.shippingMethod)
    const address = (order.shippingAddress ?? {}) as Record<string, unknown>
    const str = (key: string) => (typeof address[key] === 'string' ? (address[key] as string) : null)
    const num = (key: string) => (typeof address[key] === 'number' ? (address[key] as number) : null)

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        email: order.email || null,
        subtotal: Number(order.subtotal),
        shippingTotal: Number(order.shippingTotal),
        discountTotal: Number(order.discountTotal),
        total: Number(order.total),
        discountCode: order.discountCode,
        shippingMethod: method ? { name: method.name, description: method.description } : null,
        items: order.items.map((item) => ({
          name: item.productName,
          variant: item.variantName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
          slug: item.product?.slug ?? null,
        })),
        shipment: order.shipments[0] ?? null,
        address: {
          fullName: str('fullName'),
          phone: str('phone') ?? order.phone,
          streetLine1: str('streetLine1'),
          streetLine2: str('streetLine2'),
          neighborhood: str('neighborhood'),
          city: str('city'),
          state: str('state'),
          postalCode: str('postalCode'),
          latitude: num('latitude'),
          longitude: num('longitude'),
        },
      },
    })
  } catch (error) {
    console.error('Order tracking failed:', error)
    return NextResponse.json({ error: 'No pudimos buscar tu pedido. Intenta de nuevo.' }, { status: 500 })
  }
}
