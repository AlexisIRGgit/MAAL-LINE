import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { AgentError, type AgentProvider, type AgentTool, type ChatTurn } from '@/lib/agent/types'
import type { InboundMessage } from '@/lib/whatsapp/cloud-api'

/**
 * Business-neutral WhatsApp bot: stores the chat, drops retried webhooks, runs the agent
 * and answers. Everything specific to a business comes in through `BotBusiness`.
 */

/** How replies leave: the Cloud API, or a whatsapp-web.js worker that sends them itself */
export type Channel = {
  /** Sends to the chat key; returns WhatsApp's message id when known */
  send: (to: string, text: string) => Promise<string | null>
  markRead: (messageId: string) => Promise<void>
}

/** Who is writing; tools bind to this, never to ids the model sends */
export type CustomerContext = {
  /** E.164 digits without the plus, as verified by WhatsApp; null when the channel couldn't tell */
  phone: string | null
  contactName: string | null
  conversationId: string
}

export type BotBusiness = {
  systemPrompt: () => Promise<string> | string
  buildTools: (ctx: CustomerContext) => AgentTool[]
  /** Tells staff a chat needs a person; errors are logged, never shown to the customer */
  onHandoff: (ctx: CustomerContext, reason: string) => Promise<void>
  replies: {
    /** For audio, images and anything else that isn't text */
    unsupported: string
    /** When the agent fails; the chat is handed to a person at the same time */
    failure: string
    /** When the model declines for safety reasons */
    refused: string
  }
}

/** Only the latest messages go to the model, which keeps every reply cheap */
const HISTORY_LIMIT = 20
const MAX_AGENT_STEPS = 6

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'

async function findOrCreateConversation(message: InboundMessage) {
  const data = { lastInboundAt: new Date(), ...(message.contactName ? { contactName: message.contactName.slice(0, 120) } : {}) }
  const upsert = () =>
    prisma.whatsAppConversation.upsert({
      where: { phone: message.from },
      create: { phone: message.from, ...data },
      update: data,
    })
  // Two first messages arriving together can race on the unique phone; the second try finds the row
  return upsert().catch((error) => (isUniqueViolation(error) ? upsert() : Promise.reject(error)))
}

async function reply(channel: Channel, conversationId: string, to: string, text: string) {
  const waMessageId = await channel.send(to, text)
  await prisma.whatsAppMessage.create({ data: { conversationId, waMessageId, author: 'bot', body: text } })
}

/** Marks the chat for a person; the bot stays quiet in it until staff hand it back */
async function handOff(business: BotBusiness, ctx: CustomerContext, reason: string) {
  await prisma.whatsAppConversation.update({
    where: { id: ctx.conversationId },
    data: { status: 'human', handoffReason: reason.slice(0, 500), handoffAt: new Date() },
  })
  await business.onHandoff(ctx, reason).catch((error) => console.error('WhatsApp handoff notification failed:', error))
}

function handoffTool(business: BotBusiness, ctx: CustomerContext, onDone: () => void): AgentTool {
  return {
    name: 'handoffToHuman',
    description:
      'Pasa la conversación a una persona del equipo. Úsala cuando el cliente pida hablar con alguien, cuando tenga una queja, un problema con un pago o un pedido que no puedes resolver, o cuando no tengas la información para ayudarle. Después de usarla, despídete diciendo que alguien del equipo le va a responder por este chat.',
    inputSchema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Resumen breve de lo que necesita el cliente, para el equipo' },
      },
      required: ['reason'],
      additionalProperties: false,
    },
    async run(input) {
      const reason = typeof input.reason === 'string' && input.reason.trim() ? input.reason.trim() : 'El cliente pidió hablar con una persona'
      await handOff(business, ctx, reason)
      onDone()
      return JSON.stringify({ ok: true, note: 'La conversación ya está con el equipo; el bot no responderá más mensajes en este chat.' })
    },
  }
}

async function loadHistory(conversationId: string): Promise<ChatTurn[]> {
  const rows = await prisma.whatsAppMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_LIMIT,
    select: { author: true, body: true },
  })
  const turns = rows.reverse().map((row): ChatTurn => ({ role: row.author === 'customer' ? 'user' : 'assistant', text: row.body }))
  // The model needs the conversation to start with the customer
  while (turns.length > 0 && turns[0].role === 'assistant') turns.shift()
  return turns
}

/** Handles one customer message end to end; safe to call again for a webhook Meta retries */
export async function handleInboundMessage(
  message: InboundMessage,
  business: BotBusiness,
  provider: AgentProvider,
  channel: Channel
): Promise<void> {
  const conversation = await findOrCreateConversation(message)

  try {
    await prisma.whatsAppMessage.create({
      data: {
        conversationId: conversation.id,
        waMessageId: message.id,
        author: 'customer',
        body: message.text ?? `[${message.type}]`,
      },
    })
  } catch (error) {
    if (isUniqueViolation(error)) return // Already handled: Meta retried the webhook
    throw error
  }

  await channel.markRead(message.id)
  if (conversation.status === 'human') return

  const ctx: CustomerContext = { phone: message.phone, contactName: conversation.contactName, conversationId: conversation.id }

  if (!message.text) {
    await reply(channel, conversation.id, message.from, business.replies.unsupported)
    return
  }

  let handedOff = false
  try {
    const tools = [...business.buildTools(ctx), handoffTool(business, ctx, () => (handedOff = true))]
    const result = await provider.run({
      system: await business.systemPrompt(),
      history: await loadHistory(conversation.id),
      tools,
      maxSteps: MAX_AGENT_STEPS,
    })
    await reply(channel, conversation.id, message.from, result.kind === 'reply' ? result.text : business.replies.refused)
  } catch (error) {
    console.error('WhatsApp agent failed:', error)
    const reason = error instanceof AgentError ? error.message : 'Error interno del bot'
    if (!handedOff) await handOff(business, ctx, `El bot falló al responder (${reason})`).catch((e) => console.error(e))
    await reply(channel, conversation.id, message.from, business.replies.failure).catch((e) =>
      console.error('WhatsApp failure reply failed:', e)
    )
  }
}
