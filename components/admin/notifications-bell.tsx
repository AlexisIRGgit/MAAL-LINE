'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { AlertTriangle, Bell, CheckCheck, Package, Sparkles, UserPlus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { toast } from '@/lib/toast'

export interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  actionUrl: string | null
  readAt: string | null
  createdAt: string
}

/** Checks for new notifications this often while the tab is visible (Vercel functions can't hold sockets open) */
const POLL_MS = 15_000

export const NOTIFICATION_STYLES: Record<string, { icon: LucideIcon; tile: string }> = {
  new_order: { icon: Package, tile: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400' },
  low_stock: { icon: AlertTriangle, tile: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400' },
  new_account: { icon: UserPlus, tile: 'bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400' },
  drop_waitlist: { icon: Sparkles, tile: 'bg-[#FF3D00]/10 text-[#FF3D00]' },
}
const FALLBACK_STYLE = { icon: Bell, tile: 'bg-[#F3F4F6] text-[#6B7280] dark:bg-white/10 dark:text-white/60' }

const relative = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })
export function timeAgo(iso: string, now: number): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  if (seconds > -45) return 'Justo ahora'
  const minutes = Math.round(seconds / 60)
  if (minutes > -60) return relative.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (hours > -24) return relative.format(hours, 'hour')
  const days = Math.round(hours / 24)
  if (days > -7) return relative.format(days, 'day')
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

/** Polls the staff member's notifications; calls `onNew` for ones that arrived after the first load */
export function useAdminNotifications({ limit = 15, onNew }: { limit?: number; onNew?: (items: AdminNotification[]) => void } = {}) {
  const [items, setItems] = useState<AdminNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const seen = useRef<Set<string> | null>(null)
  const onNewRef = useRef(onNew)
  onNewRef.current = onNew

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/notifications?limit=${limit}`, { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as { items: AdminNotification[]; unread: number }
      if (seen.current) {
        const fresh = data.items.filter((n) => !seen.current!.has(n.id) && !n.readAt)
        if (fresh.length) onNewRef.current?.(fresh)
      }
      seen.current = new Set(Array.from(seen.current ?? []).concat(data.items.map((n) => n.id)))
      setItems(data.items)
      setUnread(data.unread)
    } catch {
      // Offline or a deploy in progress: try again on the next tick
    } finally {
      setLoaded(true)
    }
  }, [limit])

  useEffect(() => {
    refresh()
    let timer: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (!timer) timer = setInterval(refresh, POLL_MS)
    }
    const stop = () => {
      if (timer) clearInterval(timer)
      timer = null
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh()
        start()
      } else stop()
    }
    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', refresh)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', refresh)
    }
  }, [refresh])

  const markRead = useCallback(async (ids: string[] | 'all') => {
    const stamp = new Date().toISOString()
    setItems((list) => list.map((n) => (ids === 'all' || ids.includes(n.id) ? { ...n, readAt: n.readAt ?? stamp } : n)))
    setUnread((count) => (ids === 'all' ? 0 : Math.max(0, count - ids.length)))
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ids === 'all' ? { all: true } : { ids }),
    }).catch(() => undefined)
  }, [])

  return { items, unread, loaded, refresh, markRead }
}

/** Re-renders every minute so "hace 5 minutos" stays true */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])
  return now
}

export function NotificationRow({ item, now, onOpen }: { item: AdminNotification; now: number; onOpen: (item: AdminNotification) => void }) {
  const style = NOTIFICATION_STYLES[item.type] ?? FALLBACK_STYLE
  const Icon = style.icon
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="flex w-full items-start gap-3 rounded-xl p-2 text-left transition-colors hover:bg-[#F9FAFB] dark:hover:bg-white/[0.05]"
    >
      <span className={cn('grid h-8 w-8 flex-shrink-0 place-items-center rounded-full', style.tile)}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block text-sm leading-snug', item.readAt ? 'text-[#374151]' : 'font-semibold text-[#111827]')}>{item.title}</span>
        {item.message && <span className="mt-0.5 block truncate text-xs text-[#6B7280]">{item.message}</span>}
        <span className="mt-0.5 block text-[11px] text-[#9CA3AF]">{timeAgo(item.createdAt, now)}</span>
      </span>
      {!item.readAt && <span aria-label="Sin leer" className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#10B981]" />}
    </button>
  )
}

export function NotificationsBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const bell = useAnimationControls()
  const now = useNow()
  const { items, unread, loaded, markRead } = useAdminNotifications({
    onNew: (fresh) => {
      bell.start({ rotate: [0, -16, 14, -10, 6, -3, 0], transition: { duration: 0.7 } })
      const [first] = fresh
      toast.info(fresh.length === 1 ? first.title : `${fresh.length} notificaciones nuevas`, fresh.length === 1 ? first.message : first.title)
    },
  })

  const openItem = (item: AdminNotification) => {
    if (!item.readAt) markRead([item.id])
    setOpen(false)
    if (item.actionUrl) router.push(item.actionUrl)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={unread ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
        aria-expanded={open}
        className="relative rounded-xl p-2 transition-colors hover:bg-[#F3F4F6]"
      >
        <motion.span animate={bell} className="block origin-top">
          <Bell className="h-5 w-5 text-[#6B7280]" />
        </motion.span>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#10B981] px-1 text-[10px] font-bold leading-none text-white"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-lg">
            <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] p-4">
              <h3 className="font-semibold text-[#111827]">Notificaciones</h3>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markRead('all')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#6B7280] hover:text-[#111827]"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todo como leído
                </button>
              )}
            </div>
            <div className="max-h-96 space-y-1 overflow-y-auto p-2">
              {!loaded ? (
                <p className="p-4 text-center text-sm text-[#9CA3AF]">Cargando…</p>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-6 text-center">
                  <Bell className="h-6 w-6 text-[#D1D5DB]" />
                  <p className="text-sm text-[#6B7280]">Sin notificaciones por ahora</p>
                  <p className="text-xs text-[#9CA3AF]">Aquí verás pedidos pagados, stock bajo, cuentas nuevas y registros al Drop.</p>
                </div>
              ) : (
                items.slice(0, 8).map((item) => <NotificationRow key={item.id} item={item} now={now} onOpen={openItem} />)
              )}
            </div>
            <div className="border-t border-[#E5E7EB] p-3">
              <Link
                href="/admin/notifications"
                onClick={() => setOpen(false)}
                className="block w-full text-center text-sm text-[#10B981] hover:underline"
              >
                Ver todas las notificaciones
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
