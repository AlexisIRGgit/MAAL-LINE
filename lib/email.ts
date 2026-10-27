import { prisma } from '@/lib/db'

/**
 * Transactional email through Resend's REST API (https://resend.com/docs/api-reference).
 * RESEND_API_KEY turns it on; EMAIL_FROM must be on a domain verified in Resend.
 * Every send is recorded in email_logs. Never throws, so callers can't break a checkout.
 */

const DEFAULT_FROM = 'MAAL LINE <contacto@maalline.com>'

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
  /** Short key for email_logs, e.g. "order_shipped" */
  type: string
  userId?: string | null
  replyTo?: string
  reference?: { type: string; id: string }
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false

  let providerMessageId: string | null = null
  let errorMessage: string | null = null
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || DEFAULT_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    })
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string }
    if (!res.ok) throw new Error(data.message || `Resend responded ${res.status}`)
    providerMessageId = data.id ?? null
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Email "${input.type}" to ${input.to} failed:`, errorMessage)
  }

  try {
    await prisma.emailLog.create({
      data: {
        userId: input.userId ?? null,
        email: input.to,
        type: input.type,
        subject: input.subject.slice(0, 255),
        status: errorMessage ? 'failed' : 'sent',
        provider: 'resend',
        providerMessageId,
        referenceType: input.reference?.type ?? null,
        referenceId: input.reference?.id ?? null,
        errorMessage,
      },
    })
  } catch (error) {
    console.error('Email log failed:', error)
  }

  return !errorMessage
}
