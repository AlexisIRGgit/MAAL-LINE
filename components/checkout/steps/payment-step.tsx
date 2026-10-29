'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CreditCard, Loader2, Minus, Plus, Shield, Trash2, Wallet, X } from 'lucide-react'
import { cartLineKey, useCheckoutModalStore } from '@/lib/store/checkout-modal-store'
import { useCartStore } from '@/lib/store/cart-store'
import { discountLabel, type DiscountRule } from '@/lib/discounts'
import { cn } from '@/lib/utils/cn'
import { toast } from '@/lib/toast'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioCards } from '@/components/ui/radio-cards'
import { FloatingField } from '../floating-field'
import { formatMXN, useCheckoutTotals } from '../use-checkout-totals'
import { PRIMARY_BUTTON, SECONDARY_BUTTON, StepFooter } from '../step-footer'

const MAX_QUANTITY = 20

/** Green bubble with a check that draws itself: the coupon worked */
function SuccessCheck() {
  const reduce = useReducedMotion()
  return (
    <span className="relative mr-1.5 grid h-9 w-9 place-items-center" aria-hidden>
      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-full bg-emerald-500"
          initial={{ scale: 0.6, opacity: 0.45 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        />
      )}
      <motion.span
        className="relative grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_6px_16px_-6px_rgba(16,185,129,0.8)]"
        initial={reduce ? false : { scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 16 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M5 13l4 4L19 7"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          />
        </svg>
      </motion.span>
    </span>
  )
}

function CouponField({ subtotal, phone }: { subtotal: number; phone: string | null }) {
  const { discount, setDiscount } = useCheckoutModalStore()
  const [code, setCode] = useState(discount?.code ?? '')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { discount: amount, belowMinimum } = useCheckoutTotals()

  const apply = async () => {
    const trimmed = code.trim()
    if (!trimmed || checking) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, subtotal, phone }),
      })
      const data = (await res.json().catch(() => ({}))) as { discount?: DiscountRule; error?: string }
      if (!res.ok || !data.discount) throw new Error(data.error || 'Este código no existe')
      setDiscount(data.discount)
      setCode(data.discount.code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos revisar el código')
    } finally {
      setChecking(false)
    }
  }

  const remove = () => {
    setDiscount(null)
    setCode('')
    setError(null)
  }

  return (
    <div>
      <FloatingField
        label={discount ? 'Cupón aplicado' : 'Código de descuento'}
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        maxLength={50}
        readOnly={!!discount}
        tone={discount ? 'success' : 'default'}
        error={error}
        value={code}
        onChange={(e) => {
          setCode(e.target.value.toUpperCase())
          setError(null)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            apply()
          }
        }}
        className="[&_input]:uppercase [&_input]:tracking-wider"
        trailing={
          <AnimatePresence mode="popLayout" initial={false}>
            {discount ? (
              <motion.span key="ok" exit={{ opacity: 0, scale: 0.6 }}>
                <SuccessCheck />
              </motion.span>
            ) : (
              <motion.button
                key="apply"
                type="button"
                onClick={apply}
                disabled={!code.trim() || checking}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white transition-opacity disabled:opacity-40 dark:bg-white dark:text-[#111827]"
              >
                {checking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Aplicar
              </motion.button>
            )}
          </AnimatePresence>
        }
      />
      <AnimatePresence initial={false}>
        {discount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-1 pt-2 text-xs">
              <span className={belowMinimum ? 'text-amber-600 dark:text-amber-400' : 'font-medium text-emerald-700 dark:text-emerald-300'}>
                {belowMinimum && discount.minimumPurchase !== null
                  ? `Requiere una compra mínima de ${formatMXN(discount.minimumPurchase)}`
                  : `${discountLabel(discount)}${amount > 0 ? ` · −${formatMXN(amount)}` : ''}`}
              </span>
              <button
                type="button"
                onClick={remove}
                className="inline-flex items-center gap-1 font-medium text-[#6B7280] hover:text-[#111827] dark:text-white/50 dark:hover:text-white"
              >
                <X className="h-3 w-3" />
                Quitar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PaymentStep() {
  const {
    selectedAddressId,
    selectedAddress,
    inlineAddress,
    shippingMethod,
    payments,
    paymentMethod,
    setPaymentMethod,
    excludedKeys,
    toggleExcluded,
    discount,
    prevStep,
    resetCheckout,
  } = useCheckoutModalStore()
  const { items: cartItems, updateQuantity, removeItem } = useCartStore()
  const { items, subtotal, shippingCost, discount: discountTotal, total } = useCheckoutTotals()
  const [processing, setProcessing] = useState(false)

  const phone = selectedAddress ? selectedAddress.phone : inlineAddress.phone

  const paymentOptions = [
    payments?.stripe && {
      value: 'stripe',
      label: 'Tarjeta',
      description: 'Visa, Mastercard, AMEX',
      icon: <CreditCard />,
    },
    payments?.mercadopago && {
      value: 'mercadopago',
      label: 'MercadoPago',
      description: 'Tarjetas, OXXO, SPEI',
      icon: <Wallet />,
    },
  ].filter((option): option is { value: string; label: string; description: string; icon: JSX.Element } => !!option)

  const handlePay = async () => {
    if (!shippingMethod || !paymentMethod || items.length === 0 || processing) return
    setProcessing(true)
    const body = {
      ...(selectedAddressId
        ? { addressId: selectedAddressId }
        : {
            address: {
              fullName: inlineAddress.fullName,
              phone: inlineAddress.phone,
              streetLine1: inlineAddress.streetLine1,
              neighborhood: inlineAddress.neighborhood,
              city: inlineAddress.city,
              state: inlineAddress.state,
              postalCode: inlineAddress.postalCode,
              latitude: inlineAddress.latitude,
              longitude: inlineAddress.longitude,
            },
          }),
      shippingMethod,
      discountCode: discount && discountTotal > 0 ? discount.code : undefined,
      items: items.map((item) => ({ productId: item.productId, variantName: item.size, quantity: item.quantity })),
    }

    try {
      const endpoint = paymentMethod === 'stripe' ? '/api/stripe/checkout' : '/api/mercadopago/checkout'
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = (await res.json().catch(() => ({}))) as { sessionUrl?: string; initPoint?: string; error?: string }
      const redirect = paymentMethod === 'stripe' ? data.sessionUrl : data.initPoint
      if (!res.ok || !redirect) throw new Error(data.error || 'No pudimos abrir el pago. Intenta de nuevo.')
      // Only what was checked leaves the cart; unchecked items stay for later
      items.forEach((item) => removeItem(item.productId, item.size))
      resetCheckout()
      toast.info(paymentMethod === 'stripe' ? 'Abriendo el pago seguro…' : 'Abriendo MercadoPago…')
      window.location.href = redirect
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error de conexión. Intenta de nuevo.')
      setProcessing(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      {/* Items: choose what to buy now, change quantities or remove */}
      <section>
        <h3 className="mb-3 text-lg font-bold text-[#111827] dark:text-white">Tu pedido</h3>
        {cartItems.length === 0 ? (
          <p className="rounded-[20px] bg-[#F9FAFB] p-4 text-sm text-[#6B7280] dark:bg-white/[0.04] dark:text-white/55">Tu carrito está vacío.</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {cartItems.map((item) => {
                const key = cartLineKey(item.productId, item.size)
                const included = !excludedKeys.includes(key)
                return (
                  <motion.li
                    key={key}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24, height: 0, marginTop: 0 }}
                    transition={{ type: 'spring', visualDuration: 0.3, bounce: 0 }}
                    className="flex items-center gap-3 rounded-[20px] border border-[#E5E7EB] bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <Checkbox
                      checked={included}
                      onCheckedChange={(checked) => toggleExcluded(key, !checked)}
                      aria-label={`${included ? 'Quitar' : 'Incluir'} ${item.product.name} de esta compra`}
                    />
                    <div className={cn('flex min-w-0 flex-1 items-center gap-3 transition-opacity', !included && 'opacity-45')}>
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-[#F3F4F6] dark:bg-white/10">
                        <Image src={item.product.image} alt={item.product.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#111827] dark:text-white">{item.product.name}</p>
                        <p className="text-xs text-[#6B7280] dark:text-white/50">Talla {item.size}</p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <div className="inline-flex h-8 items-center rounded-full border border-[#E5E7EB] dark:border-white/10">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                              aria-label="Quitar uno"
                              className="grid h-8 w-8 place-items-center text-[#374151] disabled:opacity-30 dark:text-white/70"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold tabular-nums text-[#111827] dark:text-white">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.size, Math.min(MAX_QUANTITY, item.quantity + 1))}
                              disabled={item.quantity >= MAX_QUANTITY}
                              aria-label="Agregar uno"
                              className="grid h-8 w-8 place-items-center text-[#374151] disabled:opacity-30 dark:text-white/70"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-bold tabular-nums text-[#111827] dark:text-white">{formatMXN(item.product.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.productId, item.size)
                        toggleExcluded(key, false)
                      }}
                      aria-label={`Eliminar ${item.product.name} del carrito`}
                      className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <section className="space-y-5">
        <div>
          {/* Same heading row as "Tu pedido", so the coupon lines up with the first item card */}
          <h3 className="mb-3 text-lg font-bold text-[#111827] dark:text-white">Descuento</h3>
          <CouponField subtotal={subtotal} phone={phone} />
        </div>

        <dl className="space-y-2 rounded-[20px] bg-[#F9FAFB] p-4 text-sm dark:bg-white/[0.04]">
          <div className="flex justify-between">
            <dt className="text-[#6B7280] dark:text-white/55">Subtotal</dt>
            <dd className="tabular-nums text-[#111827] dark:text-white">{formatMXN(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#6B7280] dark:text-white/55">Envío</dt>
            <dd className="tabular-nums text-[#111827] dark:text-white">
              {shippingCost === null ? '—' : shippingCost === 0 ? 'Gratis' : formatMXN(shippingCost)}
            </dd>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-300">
              <dt>Cupón {discount?.code}</dt>
              <dd className="tabular-nums">−{formatMXN(discountTotal)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-base font-bold dark:border-white/10">
            <dt className="text-[#111827] dark:text-white">Total</dt>
            <dd className="tabular-nums text-[#111827] dark:text-white">{formatMXN(total)}</dd>
          </div>
        </dl>

        <div>
          <h3 className="mb-3 text-lg font-bold text-[#111827] dark:text-white">Método de pago</h3>
          {paymentOptions.length === 0 ? (
            <p className="text-sm text-[#6B7280] dark:text-white/55">{payments ? 'No hay métodos de pago disponibles por ahora.' : 'Cargando…'}</p>
          ) : (
            <RadioCards
              layout="grid"
              minColumnWidth={150}
              aria-label="Método de pago"
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'mercadopago')}
              options={paymentOptions}
            />
          )}
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF]">
            {/* Same green as the finished steps, for trust */}
            <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Pago seguro y encriptado.</span> El recibo te llega por correo.
            </span>
          </p>
        </div>
      </section>

      <StepFooter>
          <button type="button" onClick={prevStep} disabled={processing} className={SECONDARY_BUTTON}>
            Atrás
          </button>
          <button
            type="button"
            onClick={handlePay}
            disabled={processing || items.length === 0 || !paymentMethod || !shippingMethod}
            className={PRIMARY_BUTTON}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando…
              </>
            ) : items.length === 0 ? (
              'Elige al menos un producto'
            ) : (
              `Pagar ${formatMXN(total)}`
            )}
          </button>
      </StepFooter>
    </div>
  )
}
