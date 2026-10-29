'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useCheckoutModalStore } from '@/lib/store/checkout-modal-store'
import { cn } from '@/lib/utils/cn'
import { formatMXN, useCheckoutTotals } from './use-checkout-totals'

const steps = [
  { id: 0, label: 'Dirección' },
  { id: 1, label: 'Envío' },
  { id: 2, label: 'Pago' },
] as const

const SPRING = { type: 'spring', visualDuration: 0.3, bounce: 0 } as const

/** Always-visible order card: what you're buying and the total, shipping and coupon included */
export function CheckoutSummaryCard() {
  const { items, units, shippingCost, discount, total } = useCheckoutTotals()
  const first = items[0]
  const title = items.length === 1 && first ? first.product.name : `${units} ${units === 1 ? 'producto' : 'productos'}`
  const shippingLine =
    shippingCost === null ? 'Envío en el siguiente paso' : shippingCost === 0 ? 'Envío gratis incluido' : `Envío ${formatMXN(shippingCost)} incluido`

  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-[#E5E7EB] bg-white p-3 pr-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-[#F3F4F6] dark:bg-white/10">
        {first && <Image src={first.product.image} alt="" fill sizes="56px" className="object-cover" />}
        {items.length > 1 && (
          <span className="absolute bottom-1 right-1 rounded-full bg-[#111827] px-1.5 text-[10px] font-bold leading-4 text-white">
            {items.length}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-[#111827] dark:text-white">{items.length ? title : 'Nada seleccionado'}</p>
        <p className={cn('truncate text-xs font-medium', shippingCost === null ? 'text-[#6B7280] dark:text-white/50' : 'text-[#FF3D00]')}>
          {shippingLine}
          {discount > 0 && <span className="text-emerald-600 dark:text-emerald-400"> · −{formatMXN(discount)} cupón</span>}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-[11px] text-[#6B7280] dark:text-white/50">Total</p>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={total}
            initial={{ opacity: 0, y: 6, filter: 'blur(2px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.18 }}
            className="text-lg font-bold tabular-nums text-[#111827] dark:text-white sm:text-xl"
          >
            {formatMXN(total)}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** 1 Dirección — 2 Envío — 3 Pago; finished steps can be tapped to go back */
export function CheckoutStepper() {
  const { currentStep, completedSteps, setStep } = useCheckoutModalStore()

  return (
    <ol className="flex items-center justify-between gap-1">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id
        const isCompleted = completedSteps.has(step.id) && !isActive
        const reachable = isCompleted || step.id < currentStep
        return (
          <li key={step.id} className={cn('flex items-center gap-1', index < steps.length - 1 && 'flex-1')}>
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && setStep(step.id)}
              aria-current={isActive ? 'step' : undefined}
              className={cn(
                'relative flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-semibold transition-colors',
                isActive ? 'text-[#FF3D00]' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#9CA3AF] dark:text-white/40',
                reachable && 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              )}
            >
              {isActive && (
                <motion.span layoutId="checkout-step-pill" transition={SPRING} className="absolute inset-0 rounded-full bg-[#FF3D00]/10" />
              )}
              <span
                className={cn(
                  'relative grid h-6 w-6 place-items-center rounded-full text-xs font-bold',
                  isActive
                    ? 'bg-[#FF3D00] text-white'
                    : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'border-[1.5px] border-[#D1D5DB] dark:border-white/20'
                )}
              >
                {isCompleted ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </motion.span>
                ) : (
                  step.id + 1
                )}
              </span>
              <span className="relative">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'h-px min-w-3 flex-1 transition-colors',
                  completedSteps.has(step.id) ? 'bg-emerald-500/50' : 'bg-[#E5E7EB] dark:bg-white/10'
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
