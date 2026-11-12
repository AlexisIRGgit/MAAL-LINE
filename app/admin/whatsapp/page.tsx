'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, Loader2, MessageCircle, Send, UserRound } from 'lucide-react'
import { ListRowsSkeleton } from '@/components/ui/skeleton'
import { usePermissions } from '@/hooks/use-permissions'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils/cn'

type ChatMessage = { id: string; author: 'customer' | 'bot' | 'staff'; body: string; createdAt: string }
type Conversation = {
  id: string
  phone: string
  contactName: string | null
  status: 'bot' | 'human'
  handoffReason: string | null
  lastInboundAt: string | null
  updatedAt: string
  messages: ChatMessage[]
}

const POLL_MS = 10_000
const WINDOW_MS = 24 * 60 * 60 * 1000

/** Chats keyed by WhatsApp's private id (`lid…`) have no visible number */
const numberLabel = (key: string) => (key.startsWith('lid') ? 'Número oculto' : `+${key}`)

const time = (iso: string) =>
  new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(iso))

/** Inbox for the WhatsApp bot: chats waiting for a person, replies from staff, and handing chats back to the bot */
export default function AdminWhatsAppPage() {
  const { can } = usePermissions()
  const canAct = can('orders:process')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [replyWindow, setReplyWindow] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/whatsapp', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { conversations: Conversation[]; replyWindow: boolean }
      setConversations(data.conversations)
      setReplyWindow(data.replyWindow)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(() => {
      if (!document.hidden) load()
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [load])

  const selected = conversations.find((c) => c.id === selectedId) ?? null
  const lastMessageId = selected?.messages[selected.messages.length - 1]?.id

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [selectedId, lastMessageId])

  const act = async (body: Record<string, string>) => {
    if (!selected) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/whatsapp/${selected.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        toast.error('No se pudo', data.error ?? 'Intenta de nuevo')
        return
      }
      if (body.action === 'reply') setDraft('')
      if (body.action === 'release') toast.success('El bot vuelve a responder este chat')
      await load()
    } finally {
      setBusy(false)
    }
  }

  const windowOpen = !replyWindow || (!!selected?.lastInboundAt && Date.now() - new Date(selected.lastInboundAt).getTime() < WINDOW_MS)
  const waiting = conversations.filter((c) => c.status === 'human').length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">WhatsApp</h1>
        <p className="text-sm text-[#6B7280]">
          {waiting ? `${waiting} ${waiting === 1 ? 'chat espera' : 'chats esperan'} a una persona` : 'El bot está atendiendo todo'} · se
          actualiza sola
        </p>
      </div>

      {!loaded ? (
        <ListRowsSkeleton rows={4} label="Cargando chats" />
      ) : conversations.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center">
          <MessageCircle className="mx-auto mb-3 h-8 w-8 text-[#D1D5DB]" />
          <p className="font-medium text-[#374151]">Sin chats todavía</p>
          <p className="mt-1 text-sm text-[#9CA3AF]">Cuando un cliente escriba al WhatsApp de la tienda, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className={cn('space-y-1 rounded-2xl border border-[#E5E7EB] bg-white p-2', selected && 'hidden lg:block')}>
            {conversations.map((c) => {
              const last = c.messages[c.messages.length - 1]
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-[#F9FAFB]',
                    c.id === selectedId && 'bg-[#F3F4F6]'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
                      c.status === 'human' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                    )}
                  >
                    {c.status === 'human' ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-[#111827]">{c.contactName || numberLabel(c.phone)}</span>
                      <span className="flex-shrink-0 text-[11px] text-[#9CA3AF]">{time(c.updatedAt)}</span>
                    </span>
                    <span className="block truncate text-xs text-[#6B7280]">
                      {c.status === 'human' ? `Espera a una persona · ${c.handoffReason ?? ''}` : last?.body}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {selected ? (
            <div className="flex min-h-[60vh] flex-col rounded-2xl border border-[#E5E7EB] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] p-4">
                <div className="min-w-0">
                  <button type="button" onClick={() => setSelectedId(null)} className="mb-1 text-xs text-[#6B7280] lg:hidden">
                    ← Chats
                  </button>
                  <p className="truncate font-semibold text-[#111827]">{selected.contactName || numberLabel(selected.phone)}</p>
                  <p className="text-xs text-[#6B7280]">
                    {numberLabel(selected.phone)} · {selected.status === 'human' ? 'Lo atiende el equipo; el bot no responde' : 'Lo atiende el bot'}
                  </p>
                </div>
                {canAct && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => act({ action: selected.status === 'human' ? 'release' : 'takeover' })}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50"
                  >
                    {selected.status === 'human' ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                    {selected.status === 'human' ? 'Devolver al bot' : 'Atender yo'}
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-4" style={{ maxHeight: '60vh' }}>
                {selected.messages.map((m) => (
                  <div key={m.id} className={cn('flex', m.author === 'customer' ? 'justify-start' : 'justify-end')}>
                    <div
                      className={cn(
                        'max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm',
                        m.author === 'customer' ? 'bg-[#F3F4F6] text-[#111827]' : m.author === 'bot' ? 'bg-green-50 text-[#111827]' : 'bg-[#111827] text-white'
                      )}
                    >
                      {m.body}
                      <span className={cn('mt-1 block text-[10px]', m.author === 'staff' ? 'text-white/60' : 'text-[#9CA3AF]')}>
                        {m.author === 'bot' ? 'Bot · ' : m.author === 'staff' ? 'Equipo · ' : ''}
                        {time(m.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {canAct && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (draft.trim()) act({ action: 'reply', text: draft })
                  }}
                  className="border-t border-[#E5E7EB] p-3"
                >
                  {windowOpen ? (
                    <div className="flex items-end gap-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={2}
                        maxLength={4000}
                        placeholder="Escribe tu respuesta…"
                        className="min-w-0 flex-1 resize-none rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10"
                      />
                      <button
                        type="submit"
                        disabled={busy || !draft.trim()}
                        aria-label="Enviar"
                        className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#111827] text-white disabled:opacity-40"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-[#6B7280]">
                      Pasaron más de 24 horas desde el último mensaje del cliente, así que WhatsApp no permite contestarle con texto libre.
                      Cuando vuelva a escribir, podrás responder aquí.
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-[#9CA3AF]">Al responder, el bot deja de contestar este chat hasta que lo devuelvas.</p>
                </form>
              )}
            </div>
          ) : (
            <div className="hidden items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] p-10 text-sm text-[#9CA3AF] lg:flex">
              Elige un chat
            </div>
          )}
        </div>
      )}
    </div>
  )
}
