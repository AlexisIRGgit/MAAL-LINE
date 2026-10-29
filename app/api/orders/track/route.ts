import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { TRACKED_ORDER_SELECT, serializeTrackedOrder } from '@/lib/orders/tracked-order'

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
      select: TRACKED_ORDER_SELECT,
    })
    if (!order || !order.phone || !order.phone.replace(/\D/g, '').endsWith(last4)) {
      return NextResponse.json(NOT_FOUND, { status: 404 })
    }
    if (order.userId) {
      return NextResponse.json({ error: 'Este pedido se hizo con una cuenta. Inicia sesión para verlo en Mis pedidos.', account: true }, { status: 403 })
    }

    return NextResponse.json({ order: await serializeTrackedOrder(order) })
  } catch (error) {
    console.error('Order tracking failed:', error)
    return NextResponse.json({ error: 'No pudimos buscar tu pedido. Intenta de nuevo.' }, { status: 500 })
  }
}
