'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, LogOut, Smartphone, WifiOff } from 'lucide-react'
import { toast } from '@/lib/toast'

type Connection =
  | { transport: 'cloud' }
  | { transport: 'webjs'; unreachable: true }
  | { transport: 'webjs'; unreachable?: false; ready: boolean; qr: string | null; number: string | null }

/** Link panel for the trial whatsapp-web.js connection: QR while unlinked, the number once linked */
export function WhatsAppConnection() {
  const [connection, setConnection] = useState<Connection | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/whatsapp/connection', { cache: 'no-store' }).catch(() => null)
    if (res?.ok) setConnection((await res.json()) as Connection)
  }, [])

  const linked = connection?.transport === 'webjs' && !connection.unreachable && connection.ready

  // Faster while waiting for a scan, so the panel flips to "connected" right away
  useEffect(() => {
    load()
    const timer = setInterval(() => {
      if (!document.hidden) load()
    }, linked ? 30_000 : 4_000)
    return () => clearInterval(timer)
  }, [load, linked])

  if (!connection || connection.transport === 'cloud') return null

  const logout = async () => {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/whatsapp/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      })
      if (!res.ok) toast.error('No se pudo desvincular', 'Intenta de nuevo')
      else toast.success('Número desvinculado', 'En unos segundos aparece un QR nuevo')
      await load()
    } finally {
      setBusy(false)
    }
  }

  if (connection.unreachable) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <WifiOff className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
        <div>
          <p className="text-sm font-semibold text-[#111827]">Sin conexión con el servidor de WhatsApp</p>
          <p className="text-sm text-[#6B7280]">
            Revisa que el servicio de Railway esté encendido y que WHATSAPP_WORKER_URL y WHATSAPP_WORKER_SECRET coincidan.
          </p>
        </div>
      </div>
    )
  }

  if (connection.ready) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-600">
            <Smartphone className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#111827]">WhatsApp vinculado</p>
            <p className="text-sm text-[#6B7280]">{connection.number ? `+${connection.number}` : 'Número conectado'} · el bot está en línea</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Desvincular
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:flex-row sm:items-start">
      <div className="flex h-[232px] w-[232px] flex-shrink-0 items-center justify-center rounded-xl p-2" style={{ backgroundColor: '#fff' }}>
        {connection.qr ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL from the worker
          <img src={connection.qr} alt="Código QR para vincular WhatsApp" width={216} height={216} />
        ) : (
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#6B7280' }} />
        )}
      </div>
      <div className="space-y-2 text-sm text-[#6B7280]">
        <p className="text-base font-semibold text-[#111827]">Vincula el WhatsApp del bot</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>En el celular del chip del bot, abre WhatsApp.</li>
          <li>Ve a Ajustes (o ⋮) → Dispositivos vinculados → Vincular un dispositivo.</li>
          <li>Escanea este código. Se renueva solo cada pocos segundos.</li>
        </ol>
        <p className="text-xs text-[#9CA3AF]">
          Usa un número aparte, no el principal de la tienda: esta conexión es de prueba y WhatsApp puede bloquear el número.
        </p>
      </div>
    </div>
  )
}
