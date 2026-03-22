'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useCheckoutModalStore } from '@/lib/store/checkout-modal-store'
import { useAuthModalStore } from '@/lib/store/auth-modal-store'
import { CheckoutStepper } from './checkout-stepper'
import { AddressStep } from './steps/address-step'
import { ShippingStep } from './steps/shipping-step'
import { PaymentStep } from './steps/payment-step'

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
  }),
}

export function CheckoutModal() {
  const { isOpen, currentStep, closeCheckoutModal } = useCheckoutModalStore()
  const { openAuthModal } = useAuthModalStore()
  const { status: sessionStatus } = useSession()

  // Auth check: if not authenticated when modal opens, redirect to auth
  useEffect(() => {
    if (isOpen && sessionStatus === 'unauthenticated') {
      closeCheckoutModal()
      openAuthModal('login')
    }
  }, [isOpen, sessionStatus, closeCheckoutModal, openAuthModal])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCheckoutModal()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [closeCheckoutModal])

  // Track step direction for animation
  const direction = 1 // always forward-feeling for simplicity; prevStep uses negative in variants

  return (
    <AnimatePresence>
      {isOpen && sessionStatus === 'authenticated' && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCheckoutModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl pointer-events-auto mx-4"
            >
              {/* Close Button */}
              <button
                onClick={closeCheckoutModal}
                className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Stepper */}
              <div className="border-b border-gray-200">
                <CheckoutStepper />
              </div>

              {/* Step Content */}
              <div className="p-6 overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
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
