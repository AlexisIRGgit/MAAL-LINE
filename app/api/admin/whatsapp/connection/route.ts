import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { callWorker, whatsappTransport } from '@/lib/whatsapp/transport'

export const dynamic = 'force-dynamic'

/** Link state of the whatsapp-web.js worker, with the QR to scan while unlinked */
export async function GET() {
  try {
    await requirePermission('settings:edit')
    if (whatsappTransport() !== 'webjs') return NextResponse.json({ transport: 'cloud' })
    try {
      return NextResponse.json({ transport: 'webjs', ...(await callWorker('/status')) })
    } catch (error) {
      console.error('WhatsApp worker status failed:', error)
      return NextResponse.json({ transport: 'webjs', unreachable: true })
    }
  } catch (error) {
    return handleAuthError(error)
  }
}

/** Unlinks the current number so another phone can scan a new QR */
export async function POST(request: NextRequest) {
  try {
    await requirePermission('settings:edit')
    const body = (await request.json().catch(() => null)) as { action?: unknown } | null
    if (whatsappTransport() !== 'webjs' || body?.action !== 'logout') {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
    }
    await callWorker('/logout')
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('WhatsApp')) {
      return NextResponse.json({ error: 'No se pudo hablar con el servidor de WhatsApp' }, { status: 502 })
    }
    return handleAuthError(error)
  }
}
