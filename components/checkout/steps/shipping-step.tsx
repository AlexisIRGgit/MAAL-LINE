'use client'

import { Truck, Zap, Clock, MapPin } from 'lucide-react'
import { useCheckoutModalStore } from '@/lib/store/checkout-modal-store'
import { DEFAULT_SHIPPING_SETTINGS, shippingCostFor, type ShippingMethodId } from '@/lib/store-settings'
import { RadioCards } from '@/components/ui/radio-cards'
import { SkeletonBlock } from '@/components/ui/skeleton'
import { formatMXN, useCheckoutTotals } from '../use-checkout-totals'
import { PRIMARY_BUTTON, SECONDARY_BUTTON, StepFooter } from '../step-footer'

// Methods, prices and free-shipping rules come from Admin > Configuración > Envíos
const METHOD_ICONS: Record<ShippingMethodId, typeof Truck> = {
  standard: Truck,
  express: Zap,
  next_day: Clock,
}

export function ShippingStep() {
  const { shipping, shippingMethod, setShippingMethod, selectedAddress, inlineAddress, completeStep, nextStep, prevStep } =
    useCheckoutModalStore()
  const { subtotal } = useCheckoutTotals()

  const settings = shipping ? { ...DEFAULT_SHIPPING_SETTINGS, ...shipping } : null
  const freeEligible = shipping?.methods.filter((m) => m.freeEligible) ?? []
  const threshold = shipping?.freeShippingThreshold ?? null
  const missingForFree = threshold !== null && freeEligible.length > 0 ? threshold - subtotal : null

  const options = (shipping?.methods ?? []).map((method) => {
    const cost = settings ? shippingCostFor(settings, method.id, subtotal) ?? 0 : 0
    const Icon = METHOD_ICONS[method.id] ?? Truck
    return {
      value: method.id,
      label: method.name,
      description: method.description,
      icon: <Icon />,
      meta: cost === 0 ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">Gratis</span> : formatMXN(cost),
    }
  })

  const shipTo = selectedAddress
    ? { name: selectedAddress.fullName, line: [selectedAddress.streetLine1, selectedAddress.neighborhood, selectedAddress.city].filter(Boolean).join(', ') }
    : { name: inlineAddress.fullName, line: inlineAddress.formattedAddress || [inlineAddress.streetLine1, inlineAddress.city].filter(Boolean).join(', ') }

  const handleContinue = () => {
    if (!shippingMethod || !shipping?.methods.some((m) => m.id === shippingMethod)) return
    completeStep(1)
    nextStep()
  }

  return (
    <div className="mx-auto max-w-xl">
      <button
        type="button"
        onClick={prevStep}
        className="flex w-full items-start gap-3 rounded-[20px] bg-[#F9FAFB] p-4 text-left transition-colors hover:bg-[#F3F4F6] dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
      >
        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FF3D00]" />
        <span className="min-w-0 flex-1 text-sm">
          <span className="block font-semibold text-[#111827] dark:text-white">{shipTo.name}</span>
          <span className="block truncate text-[#6B7280] dark:text-white/55">{shipTo.line}</span>
        </span>
        <span className="text-xs font-semibold text-[#6B7280] dark:text-white/50">Cambiar</span>
      </button>

      <h3 className="mb-3 mt-6 text-lg font-bold text-[#111827] dark:text-white">¿Cómo te lo llevamos?</h3>

      {missingForFree !== null && missingForFree > 0 && (
        <p className="mb-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          Te faltan <strong>{formatMXN(missingForFree)}</strong> para envío gratis en {freeEligible.map((m) => m.name).join(' y ')}.
        </p>
      )}

      {!shipping ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <SkeletonBlock key={i} index={i} className="h-[66px] w-full rounded-[20px]" />
          ))}
        </div>
      ) : (
        <RadioCards
          layout="list"
          aria-label="Método de envío"
          value={shippingMethod}
          onValueChange={setShippingMethod}
          options={options}
        />
      )}

      <StepFooter>
        <button type="button" onClick={prevStep} className={SECONDARY_BUTTON}>
          Atrás
        </button>
        <button type="button" onClick={handleContinue} disabled={!shipping || !shippingMethod} className={PRIMARY_BUTTON}>
          Continuar al pago
        </button>
      </StepFooter>
    </div>
  )
}
