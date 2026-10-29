'use client'

import { useCartStore, type CartItem } from '@/lib/store/cart-store'
import { cartLineKey, useCheckoutModalStore } from '@/lib/store/checkout-modal-store'
import { DEFAULT_SHIPPING_SETTINGS, shippingCostFor } from '@/lib/store-settings'
import { discountAmount } from '@/lib/discounts'

/** $1,198 for whole pesos, $1,018.30 when there are cents */
export const formatMXN = (value: number) => {
  const cents = Math.round(value * 100) % 100 !== 0
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(value)
}

export interface CheckoutTotals {
  /** Cart lines still checked for this purchase */
  items: CartItem[]
  units: number
  subtotal: number
  /** null until a shipping method is chosen */
  shippingCost: number | null
  discount: number
  /** A coupon is applied but the checked items don't reach its minimum */
  belowMinimum: boolean
  total: number
}

/** Live totals for the checkout modal: they follow the checkboxes, quantities, shipping and coupon. */
export function useCheckoutTotals(): CheckoutTotals {
  const cartItems = useCartStore((s) => s.items)
  const { excludedKeys, shipping, shippingMethod, discount: rule } = useCheckoutModalStore()

  const items = cartItems.filter((item) => !excludedKeys.includes(cartLineKey(item.productId, item.size)))
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const units = items.reduce((sum, item) => sum + item.quantity, 0)
  const shippingCost =
    shipping && shippingMethod ? shippingCostFor({ ...DEFAULT_SHIPPING_SETTINGS, ...shipping }, shippingMethod, subtotal) : null
  const discount = rule ? discountAmount(rule, subtotal, shippingCost ?? 0) : 0
  const belowMinimum = !!rule && rule.minimumPurchase !== null && subtotal < rule.minimumPurchase
  const total = Math.max(0, subtotal + (shippingCost ?? 0) - discount)

  return { items, units, subtotal, shippingCost, discount, belowMinimum, total }
}
