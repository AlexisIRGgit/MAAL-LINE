import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { cloudChannel, isValidSignature, parseInboundMessages } from '@/lib/whatsapp/cloud-api'
import { handleInboundMessage } from '@/lib/whatsapp/bot'
import { maalWhatsAppBusiness } from '@/lib/whatsapp/maal-business'
import { createAnthropicProvider } from '@/lib/agent/anthropic-provider'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// The reply runs after the 200 (waitUntil) and can take several model calls
export const maxDuration = 60

const sameText = (a: string, b: string) => {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

/** Meta's verification handshake when the webhook URL is saved */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const expected = process.env.WHATSAPP_VERIFY_TOKEN
  const token = params.get('hub.verify_token') ?? ''
  const challenge = params.get('hub.challenge') ?? ''

  if (params.get('hub.mode') === 'subscribe' && expected && sameText(token, expected)) {
    return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

/** Incoming messages; answered with 200 right away so Meta doesn't retry, then handled in the background */
export async function POST(request: NextRequest) {
  // The signature covers the exact bytes, so read the body as text before parsing it
  const rawBody = await request.text()
  if (!isValidSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 })
  }

  const messages = parseInboundMessages(payload)
  if (messages.length > 0) {
    const provider = createAnthropicProvider()
    waitUntil(
      (async () => {
        // One at a time, so a customer's quick messages are answered in order
        for (const message of messages) {
          await handleInboundMessage(message, maalWhatsAppBusiness, provider, cloudChannel).catch((error) =>
            console.error('WhatsApp message handling failed:', error)
          )
        }
      })()
    )
  }

  return NextResponse.json({ received: true })
}
