'use client'

import { useState } from 'react'
import { Truck, Zap, Clock, MapPin } from 'lucide-react'
import { useCheckoutModalStore } from '@/lib/store/checkout-modal-store'
import { useCartStore } from '@/lib/store/cart-store'
import { cn } from '@/lib/utils/cn'
import { toast } from '@/lib/toast'

const FREE_SHIPPING_THRESHOLD = 999

const SHIPPING_METHODS = [
  {
    id: 'standard',
    name: 'Envío Estándar',
    description: '5-7 días hábiles',
    price: 99,
    icon: Truck,
  },
  {
    id: 'express',
    name: 'Envío Express',
    description: '2-3 días hábiles',
    price: 199,
    icon: Zap,
  },
  {
    id: 'next_day',
    name: 'Envío al Día Siguiente',
    description: '1 día hábil',
    price: 349,
    icon: Clock,
  },
]

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
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

  const [selected, setSelected] = useState<string>(storedMethod || 'standard')

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getShippingCost = (methodId: string) => {
    if (freeShipping && methodId === 'standard') return 0
    const method = SHIPPING_METHODS.find((m) => m.id === methodId)
    return method?.price || 0
  }

  const handleContinue = () => {
    if (!selected) {
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
            Envío estándar gratis en compras mayores a {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {SHIPPING_METHODS.map((method) => {
          const cost = getShippingCost(method.id)
          const isSelected = selected === method.id
          const Icon = method.icon

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
          className="px-8 py-3 bg-[#FF3D00] text-white font-bold tracking-wider rounded-xl hover:bg-[#E63600] transition-colors"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  )
}
