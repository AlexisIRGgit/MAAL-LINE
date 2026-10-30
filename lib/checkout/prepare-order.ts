// Server-side checkout shared by the Stripe and MercadoPago routes: validates the cart, the address
// (a saved one for signed-in customers, or one typed in the modal by guests), shipping and the coupon,
// then creates the pending order. Prices always come from the database, never from the client.
import { nanoid } from 'nanoid'
import type { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getPublicStoreSettings } from '@/lib/public-store-settings'
import { shippingCostFor, type ShippingMethod } from '@/lib/store-settings'
import { discountAmount, type DiscountKind, type DiscountRule } from '@/lib/discounts'

const MAX_LINES = 30
const MAX_QUANTITY = 20
const PHONE_RE = /^\d{10}$/
const POSTAL_RE = /^\d{5}$/

export interface ShippingAddressJson {
  fullName: string
  phone: string | null
  streetLine1: string
  streetLine2: string | null
  neighborhood: string | null
  city: string
  state: string
  postalCode: string
  country: string
  latitude?: number | null
  longitude?: number | null
}

export interface OrderLine {
  productId: string
  variantId: string | null
  productName: string
  variantName: string | null
  sku: string | null
  imageUrl: string | null
  quantity: number
  unitPrice: number
  total: number
}

export interface PreparedCheckout {
  userId: string | null
  email: string
  phone: string | null
  address: ShippingAddressJson
  shippingMethod: string
  shippingOption: ShippingMethod
  lines: OrderLine[]
  subtotal: number
  shippingTotal: number
  discount: { id: string; code: string; amount: number } | null
  total: number
}

export type CheckoutFailure = { error: string; status: number }

const text = (value: unknown, max: number): string => (typeof value === 'string' ? value.trim().slice(0, max) : '')

/** Address typed in the checkout modal (guests, or a signed-in customer using a new address) */
function parseInlineAddress(input: unknown): ShippingAddressJson | CheckoutFailure {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const fullName = text(raw.fullName, 100)
  const phone = text(raw.phone, 20).replace(/\D/g, '')
  const streetLine1 = text(raw.streetLine1, 255)
  const city = text(raw.city, 100)
  const state = text(raw.state, 100)
  const postalCode = text(raw.postalCode, 10)
  if (fullName.length < 2) return { error: 'Escribe el nombre de quien recibe', status: 400 }
  if (!PHONE_RE.test(phone)) return { error: 'El teléfono debe tener 10 dígitos', status: 400 }
  if (!streetLine1 || !city || !state) return { error: 'Elige tu dirección en el buscador', status: 400 }
  if (!POSTAL_RE.test(postalCode)) return { error: 'La dirección necesita un código postal de 5 dígitos', status: 400 }
  const lat = typeof raw.latitude === 'number' && Number.isFinite(raw.latitude) ? raw.latitude : null
  const lng = typeof raw.longitude === 'number' && Number.isFinite(raw.longitude) ? raw.longitude : null
  return {
    fullName,
    phone,
    streetLine1,
    streetLine2: text(raw.streetLine2, 255) || null,
    neighborhood: text(raw.neighborhood, 100) || null,
    city,
    state,
    postalCode,
    country: 'MX',
    latitude: lat,
    longitude: lng,
  }
}

/**
 * Looks up a coupon and checks it can be used on this cart. `subtotal` is the merchandise total
 * the coupon would apply to; the caller computes the amount with `discountAmount()`.
 */
export async function findDiscount(
  rawCode: string,
  { subtotal, userId, phone }: { subtotal: number; userId: string | null; phone: string | null }
): Promise<{ id: string; rule: DiscountRule } | CheckoutFailure> {
  const code = rawCode.trim().toUpperCase().slice(0, 50)
  if (!code) return { error: 'Escribe un código', status: 400 }
  const discount = await prisma.discount.findUnique({ where: { code } })
  const now = new Date()
  if (!discount || !discount.isActive || discount.deletedAt || discount.startsAt > now) {
    return { error: 'Este código no existe', status: 404 }
  }
  if (discount.expiresAt && discount.expiresAt < now) return { error: 'Este código ya expiró', status: 400 }
  if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
    return { error: 'Este código ya se agotó', status: 400 }
  }
  if (discount.type === 'buy_x_get_y') return { error: 'Este código no aplica en la tienda en línea', status: 400 }
  if (discount.customerEligibility !== 'all') {
    // Coupons for specific customers need an account to check against
    if (!userId || !discount.customerIds.includes(userId)) return { error: 'Este código no está disponible para ti', status: 403 }
  }

  if (discount.usageLimitPerUser > 0) {
    // Guests are matched by phone across paid orders
    const used = userId
      ? await prisma.discountUsage.count({ where: { discountId: discount.id, userId } })
      : phone
        ? await prisma.order.count({ where: { discountId: discount.id, phone, paymentStatus: 'paid' } })
        : 0
    if (used >= discount.usageLimitPerUser) return { error: 'Ya usaste este código', status: 400 }
  }

  const rule: DiscountRule = {
    code: discount.code,
    type: discount.type as DiscountKind,
    value: Number(discount.value),
    minimumPurchase: discount.minimumPurchase === null ? null : Number(discount.minimumPurchase),
    maximumDiscount: discount.maximumDiscount === null ? null : Number(discount.maximumDiscount),
    description: discount.description,
  }
  if (rule.minimumPurchase !== null && subtotal < rule.minimumPurchase) {
    const min = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(rule.minimumPurchase)
    return { error: `Este código requiere una compra mínima de ${min}`, status: 400 }
  }
  return { id: discount.id, rule }
}

