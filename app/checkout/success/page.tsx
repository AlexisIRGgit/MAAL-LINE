'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Copy, Info, Loader2, Package, ShoppingBag } from 'lucide-react'

// beui action-swap (blur): the label and icon morph in place
const SWAP_SPRING = { type: 'spring', stiffness: 460, damping: 30, mass: 0.55 } as const
const SWAP_EXIT = { duration: 0.16, ease: [0.16, 1, 0.3, 1] } as const

/** "Copiar" → "Copiado" with the icon and text blurring into each other */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const reduce = useReducedMotion()
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Older browsers: copy through a hidden field
      const field = document.createElement('textarea')
      field.value = value
      document.body.appendChild(field)
      field.select()
      document.execCommand('copy')
      field.remove()
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.9, filter: 'blur(2px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: SWAP_SPRING },
        exit: { opacity: 0, scale: 0.96, filter: 'blur(2px)', transition: SWAP_EXIT },
      }
  const label = copied ? 'Copiado' : 'Copiar'

  return (
    <motion.button
      type="button"
      onClick={copy}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      aria-label={copied ? 'Número copiado' : 'Copiar número de pedido'}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#F3F4F6] dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.12]"
    >
      <span className="relative grid h-4 w-4 place-items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={label} {...swap} className="absolute inset-0 grid place-items-center">
            {copied ? <Check className="h-4 w-4 text-emerald-500" strokeWidth={2.5} /> : <Copy className="h-4 w-4" />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="relative inline-grid">
        {/* Holds the width of the longer label so the pill doesn't jump */}
        <span aria-hidden className="invisible col-start-1 row-start-1">Copiado</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={label} {...swap} className="col-start-1 row-start-1 text-left">
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const { status } = useSession()
  const isGuest = status === 'unauthenticated'

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F8] p-4 dark:bg-[#0B0B0D]">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 16 }}
          className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_12px_30px_-12px_rgba(16,185,129,0.8)]"
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.4 }} />
          </svg>
        </motion.div>

        <motion.h1 {...rise(0.25)} className="mb-2 text-2xl font-bold text-[#111827] dark:text-white">
          ¡Pedido confirmado!
        </motion.h1>
        <motion.p {...rise(0.32)} className="mb-6 text-[#6B7280] dark:text-white/60">
          Gracias por tu compra. Ya estamos preparando tu equipo.
        </motion.p>

        {orderNumber && (
          <motion.div {...rise(0.4)} className="mb-4 rounded-[20px] border border-[#E5E7EB] bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="mb-1 text-xs text-[#6B7280] dark:text-white/50">Número de pedido</p>
            {/* Plain text so it can also be selected and copied by hand */}
            <p className="select-all font-mono text-xl font-bold tracking-wide text-[#111827] dark:text-white">{orderNumber}</p>
          </motion.div>
        )}

        <motion.div {...rise(0.48)} className="mb-8 space-y-3">
          {isGuest ? (
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-left dark:bg-amber-400/10">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-900 dark:text-amber-100/80">
                <strong className="font-semibold">Guarda este número.</strong> Con él y tu teléfono puedes ver el estado de tu pedido en{' '}
                <Link href={`/rastrear${orderNumber ? `?pedido=${encodeURIComponent(orderNumber)}` : ''}`} className="font-semibold underline underline-offset-2">
                  Rastrear pedido
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left dark:bg-white/[0.04]">
              <Package className="h-5 w-5 flex-shrink-0 text-[#FF3D00]" />
              <p className="text-sm text-[#6B7280] dark:text-white/60">Te avisaremos por correo cuando tu pedido salga.</p>
            </div>
          )}
        </motion.div>

        <motion.div {...rise(0.56)} className="flex flex-wrap items-center justify-center gap-2">
          {orderNumber && <CopyButton value={orderNumber} />}
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#111827] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1F2937] dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6]"
          >
            <ShoppingBag className="h-4 w-4" />
            Seguir comprando
          </Link>
        </motion.div>

        {status === 'authenticated' && (
          <motion.div {...rise(0.62)} className="mt-4">
            <Link href="/cuenta/pedidos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#111827] hover:underline dark:text-white">
              Ver mis pedidos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 text-xs text-[#9CA3AF]">
          ¿Tienes preguntas?{' '}
          <Link href="/faq" className="font-semibold text-[#FF3D00] hover:underline">
            Contáctanos
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F8] dark:bg-[#0B0B0D]">
      <Loader2 className="h-8 w-8 animate-spin text-[#9CA3AF]" />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  )
}
