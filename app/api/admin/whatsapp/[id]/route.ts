import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { hasReplyWindow, sendStaffMessage } from '@/lib/whatsapp/transport'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Outside this window WhatsApp only allows paid, pre-approved templates */
const REPLY_WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * Staff actions on a chat: `reply` (also takes it over from the bot),
 * `takeover` (silences the bot) and `release` (hands it back to the bot).
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePermission('orders:process')
    if (!UUID_RE.test(params.id)) return NextResponse.json({ error: 'Conversación no válida' }, { status: 400 })

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const action = body?.action
    const conversation = await prisma.whatsAppConversation.findUnique({ where: { id: params.id } })
    if (!conversation) return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })

    if (action === 'release' || action === 'takeover') {
      const updated = await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data:
          action === 'release'
            ? { status: 'bot', handoffReason: null, handoffAt: null }
            : { status: 'human', handoffReason: 'Atendido por el equipo', handoffAt: new Date() },
      })
      return NextResponse.json({ status: updated.status })
    }

    if (action === 'reply') {
      const text = typeof body?.text === 'string' ? body.text.trim() : ''
      if (!text || text.length > 4000) return NextResponse.json({ error: 'Escribe un mensaje de hasta 4000 caracteres' }, { status: 400 })
      const windowClosed = !conversation.lastInboundAt || Date.now() - conversation.lastInboundAt.getTime() > REPLY_WINDOW_MS
      if (hasReplyWindow() && windowClosed) {
        return NextResponse.json(
          { error: 'Pasaron más de 24 horas desde el último mensaje del cliente; WhatsApp ya no permite responder con texto libre.' },
          { status: 409 }
        )
      }

      const waMessageId = await sendStaffMessage(conversation.phone, text)
      const [message] = await prisma.$transaction([
        prisma.whatsAppMessage.create({
          data: { conversationId: conversation.id, waMessageId, author: 'staff', body: text },
          select: { id: true, author: true, body: true, createdAt: true },
        }),
        // A person answering means the bot should stay out of the chat
        prisma.whatsAppConversation.update({
          where: { id: conversation.id },
          data: conversation.status === 'human' ? {} : { status: 'human', handoffReason: 'Atendido por el equipo', handoffAt: new Date() },
        }),
      ])
      return NextResponse.json({ message })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('WhatsApp')) {
      console.error('WhatsApp staff reply failed:', error)
      return NextResponse.json({ error: 'WhatsApp no aceptó el mensaje. Revisa la configuración del número.' }, { status: 502 })
    }
    return handleAuthError(error)
  }
}
