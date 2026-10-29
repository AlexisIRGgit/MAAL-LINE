'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, Check, CornerDownLeft, ExternalLink, Hash, Loader2, Mail, MapPin, Phone, Search, Truck, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { CheckoutMap } from '@/components/checkout/checkout-map'
import { SkeletonBlock } from '@/components/ui/skeleton'
import { formatMXN } from '@/components/checkout/use-checkout-totals'

interface TrackedOrder {
  orderNumber: string
  status: string
  paymentStatus: string
  createdAt: string
  shippedAt: string | null
  deliveredAt: string | null
  email: string | null
  subtotal: number
  shippingTotal: number
  discountTotal: number
  total: number
  discountCode: string | null
  shippingMethod: { name: string; description: string } | null
  items: { name: string; variant: string | null; quantity: number; unitPrice: number; total: number; slug: string | null }[]
  shipment: { carrier: string | null; trackingNumber: string | null; trackingUrl: string | null } | null
  address: {
    fullName: string | null
    phone: string | null
    streetLine1: string | null
    streetLine2: string | null
    neighborhood: string | null
    city: string | null
    state: string | null
    postalCode: string | null
    latitude: number | null
    longitude: number | null
  }
}

// Same glide as beui's command palette active row
const ROW_SPRING = { type: 'spring', stiffness: 520, damping: 38, mass: 0.5 } as const
const EASE_OUT = [0.16, 1, 0.3, 1] as const

const STEPS = ['Pagado', 'Preparando', 'En camino', 'Entregado'] as const

function stepFor(order: TrackedOrder): number {
  if (order.status === 'delivered') return 3
  if (order.status === 'shipped') return 2
  if (order.paymentStatus === 'paid' || order.status === 'confirmed' || order.status === 'processing') return 1
  return -1
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))

