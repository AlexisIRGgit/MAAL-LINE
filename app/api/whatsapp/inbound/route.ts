import { NextRequest, NextResponse } from 'next/server'
import { handleInboundMessage, type Channel } from '@/lib/whatsapp/bot'
import { maalWhatsAppBusiness } from '@/lib/whatsapp/maal-business'
import { createAnthropicProvider } from '@/lib/agent/anthropic-provider'
import { isWorkerRequest, whatsappTransport } from '@/lib/whatsapp/transport'
import type { InboundMessage } from '@/lib/whatsapp/cloud-api'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const str = (v: unknown, max: number) => (typeof v === 'string' && v.length > 0 && v.length <= max ? v : null)

/**
 * Messages from the whatsapp-web.js worker. The worker only moves messages; this runs the
 * same bot as the Cloud API webhook and hands back the replies for the worker to send.
 */
export async function POST(request: NextRequest) {
  if (whatsappTransport() !== 'webjs') return NextResponse.json({ error: 'Not enabled' }, { status: 404 })
  if (!isWorkerRequest(request.headers.get('authorization'))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const id = str(body?.id, 150)
  const chatKey = str(body?.chatKey, 20)
  const phone = body?.phone === null ? null : str(body?.phone, 15)
  if (!id || !chatKey || !/^(lid)?\d{6,17}$/.test(chatKey) || (phone !== null && !/^\d{8,15}$/.test(phone))) {
    return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
  }

  const message: InboundMessage = {
    id,
    from: chatKey,
    phone,
    contactName: str(body?.contactName, 120),
    text: str(body?.text, 4096),
    type: str(body?.type, 30) ?? 'unknown',
  }

  // Replies are collected and returned; the worker sends them
  const replies: string[] = []
  const channel: Channel = {
    send: async (_to, text) => {
      replies.push(text)
      return null
    },
    markRead: async () => {},
  }

  try {
    await handleInboundMessage(message, maalWhatsAppBusiness, createAnthropicProvider(), channel)
    return NextResponse.json({ replies })
  } catch (error) {
    console.error('WhatsApp inbound (worker) failed:', error)
    return NextResponse.json({ error: 'Internal error', replies }, { status: 500 })
  }
}
