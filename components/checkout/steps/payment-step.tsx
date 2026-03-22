'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CreditCard, MapPin, Truck, Loader2, Shield } from 'lucide-react'
import { useCheckoutModalStore } from '@/lib/store/checkout-modal-store'
import { useCartStore } from '@/lib/store/cart-store'
import { cn } from '@/lib/utils/cn'
import { toast } from '@/lib/toast'

type PaymentMethod = 'stripe' | 'mercadopago'

const SHIPPING_NAMES: Record<string, string> = {
  standard: 'Envío Estándar (5-7 días)',
  express: 'Envío Express (2-3 días)',
  next_day: 'Envío al Día Siguiente',
}

export function PaymentStep() {
  const {
    selectedAddressId,
    selectedAddress,
    shippingMethod,
    shippingCost,
    prevStep,
    closeCheckoutModal,
  } = useCheckoutModalStore()

  const { items, clearCart } = useCartStore()
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  const total = subtotal + shippingCost

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe')
  const [processing, setProcessing] = useState(false)

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handlePay = async () => {
    if (!selectedAddressId || !shippingMethod) return

    setProcessing(true)

    const checkoutData = {
      addressId: selectedAddressId,
      shippingMethod,
      items: items.map((item) => ({
        productId: item.productId,
        variantName: item.size,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
    }

    try {
      if (paymentMethod === 'stripe') {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkoutData),
        })

        if (response.ok) {
          const data = await response.json()
          clearCart()
          closeCheckoutModal()
          toast.info('Redirigiendo al pago...')
          if (data.sessionUrl) {
            window.location.href = data.sessionUrl
          } else {
            toast.error('Error al crear sesión de pago')
          }
        } else {
          const data = await response.json()
          toast.error(data.error || 'Error al procesar pedido')
        }
      } else if (paymentMethod === 'mercadopago') {
        const response = await fetch('/api/mercadopago/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(checkoutData),
        })

        if (response.ok) {
          const data = await response.json()
          clearCart()
          closeCheckoutModal()
          toast.info('Redirigiendo a MercadoPago...')
          if (data.initPoint) {
            window.location.href = data.initPoint
          } else {
            toast.error('Error al crear sesión de pago')
          }
        } else {
          const data = await response.json()
          toast.error(data.error || 'Error al procesar pedido')
        }
      }
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Resumen del pedido</h3>

        {/* Address Summary */}
        {selectedAddress && (
          <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <p className="font-medium text-gray-900">{selectedAddress.fullName}</p>
              <p>{selectedAddress.streetLine1}, {selectedAddress.city}</p>
            </div>
          </div>
        )}

        {/* Shipping Summary */}
        {shippingMethod && (
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-600">{SHIPPING_NAMES[shippingMethod] || shippingMethod}</span>
            <span className="ml-auto text-xs font-bold text-gray-900">
              {shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}
            </span>
          </div>
        )}

        {/* Cart Items */}
        <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-[200px] overflow-y-auto">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3 p-3">
              <div className="relative w-12 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-500">Talla: {item.size} &middot; Cant: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-2 border-t border-gray-200 pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Envío</span>
            <span className="text-gray-900">
              {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold pt-1 border-t border-gray-200">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Método de pago</h3>

        {/* Stripe */}
        <button
          onClick={() => setPaymentMethod('stripe')}
          className={cn(
            'w-full text-left p-4 border rounded-xl transition-colors flex items-center gap-4',
            paymentMethod === 'stripe'
              ? 'border-[#FF3D00] bg-[#FF3D00]/5'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <div className={cn(
            'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
            paymentMethod === 'stripe' ? 'border-[#FF3D00]' : 'border-gray-300'
          )}>
            {paymentMethod === 'stripe' && <div className="w-2 h-2 rounded-full bg-[#FF3D00]" />}
          </div>
          <CreditCard className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Tarjeta de crédito/débito</p>
            <p className="text-gray-500 text-xs">Visa, Mastercard, AMEX</p>
          </div>
          <div className="flex gap-1.5">
            <div className="w-8 h-5 bg-[#1A1F71] rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">VISA</span>
            </div>
            <div className="w-8 h-5 bg-[#EB001B] rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">MC</span>
            </div>
          </div>
        </button>

        {/* MercadoPago */}
        <button
          onClick={() => setPaymentMethod('mercadopago')}
          className={cn(
            'w-full text-left p-4 border rounded-xl transition-colors flex items-center gap-4',
            paymentMethod === 'mercadopago'
              ? 'border-[#FF3D00] bg-[#FF3D00]/5'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          <div className={cn(
            'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
            paymentMethod === 'mercadopago' ? 'border-[#FF3D00]' : 'border-gray-300'
          )}>
            {paymentMethod === 'mercadopago' && <div className="w-2 h-2 rounded-full bg-[#FF3D00]" />}
          </div>
          <div className="w-5 h-5 bg-[#00B1EA] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[8px] font-bold">MP</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">MercadoPago</p>
            <p className="text-gray-500 text-xs">Tarjetas, OXXO, SPEI</p>
          </div>
        </button>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
        <Shield className="w-3.5 h-3.5" />
        <span>Pago seguro y encriptado</span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={prevStep}
          disabled={processing}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-bold tracking-wider rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ATRÁS
        </button>
        <button
          onClick={handlePay}
          disabled={processing}
          className="px-8 py-3 bg-[#FF3D00] text-white font-bold tracking-wider rounded-xl hover:bg-[#E63600] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[200px]"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            `PAGAR ${formatPrice(total)}`
          )}
        </button>
      </div>
    </div>
  )
}
