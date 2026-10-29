import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { findDiscount } from '@/lib/checkout/prepare-order'

// Best-effort throttle per IP so codes can't be guessed in bulk (each serverless instance keeps its own window)
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 15
const hits = new Map<string, number[]>()

function throttled(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

/**
 * Checks a coupon from the checkout modal and returns its rule for the live preview.
 * The payment routes check it again and compute the amount actually charged.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (throttled(ip)) {
    return NextResponse.json({ error: 'Demasiados intentos. Prueba en unos minutos.' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const code = typeof body?.code === 'string' ? body.code : ''
  const subtotal = typeof body?.subtotal === 'number' && Number.isFinite(body.subtotal) ? Math.max(0, body.subtotal) : 0
  const phone = typeof body?.phone === 'string' ? body.phone.replace(/\D/g, '').slice(0, 10) || null : null

  try {
    const session = await auth()
    const found = await findDiscount(code, { subtotal, userId: session?.user?.id ?? null, phone })
    if ('error' in found) return NextResponse.json({ error: found.error }, { status: found.status })
    return NextResponse.json({ discount: found.rule })
  } catch (error) {
    console.error('Discount check failed:', error)
    return NextResponse.json({ error: 'No pudimos revisar el código. Intenta de nuevo.' }, { status: 500 })
  }
}
