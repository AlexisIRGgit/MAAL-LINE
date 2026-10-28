import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SOURCES = ['home', 'drop'] as const

// Best-effort throttle per IP (each serverless instance keeps its own window)
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 8
const hits = new Map<string, number[]>()

function throttled(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

/** Adds an email to the Drop 001 waitlist. Signing up twice is not an error. */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (throttled(ip)) {
    return NextResponse.json({ error: 'Demasiados intentos. Prueba en unos minutos.' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  // Honeypot field: real visitors never fill it
  if (body?.website) return NextResponse.json({ ok: true, already: false })

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email) || email.length > 255) {
    return NextResponse.json({ error: 'Escribe un correo válido.' }, { status: 400 })
  }
  const source = SOURCES.find((s) => s === body?.source) ?? 'home'

  try {
    const session = await auth()
    const existing = await prisma.dropWaitlist.findUnique({ where: { email }, select: { id: true } })
    if (existing) return NextResponse.json({ ok: true, already: true })

    await prisma.dropWaitlist.create({
      data: { email, source, userId: session?.user?.id ?? null },
    })
    return NextResponse.json({ ok: true, already: false })
  } catch (error) {
    // A concurrent signup with the same email hits the unique index
    if ((error as { code?: string }).code === 'P2002') return NextResponse.json({ ok: true, already: true })
    console.error('Drop waitlist signup failed:', error)
    return NextResponse.json({ error: 'No pudimos guardarte. Intenta de nuevo.' }, { status: 500 })
  }
}