function Timeline({ order }: { order: TrackedOrder }) {
  const current = stepFor(order)
  if (order.status === 'cancelled' || order.status === 'refunded') {
    return (
      <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
        {order.status === 'cancelled' ? 'Este pedido fue cancelado.' : 'Este pedido fue reembolsado.'}
      </p>
    )
  }
  if (current < 0) {
    return (
      <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
        Aún no recibimos el pago de este pedido.
      </p>
    )
  }
  return (
    <ol className="grid grid-cols-4 gap-1">
      {STEPS.map((label, index) => {
        const done = index <= current
        return (
          <li key={label} className="flex flex-col items-center gap-2 text-center">
            <div className="flex w-full items-center">
              <span className={cn('h-0.5 flex-1 rounded-full', index === 0 ? 'opacity-0' : done ? 'bg-emerald-500' : 'bg-[#E5E7EB] dark:bg-white/10')} />
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.08, type: 'spring', stiffness: 400, damping: 20 }}
                className={cn(
                  'grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-xs font-bold',
                  done ? 'bg-emerald-500 text-white' : 'border-[1.5px] border-[#D1D5DB] text-[#9CA3AF] dark:border-white/20'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
              </motion.span>
              <span
                className={cn(
                  'h-0.5 flex-1 rounded-full',
                  index === STEPS.length - 1 ? 'opacity-0' : index < current ? 'bg-emerald-500' : 'bg-[#E5E7EB] dark:bg-white/10'
                )}
              />
            </div>
            <span className={cn('text-[11px] font-semibold', done ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#9CA3AF]')}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function ResultSkeleton() {
  return (
    <div role="status" aria-label="Buscando tu pedido" className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4 rounded-[24px] border border-[#E5E7EB] bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock index={1} className="h-12 w-full rounded-2xl" />
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBlock index={i + 2} className="h-12 w-12 rounded-xl" />
            <div className="grid flex-1 gap-2">
              <SkeletonBlock index={i + 2} className="h-3.5 w-1/2" />
              <SkeletonBlock index={i + 3} className="h-3 w-1/3" />
            </div>
          </div>
        ))}
        <SkeletonBlock index={4} className="h-24 w-full rounded-2xl" />
        <SkeletonBlock index={5} className="h-16 w-full rounded-2xl" />
      </div>
      <SkeletonBlock index={1} className="h-[320px] w-full rounded-[24px] lg:h-full lg:min-h-[420px]" />
    </div>
  )
}

function OrderResult({ order }: { order: TrackedOrder }) {
  const a = order.address
  const addressLine = [a.streetLine1, a.streetLine2, a.neighborhood, [a.city, a.state].filter(Boolean).join(', '), a.postalCode && `CP ${a.postalCode}`]
    .filter(Boolean)
    .join(' · ')
  const mapText = [a.streetLine1, a.neighborhood, a.city, a.state, a.postalCode].filter(Boolean).join(', ')

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Purchase and contact details, on the same glass surface as the search bar */}
      <div className="space-y-5 rounded-[24px] border border-[#E5E7EB] bg-white/80 p-5 shadow-[0_24px_60px_-30px_rgba(17,24,39,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1A1C22]/80 dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-lg font-bold text-[#111827] dark:text-white">{order.orderNumber}</p>
          <p className="text-xs text-[#6B7280] dark:text-white/50">{formatDate(order.createdAt)}</p>
        </div>

        <Timeline order={order} />

        {order.shipment?.trackingNumber && (
          <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm dark:bg-sky-400/10">
            <Truck className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-sky-400" />
            <span className="min-w-0 flex-1 text-blue-900 dark:text-sky-100">
              {order.shipment.carrier ?? 'Paquetería'} · <span className="font-mono font-semibold">{order.shipment.trackingNumber}</span>
            </span>
            {order.shipment.trackingUrl && (
              <a href={order.shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-sky-300">
                Seguir
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}

        <div>
          <h3 className="mb-2 text-sm font-bold text-[#111827] dark:text-white">Productos</h3>
          <ul className="divide-y divide-[#F3F4F6] dark:divide-white/[0.06]">
            {order.items.map((item, index) => (
              <li key={index} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  {item.slug ? (
                    <Link href={`/producto/${item.slug}`} className="block truncate font-medium text-[#111827] hover:underline dark:text-white">
                      {item.name}
                    </Link>
                  ) : (
                    <span className="block truncate font-medium text-[#111827] dark:text-white">{item.name}</span>
                  )}
                  <span className="text-xs text-[#6B7280] dark:text-white/50">
                    {item.variant ? `Talla ${item.variant} · ` : ''}
                    {item.quantity} × {formatMXN(item.unitPrice)}
                  </span>
                </span>
                <span className="flex-shrink-0 font-semibold tabular-nums text-[#111827] dark:text-white">{formatMXN(item.total)}</span>
              </li>
            ))}
          </ul>
        </div>

        <dl className="space-y-1.5 rounded-2xl bg-[#F9FAFB] p-4 text-sm dark:bg-white/[0.04]">
          <div className="flex justify-between">
            <dt className="text-[#6B7280] dark:text-white/55">Subtotal</dt>
            <dd className="tabular-nums text-[#111827] dark:text-white">{formatMXN(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#6B7280] dark:text-white/55">{order.shippingMethod?.name ?? 'Envío'}</dt>
            <dd className="tabular-nums text-[#111827] dark:text-white">{order.shippingTotal === 0 ? 'Gratis' : formatMXN(order.shippingTotal)}</dd>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
              <dt>Cupón {order.discountCode}</dt>
              <dd className="tabular-nums">−{formatMXN(order.discountTotal)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-[#E5E7EB] pt-2 font-bold dark:border-white/10">
            <dt className="text-[#111827] dark:text-white">Total</dt>
            <dd className="tabular-nums text-[#111827] dark:text-white">{formatMXN(order.total)}</dd>
          </div>
        </dl>

        <div>
          <h3 className="mb-2 text-sm font-bold text-[#111827] dark:text-white">Entrega y contacto</h3>
          <ul className="space-y-2 text-sm text-[#374151] dark:text-white/75">
            {a.fullName && (
              <li className="flex items-center gap-2.5">
                <User className="h-4 w-4 flex-shrink-0 text-[#9CA3AF]" />
                {a.fullName}
              </li>
            )}
            {a.phone && (
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#9CA3AF]" />
                {a.phone}
              </li>
            )}
            {order.email && (
              <li className="flex min-w-0 items-center gap-2.5">
                <Mail className="h-4 w-4 flex-shrink-0 text-[#9CA3AF]" />
                <span className="truncate">{order.email}</span>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FF3D00]" />
              <span>{addressLine}</span>
            </li>
            {order.shippingMethod && (
              <li className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 flex-shrink-0 text-[#9CA3AF]" />
                {order.shippingMethod.name}
                {order.shippingMethod.description && <span className="text-[#9CA3AF]">· {order.shippingMethod.description}</span>}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Delivery point */}
      <div className="h-[320px] overflow-hidden rounded-[24px] border border-[#E5E7EB] dark:border-white/10 lg:sticky lg:top-28 lg:h-[520px]">
        <CheckoutMap lat={a.latitude ?? undefined} lng={a.longitude ?? undefined} address={mapText || undefined} />
      </div>
    </div>
  )
}

/** Guest order lookup: a command-palette style bar, then the order on the left and the map on the right */
export function OrderTracker({ initialOrder = '' }: { initialOrder?: string }) {
  const reduce = useReducedMotion()
  const [orderNumber, setOrderNumber] = useState(initialOrder)
  const [last4, setLast4] = useState('')
  const [focused, setFocused] = useState<'order' | 'phone' | null>(null)
  const [state, setState] = useState<{ kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string; account?: boolean } | { kind: 'found'; order: TrackedOrder }>({
    kind: 'idle',
  })
  const phoneRef = useRef<HTMLInputElement>(null)

  const search = async () => {
    if (state.kind === 'loading') return
    if (!orderNumber.trim()) return
    if (last4.length !== 4) {
      phoneRef.current?.focus()
      return
    }
    setState({ kind: 'loading' })
    try {
      const [res] = await Promise.all([
        fetch('/api/orders/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber, phoneLast4: last4 }),
        }),
        // Keep the skeleton up long enough to read as a transition, not a flicker
        new Promise((resolve) => setTimeout(resolve, 450)),
      ])
      const data = (await res.json().catch(() => ({}))) as { order?: TrackedOrder; error?: string; account?: boolean }
      if (!res.ok || !data.order) throw Object.assign(new Error(data.error || 'No encontramos tu pedido.'), { account: data.account })
      setState({ kind: 'found', order: data.order })
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'No encontramos tu pedido.',
        account: (err as { account?: boolean }).account,
      })
    }
  }

  const rowClass = 'relative flex h-14 items-center gap-3 px-4'

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          search()
        }}
        className="mx-auto max-w-xl overflow-hidden rounded-[22px] border border-[#E5E7EB] bg-white/80 shadow-[0_24px_60px_-30px_rgba(17,24,39,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1A1C22]/80 dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)]"
      >
        <label className={cn(rowClass, 'border-b border-[#F3F4F6] dark:border-white/[0.06]')}>
          <Search className="relative h-4 w-4 flex-shrink-0 text-[#9CA3AF]" />
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            onFocus={() => setFocused('order')}
            onBlur={() => setFocused(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && last4.length !== 4) {
                e.preventDefault()
                phoneRef.current?.focus()
              }
            }}
            placeholder="Número de pedido, ej. ML-MVTW5WA7-II87"
            aria-label="Número de pedido"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="next"
            maxLength={30}
            autoFocus={!initialOrder}
            className="relative min-w-0 flex-1 bg-transparent font-mono text-[15px] tracking-wide text-[#111827] outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-[#9CA3AF] dark:text-white"
          />
          <kbd className="relative hidden rounded-md border border-[#E5E7EB] px-1.5 py-0.5 text-[10px] font-semibold text-[#9CA3AF] dark:border-white/10 sm:inline-flex">
            <CornerDownLeft className="h-3 w-3" />
          </kbd>
        </label>

        <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9CA3AF]">Verifica que es tuyo</p>
        <div className="p-1.5 pt-0">
          <label className={cn(rowClass, 'rounded-2xl')}>
            {focused === 'phone' && (
              <motion.span
                layoutId="track-active-row"
                transition={reduce ? { duration: 0 } : ROW_SPRING}
                className="absolute inset-0 rounded-2xl bg-[#F3F4F6] dark:bg-white/[0.06]"
              />
            )}
            <Hash className="relative h-4 w-4 flex-shrink-0 text-[#9CA3AF]" />
            <input
              ref={phoneRef}
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
              placeholder="Últimos 4 dígitos de tu teléfono"
              aria-label="Últimos 4 dígitos de tu teléfono"
              inputMode="numeric"
              autoComplete="off"
              enterKeyHint="search"
              maxLength={4}
              className="relative min-w-0 flex-1 bg-transparent text-[15px] tracking-[0.3em] text-[#111827] outline-none placeholder:tracking-normal placeholder:text-[#9CA3AF] dark:text-white"
            />
            <button
              type="submit"
              disabled={!orderNumber.trim() || last4.length !== 4 || state.kind === 'loading'}
              className="relative inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#FF3D00] px-4 text-sm font-bold text-white transition-colors hover:bg-[#E63600] disabled:opacity-40"
            >
              {state.kind === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Buscar
            </button>
          </label>
        </div>
      </form>

      <AnimatePresence mode="wait" initial={false}>
        {state.kind === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
            <ResultSkeleton />
          </motion.div>
        )}
        {state.kind === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            className="mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>
              {state.message}
              {state.account && (
                <>
                  {' '}
                  <Link href="/cuenta/pedidos" className="font-semibold underline underline-offset-2">
                    Ir a Mis pedidos
                  </Link>
                </>
              )}
            </span>
          </motion.div>
        )}
        {state.kind === 'found' && (
          <motion.div
            key={state.order.orderNumber}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <OrderResult order={state.order} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
