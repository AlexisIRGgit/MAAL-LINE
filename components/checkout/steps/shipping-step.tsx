'use client'

import { useEffect, useState } from 'react'
import { Truck, Zap, Clock, MapPin, Loader2 } from 'lucide-react'
import { useCheckoutModalStore } from '@/lib/store/checkout-modal-store'
import { useCartStore } from '@/lib/store/cart-store'
import { cn } from '@/lib/utils/cn'
import { toast } from '@/lib/toast'
import {
  DEFAULT_SHIPPING_SETTINGS,
  shippingCostFor,
  type ShippingMethodId,
  type ShippingSettings,
} from '@/lib/store-settings'

// Methods, prices and free-shipping rules come from Admin > Configuración > Envíos
const METHOD_ICONS: Record<ShippingMethodId, typeof Truck> = {
  standard: Truck,
  express: Zap,
  next_day: Clock,
}

type PublicShipping = Pick<ShippingSettings, 'freeShippingThreshold' | 'methods'>

export function ShippingStep() {
  const {
    selectedAddress,
    shippingMethod: storedMethod,
    setShippingMethod,
    completeStep,
    nextStep,
    prevStep,
  } = useCheckoutModalStore()

  const items = useCartStore((s) => s.items)
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  const [shipping, setShipping] = useState<PublicShipping | null>(null)
  const [selected, setSelected] = useState<string>(storedMethod || 'standard')

  useEffect(() => {
    let cancelled = false
    fetch('/api/store/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return
        const config: PublicShipping = data?.shipping ?? {
          ...DEFAULT_SHIPPING_SETTINGS,
          methods: DEFAULT_SHIPPING_SETTINGS.methods.filter((m) => m.enabled),
        }
        setShipping(config)
        // Keep the previous choice only if that method is still offered
        setSelected((current) => (config.methods.some((m) => m.id === current) ? current : config.methods[0]?.id ?? ''))
      })
      .catch(() => {
        if (!cancelled) setShipping({ ...DEFAULT_SHIPPING_SETTINGS })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const settingsForCost: ShippingSettings | null = shipping ? { ...DEFAULT_SHIPPING_SETTINGS, ...shipping } : null
  const freeEligible = shipping?.methods.filter((m) => m.freeEligible) ?? []
  const freeShipping =
    !!shipping && shipping.freeShippingThreshold !== null && subtotal >= shipping.freeShippingThreshold && freeEligible.length > 0

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getShippingCost = (methodId: string) =>
    settingsForCost ? shippingCostFor(settingsForCost, methodId, subtotal) ?? 0 : 0

  const handleContinue = () => {
    if (!selected || !shipping?.methods.some((m) => m.id === selected)) {
      toast.warning('Selecciona un método de envío')
      return
    }
    const cost = getShippingCost(selected)
    setShippingMethod(selected, cost)
    completeStep(1)
    nextStep()
  }

  return (
    <div className="space-y-6">
      {/* Selected Address Summary */}
      {selectedAddress && (
        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">{selectedAddress.fullName}</p>
            <p>{selectedAddress.streetLine1}, {selectedAddress.neighborhood}</p>
            <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}</p>
          </div>
        </div>
      )}

      <h3 className="text-lg font-bold text-gray-900">Método de envío</h3>

      {freeShipping && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-green-600" />
          <span className="text-green-700 text-sm font-medium">
            {freeEligible.map((m) => m.name).join(' y ')} gratis en compras desde{' '}
            {formatPrice(shipping?.freeShippingThreshold ?? 0)}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {!shipping && (
          <div className="h-[74px] rounded-xl border border-gray-200 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
        {shipping?.methods.map((method) => {
          const cost = getShippingCost(method.id)
          const isSelected = selected === method.id
          const Icon = METHOD_ICONS[method.id] ?? Truck

          return (
            <button
              key={method.id}
              onClick={() => setSelected(method.id)}
              className={cn(
                'w-full text-left p-4 border rounded-xl transition-colors flex items-center gap-4',
                isSelected
                  ? 'border-[#FF3D00] bg-[#FF3D00]/5'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                isSelected ? 'border-[#FF3D00]' : 'border-gray-300'
              )}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-[#FF3D00]" />}
              </div>

              <Icon className={cn(
                'w-5 h-5 flex-shrink-0',
                isSelected ? 'text-[#FF3D00]' : 'text-gray-400'
              )} />

              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{method.name}</p>
                <p className="text-gray-500 text-xs">{method.description}</p>
              </div>

              <div className="text-right flex-shrink-0">
                {cost === 0 ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    GRATIS
                  </span>
                ) : (
                  <span className="font-bold text-gray-900 text-sm">{formatPrice(cost)}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={prevStep}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-bold tracking-wider rounded-xl hover:bg-gray-50 transition-colors"
        >
          ATRÁS
        </button>
        <button
          onClick={handleContinue}
          disabled={!shipping}
          className="px-8 py-3 bg-[#FF3D00] text-white font-bold tracking-wider rounded-xl hover:bg-[#E63600] transition-colors disabled:opacity-50"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  )
}
