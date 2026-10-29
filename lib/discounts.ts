// Discount math shared by the checkout modal (live preview) and the payment routes (the amount actually charged).
// Pure and client-safe: no Prisma here.

export type DiscountKind = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y'

export interface DiscountRule {
  code: string
  type: DiscountKind
  value: number
  minimumPurchase: number | null
  maximumDiscount: number | null
  description: string | null
}

/** Pesos the rule takes off this cart; 0 when the cart is below the minimum purchase. Never more than the order. */
export function discountAmount(rule: DiscountRule, subtotal: number, shippingTotal: number): number {
  if (subtotal <= 0) return 0
  if (rule.minimumPurchase !== null && subtotal < rule.minimumPurchase) return 0
  let amount = 0
  if (rule.type === 'percentage') {
    amount = subtotal * (rule.value / 100)
    if (rule.maximumDiscount !== null) amount = Math.min(amount, rule.maximumDiscount)
  } else if (rule.type === 'fixed_amount') {
    amount = Math.min(rule.value, subtotal)
  } else if (rule.type === 'free_shipping') {
    amount = shippingTotal
  }
  return Math.round(Math.max(0, Math.min(amount, subtotal + shippingTotal)) * 100) / 100
}

/** Short Spanish label for the applied-coupon chip, e.g. "15% de descuento" or "Envío gratis" */
export function discountLabel(rule: DiscountRule): string {
  if (rule.type === 'percentage') return `${rule.value}% de descuento`
  if (rule.type === 'free_shipping') return 'Envío gratis'
  if (rule.type === 'fixed_amount') {
    const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(rule.value)
    return `${pesos} de descuento`
  }
  return 'Descuento'
}
