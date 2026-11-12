import { NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { hasReplyWindow } from '@/lib/whatsapp/transport'

export const dynamic = 'force-dynamic'

/** WhatsApp chats for the admin inbox: the ones waiting for a person first, then the most recent */
export async function GET() {
  try {
    await requirePermission('customers:view')

    const conversations = await prisma.whatsAppConversation.findMany({
      orderBy: [{ status: 'desc' }, { updatedAt: 'desc' }],
      take: 50,
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 40, select: { id: true, author: true, body: true, createdAt: true } },
      },
    })

    return NextResponse.json({
      replyWindow: hasReplyWindow(),
      conversations: conversations.map(({ messages, ...conversation }) => ({
        ...conversation,
        messages: messages.reverse(),
      })),
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