/** Validates a checkout request body. Works with or without a session. */
export async function prepareCheckout(body: unknown): Promise<PreparedCheckout | CheckoutFailure> {
  const raw = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const session = await auth()
  const userId = session?.user?.id ?? null

  // Items
  const rawItems = Array.isArray(raw.items) ? raw.items.slice(0, MAX_LINES + 1) : []
  if (rawItems.length === 0) return { error: 'Tu carrito está vacío', status: 400 }
  if (rawItems.length > MAX_LINES) return { error: 'Demasiados productos en un solo pedido', status: 400 }
  const items = rawItems.map((item) => {
    const entry = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
    const quantity = Number(entry.quantity)
    return {
      productId: text(entry.productId, 64),
      variantName: text(entry.variantName, 50),
      quantity: Number.isInteger(quantity) ? quantity : 0,
    }
  })
  if (items.some((item) => !item.productId || item.quantity < 1 || item.quantity > MAX_QUANTITY)) {
    return { error: 'Revisa las cantidades de tu carrito', status: 400 }
  }

  // Address
  let address: ShippingAddressJson
  const addressId = text(raw.addressId, 64)
  if (addressId) {
    if (!userId) return { error: 'Inicia sesión para usar una dirección guardada', status: 401 }
    const saved = await prisma.address.findFirst({ where: { id: addressId, userId } })
    if (!saved) return { error: 'Dirección no encontrada', status: 404 }
    address = {
      fullName: saved.fullName,
      phone: saved.phone,
      streetLine1: saved.streetLine1,
      streetLine2: saved.streetLine2,
      neighborhood: saved.neighborhood,
      city: saved.city,
      state: saved.state,
      postalCode: saved.postalCode,
      country: saved.country,
    }
  } else {
    const parsed = parseInlineAddress(raw.address)
    if ('error' in parsed) return parsed
    address = parsed
  }

  // Products and current prices (the same product can be in the cart in two sizes)
  const productIds = Array.from(new Set(items.map((item) => item.productId)))
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: 'active' },
    include: { variants: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
  })
  if (products.length !== productIds.length) return { error: 'Algunos productos ya no están disponibles', status: 400 }

  const lines: OrderLine[] = []
  let subtotal = 0
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) continue
    const variant = product.variants.find((v) => v.size === item.variantName || v.color === item.variantName)
    if (variant && variant.stockQuantity < item.quantity) {
      return { error: `Stock insuficiente para ${product.name}${item.variantName ? ` (${item.variantName})` : ''}`, status: 400 }
    }
    const unitPrice = Number(product.price)
    const total = unitPrice * item.quantity
    subtotal += total
    lines.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      productName: product.name,
      variantName: item.variantName || null,
      sku: variant?.sku ?? null,
      // Only real URLs are copied onto the order; inline base64 images would bloat every order query
      imageUrl: product.images[0]?.url?.startsWith('data:') ? null : (product.images[0]?.url ?? null),
      quantity: item.quantity,
      unitPrice,
      total,
    })
  }

  // Shipping: costs, names and free-shipping rules come from Admin > Configuración > Envíos
  const shippingMethod = text(raw.shippingMethod, 50)
  const { shipping } = await getPublicStoreSettings()
  const shippingTotal = shippingCostFor(shipping, shippingMethod, subtotal)
  const shippingOption = shipping.methods.find((m) => m.id === shippingMethod)
  if (shippingTotal === null || !shippingOption) return { error: 'Este método de envío no está disponible', status: 400 }

  // Coupon
  let discount: PreparedCheckout['discount'] = null
  const discountCode = text(raw.discountCode, 50)
  if (discountCode) {
    const found = await findDiscount(discountCode, { subtotal, userId, phone: address.phone })
    if ('error' in found) return found
    const amount = discountAmount(found.rule, subtotal, shippingTotal)
    if (amount > 0) discount = { id: found.id, code: found.rule.code, amount }
  }

  const total = Math.round((subtotal + shippingTotal - (discount?.amount ?? 0)) * 100) / 100
  return {
    userId,
    // Guests have no email yet: Stripe/MercadoPago collect it and the webhook stores it
    email: session?.user?.email ?? '',
    phone: address.phone,
    address,
    shippingMethod,
    shippingOption,
    lines,
    subtotal,
    shippingTotal,
    discount,
    total,
  }
}

/** Creates the order in pending/unpaid state. Stock and coupon usage are counted by the payment webhooks. */
export function createPendingOrder(prepared: PreparedCheckout) {
  return prisma.order.create({
    data: {
      orderNumber: `ML-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`,
      userId: prepared.userId,
      email: prepared.email,
      phone: prepared.phone,
      status: 'pending',
      paymentStatus: 'pending',
      subtotal: prepared.subtotal,
      shippingTotal: prepared.shippingTotal,
      discountTotal: prepared.discount?.amount ?? 0,
      total: prepared.total,
      shippingAddress: { ...prepared.address } satisfies Prisma.InputJsonObject,
      shippingMethod: prepared.shippingMethod,
      discountCode: prepared.discount?.code ?? null,
      discountId: prepared.discount?.id ?? null,
      source: prepared.userId ? 'web' : 'web_guest',
      items: { create: prepared.lines },
    },
  })
}

/** Shipping line label, e.g. "Envío estándar (2–5 días hábiles)" */
export function shippingLabel(option: ShippingMethod): string {
  return option.description ? `${option.name} (${option.description})` : option.name
}
