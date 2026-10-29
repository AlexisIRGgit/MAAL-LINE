'use client'

import { useRouter } from 'next/navigation'
import { Bell, CheckCheck } from 'lucide-react'
import { ListRowsSkeleton } from '@/components/ui/skeleton'
import { NotificationRow, useAdminNotifications, useNow, type AdminNotification } from '@/components/admin/notifications-bell'

const dayLabel = (iso: string) => {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Hoy'
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
  return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
}

/** Full notification history for the signed-in staff member, grouped by day */
export default function AdminNotificationsPage() {
  const router = useRouter()
  const now = useNow()
  const { items, unread, loaded, markRead } = useAdminNotifications({ limit: 100 })

  const groups = items.reduce<{ label: string; items: AdminNotification[] }[]>((acc, item) => {
    const label = dayLabel(item.createdAt)
    const last = acc[acc.length - 1]
    if (last?.label === label) last.items.push(item)
    else acc.push({ label, items: [item] })
    return acc
  }, [])

  const open = (item: AdminNotification) => {
    if (!item.readAt) markRead([item.id])
    if (item.actionUrl) router.push(item.actionUrl)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Notificaciones</h1>
          <p className="text-sm text-[#6B7280]">{unread ? `${unread} sin leer · se actualiza sola` : 'Todo al día · se actualiza sola'}</p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => markRead('all')}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todo como leído
          </button>
        )}
      </div>

      {!loaded ? (
        <ListRowsSkeleton rows={5} label="Cargando notificaciones" />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center">
          <Bell className="mx-auto mb-3 h-8 w-8 text-[#D1D5DB]" />
          <p className="font-medium text-[#374151]">Sin notificaciones todavía</p>
          <p className="mt-1 text-sm text-[#9CA3AF]">Aquí verás pedidos pagados, stock bajo, cuentas nuevas y registros al Drop 001.</p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.label}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">{group.label}</h2>
            <div className="space-y-1 rounded-2xl border border-[#E5E7EB] bg-white p-2">
              {group.items.map((item) => (
                <NotificationRow key={item.id} item={item} now={now} onOpen={open} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
