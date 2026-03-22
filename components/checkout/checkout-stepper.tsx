'use client'

import { motion } from 'framer-motion'
import { MapPin, Truck, CreditCard, ChevronRight, Check } from 'lucide-react'
import { useCheckoutModalStore } from '@/lib/store/checkout-modal-store'
import { cn } from '@/lib/utils/cn'

const steps = [
  { id: 0, label: 'Dirección', icon: MapPin },
  { id: 1, label: 'Envío', icon: Truck },
  { id: 2, label: 'Pago', icon: CreditCard },
] as const

export function CheckoutStepper() {
  const { currentStep, completedSteps } = useCheckoutModalStore()

  return (
    <div className="flex items-center justify-center gap-2 px-4 py-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id
        const isCompleted = completedSteps.has(step.id)
        const Icon = step.icon

        return (
          <div key={step.id} className="flex items-center gap-2">
            <motion.div
              layout
              className={cn(
                'rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors',
                isActive && 'bg-[#F5F0E8] text-[#1a1a1a]',
                isCompleted && !isActive && 'bg-green-500/10 text-green-600',
                !isActive && !isCompleted && 'bg-gray-700 text-gray-400'
              )}
            >
              {isCompleted && !isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{step.label}</span>
            </motion.div>

            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}
