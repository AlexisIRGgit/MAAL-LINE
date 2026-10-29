'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useCheckoutModalStore } from '@/lib/store/checkout-modal-store'
import { DEFAULT_PAYMENT_SETTINGS, DEFAULT_SHIPPING_SETTINGS, type PaymentSettings } from '@/lib/store-settings'
import { CheckoutStepper, CheckoutSummaryCard } from './checkout-stepper'
import { AddressStep } from './steps/address-step'
import { ShippingStep } from './steps/shipping-step'
import { PaymentStep } from './steps/payment-step'

const stepVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
}

/**
 * Checkout without an account: Dirección → Envío → Pago. Guests type the address, name and phone;
 * signed-in customers can also pick a saved address. The order total stays pinned on top.
 */
export function CheckoutModal() {
  const { isOpen, currentStep, closeCheckoutModal, setSettings } = useCheckoutModalStore()
  const previousStep = useRef(currentStep)
  const direction = currentStep >= previousStep.current ? 1 : -1
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    previousStep.current = currentStep
    scrollRef.current?.scrollTo({ top: 0 })
  }, [currentStep])

  // Shipping methods and payment switches from Admin > Configuración
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    fetch('/api/store/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return
        setSettings(
          data?.shipping ?? { ...DEFAULT_SHIPPING_SETTINGS, methods: DEFAULT_SHIPPING_SETTINGS.methods.filter((m) => m.enabled) },
          (data?.payments as PaymentSettings | undefined) ?? DEFAULT_PAYMENT_SETTINGS
        )
      })
      .catch(() => !cancelled && setSettings({ ...DEFAULT_SHIPPING_SETTINGS }, DEFAULT_PAYMENT_SETTINGS))
    return () => {
      cancelled = true
    }
  }, [isOpen, setSettings])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCheckoutModal()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeCheckoutModal])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCheckoutModal}
            className="fixed inset-0 z-[400] bg-black/50 backdrop-blur-sm"
          />

          {/* Bottom sheet on phones, centered card from sm up */}
          <div className="pointer-events-none fixed inset-0 z-[400] flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Finalizar compra"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.1 }}
              className="pointer-events-auto relative flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl dark:bg-[#16181D] sm:max-h-[90vh] sm:rounded-[28px]"
            >
              {/* Pinned header: close, order total, steps */}
              <div className="flex-shrink-0 space-y-3 border-b border-[#E5E7EB] px-5 pb-3 pt-3 dark:border-white/10 sm:px-6 sm:pt-5">
                <div aria-hidden className="mx-auto h-1 w-10 rounded-full bg-[#E5E7EB] dark:bg-white/15 sm:hidden" />
                <div className="flex items-start gap-3">
                  {/* On the payment step the totals are right there, so the card folds away */}
                  <AnimatePresence initial={false}>
                    {currentStep < 2 && (
                      <motion.div
                        key="summary"
                        initial={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
                        exit={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
                        transition={{ type: 'spring', visualDuration: 0.35, bounce: 0 }}
                        className="min-w-0 flex-1 overflow-hidden"
                      >
                        <CheckoutSummaryCard />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {currentStep === 2 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex h-10 min-w-0 flex-1 items-center text-base font-bold text-[#111827] dark:text-white"
                    >
                      Finalizar compra
                    </motion.p>
                  )}
                  <button
                    type="button"
                    onClick={closeCheckoutModal}
                    aria-label="Cerrar"
                    className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827] dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <CheckoutStepper />
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-5 pt-5 sm:px-6">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {currentStep === 0 && <AddressStep />}
                    {currentStep === 1 && <ShippingStep />}
                    {currentStep === 2 && <PaymentStep />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
