// Store settings live in store_settings as one JSON row per section (key = "store.<section>")

export const CURRENCIES = ['MXN', 'USD'] as const

export type GeneralSettings = {
  storeName: string
  contactEmail: string
  phone: string
  currency: (typeof CURRENCIES)[number]
}

export const GENERAL_SETTINGS_KEY = 'store.general'

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  storeName: 'MAAL LINE',
  contactEmail: 'hola@maalline.com',
  phone: '+52 55 1234 5678',
  currency: 'MXN',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+\d\s().-]{7,25}$/

/** Returns the cleaned settings, or a Spanish error message for the first invalid field */
export function parseGeneralSettings(input: unknown): { data: GeneralSettings } | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>
  const storeName = typeof raw.storeName === 'string' ? raw.storeName.trim() : ''
  const contactEmail = typeof raw.contactEmail === 'string' ? raw.contactEmail.trim().toLowerCase() : ''
  const phone = typeof raw.phone === 'string' ? raw.phone.trim() : ''
  const currency = raw.currency

  if (!storeName || storeName.length > 100) return { error: 'El nombre de la tienda debe tener entre 1 y 100 caracteres' }
  if (!EMAIL_RE.test(contactEmail) || contactEmail.length > 255) return { error: 'El email de contacto no es válido' }
  if (phone && !PHONE_RE.test(phone)) return { error: 'El teléfono no es válido' }
  if (!CURRENCIES.includes(currency as GeneralSettings['currency'])) return { error: 'Moneda no válida' }

  return { data: { storeName, contactEmail, phone, currency: currency as GeneralSettings['currency'] } }
}

/** Merges a stored JSON value over the defaults, ignoring anything malformed */
export function readGeneralSettings(value: unknown): GeneralSettings {
  const parsed = parseGeneralSettings({ ...DEFAULT_GENERAL_SETTINGS, ...((value as object) ?? {}) })
  return 'data' in parsed ? parsed.data : DEFAULT_GENERAL_SETTINGS
}

// ---------- Logo ----------

export const LOGO_SETTINGS_KEY = 'store.logo'
/** Max length of the stored data URI (~300KB image); the client resizes before upload */
export const MAX_LOGO_DATA_URL_LENGTH = 400_000
/** Raster only: an SVG data URI could carry scripts if someone opened it directly */
const LOGO_DATA_URL_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/

export function parseLogoDataUrl(input: unknown): { data: string } | { error: string } {
  if (typeof input !== 'string' || !LOGO_DATA_URL_RE.test(input)) {
    return { error: 'Formato de imagen no válido. Usa PNG, JPG o WebP' }
  }
  if (input.length > MAX_LOGO_DATA_URL_LENGTH) {
    return { error: 'El logo es demasiado pesado' }
  }
  return { data: input }
}

// ---------- Shipping ----------

export const SHIPPING_SETTINGS_KEY = 'store.shipping'
/** Fixed method ids: orders store them and the checkout maps them to icons */
export const SHIPPING_METHOD_IDS = ['standard', 'express', 'next_day'] as const
export type ShippingMethodId = (typeof SHIPPING_METHOD_IDS)[number]

export type ShippingMethod = {
  id: ShippingMethodId
  name: string
  description: string
  /** MXN */
  price: number
  enabled: boolean
  /** Ships free when the subtotal reaches freeShippingThreshold */
  freeEligible: boolean
}

export type ShippingSettings = {
  /** Show the "free shipping over $X" message in the store's top promo bar */
  freeShippingBanner: boolean
  /** MXN subtotal for free shipping on eligible methods; null turns it off */
  freeShippingThreshold: number | null
  methods: ShippingMethod[]
}

export const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  { id: 'standard', name: 'Envío Estándar', description: '5-7 días hábiles', price: 99, enabled: true, freeEligible: true },
  { id: 'express', name: 'Envío Express', description: '2-3 días hábiles', price: 199, enabled: true, freeEligible: false },
  { id: 'next_day', name: 'Envío al Día Siguiente', description: '1 día hábil', price: 349, enabled: true, freeEligible: false },
]

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  freeShippingBanner: true,
  freeShippingThreshold: 999,
  methods: DEFAULT_SHIPPING_METHODS,
}

const isPrice = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100_000

function readMethod(defaults: ShippingMethod, raw: Record<string, unknown> | undefined): ShippingMethod {
  const text = (v: unknown, max: number, fallback: string) =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : fallback
  return {
    id: defaults.id,
    name: text(raw?.name, 60, defaults.name),
    description: text(raw?.description, 80, defaults.description),
    price: isPrice(raw?.price) ? Math.round(raw.price * 100) / 100 : defaults.price,
    enabled: typeof raw?.enabled === 'boolean' ? raw.enabled : defaults.enabled,
    freeEligible: typeof raw?.freeEligible === 'boolean' ? raw.freeEligible : defaults.freeEligible,
  }
}

export function readShippingSettings(value: unknown): ShippingSettings {
  const raw = (value ?? {}) as Record<string, unknown>
  const rawMethods = Array.isArray(raw.methods) ? (raw.methods as Record<string, unknown>[]) : []
  return {
    freeShippingBanner:
      typeof raw.freeShippingBanner === 'boolean' ? raw.freeShippingBanner : DEFAULT_SHIPPING_SETTINGS.freeShippingBanner,
    freeShippingThreshold:
      raw.freeShippingThreshold === null
        ? null
        : isPrice(raw.freeShippingThreshold)
          ? raw.freeShippingThreshold
          : DEFAULT_SHIPPING_SETTINGS.freeShippingThreshold,
    methods: DEFAULT_SHIPPING_METHODS.map((defaults) =>
      readMethod(defaults, rawMethods.find((m) => m?.id === defaults.id))
    ),
  }
}

/** Validates a partial update and merges it over the current values */
export function parseShippingSettingsUpdate(
  current: ShippingSettings,
  input: unknown
): { data: ShippingSettings } | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>
  const next: ShippingSettings = { ...current, methods: current.methods.map((m) => ({ ...m })) }

  if ('freeShippingBanner' in raw) {
    if (typeof raw.freeShippingBanner !== 'boolean') return { error: 'Valor no válido para el aviso de envío gratis' }
    next.freeShippingBanner = raw.freeShippingBanner
  }

  if ('freeShippingThreshold' in raw) {
    if (raw.freeShippingThreshold !== null && !isPrice(raw.freeShippingThreshold)) {
      return { error: 'El monto para envío gratis no es válido' }
    }
    next.freeShippingThreshold = raw.freeShippingThreshold as number | null
  }

  if ('methods' in raw) {
    if (!Array.isArray(raw.methods)) return { error: 'Métodos de envío no válidos' }
    for (const update of raw.methods as Record<string, unknown>[]) {
      const method = next.methods.find((m) => m.id === update?.id)
      if (!method) return { error: 'Método de envío desconocido' }
      if ('name' in update) {
        if (typeof update.name !== 'string' || !update.name.trim() || update.name.trim().length > 60) {
          return { error: 'El nombre del envío debe tener entre 1 y 60 caracteres' }
        }
        method.name = update.name.trim()
      }
      if ('description' in update) {
        if (typeof update.description !== 'string' || update.description.trim().length > 80) {
          return { error: 'La descripción del envío debe tener máximo 80 caracteres' }
        }
        method.description = update.description.trim()
      }
      if ('price' in update) {
        if (!isPrice(update.price)) return { error: 'El costo del envío no es válido' }
        method.price = Math.round(update.price * 100) / 100
      }
      if ('enabled' in update) {
        if (typeof update.enabled !== 'boolean') return { error: 'Valor no válido' }
        method.enabled = update.enabled
      }
      if ('freeEligible' in update) {
        if (typeof update.freeEligible !== 'boolean') return { error: 'Valor no válido' }
        method.freeEligible = update.freeEligible
      }
    }
    if (!next.methods.some((m) => m.enabled)) return { error: 'Debe quedar al menos un método de envío activo' }
  }

  return { data: next }
}

/** Cost of a method for a subtotal, or null when it doesn't exist or is off. Server and checkout share it. */
export function shippingCostFor(settings: ShippingSettings, methodId: string, subtotal: number): number | null {
  const method = settings.methods.find((m) => m.id === methodId)
  if (!method || !method.enabled) return null
  const free =
    method.freeEligible && settings.freeShippingThreshold !== null && subtotal >= settings.freeShippingThreshold
  return free ? 0 : method.price
}

// ---------- Promo bar ----------

export const PROMO_BAR_SETTINGS_KEY = 'store.promoBar'

/** Whether the rotating announcement bar shows at the top of the store */
export function readPromoBarEnabled(value: unknown): boolean {
  const enabled = (value as { enabled?: unknown } | null)?.enabled
  return typeof enabled === 'boolean' ? enabled : true
}

// ---------- Notifications ----------

export const NOTIFICATION_SETTINGS_KEY = 'store.notifications'

export type NotificationSettings = {
  /** Paid order: ntfy push + email to the store contact address */
  newOrder: boolean
  /** Order marked as shipped: email to the customer */
  orderShipped: boolean
  /** A variant reaches its low-stock threshold after a sale: ntfy push + email */
  lowStock: boolean
  /** New customer account: welcome email to them + ntfy push to the owner */
  newAccount: boolean
}

export const NOTIFICATION_KEYS = ['newOrder', 'orderShipped', 'lowStock', 'newAccount'] as const
export type NotificationKey = (typeof NOTIFICATION_KEYS)[number]

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  newOrder: true,
  orderShipped: true,
  lowStock: true,
  newAccount: true,
}

export function readNotificationSettings(value: unknown): NotificationSettings {
  const raw = (value ?? {}) as Record<string, unknown>
  // "paidOrderPush" was the first name of the new-order switch
  const legacy = { newOrder: raw.paidOrderPush }
  const pick = (key: NotificationKey) => {
    const v = raw[key] ?? legacy[key as keyof typeof legacy]
    return typeof v === 'boolean' ? v : DEFAULT_NOTIFICATION_SETTINGS[key]
  }
  return {
    newOrder: pick('newOrder'),
    orderShipped: pick('orderShipped'),
    lowStock: pick('lowStock'),
    newAccount: pick('newAccount'),
  }
}

// ---------- Payments ----------

export const PAYMENT_SETTINGS_KEY = 'store.payments'
/** Providers with a working integration; the checkout only offers enabled ones */
export const PAYMENT_PROVIDERS = ['stripe', 'mercadopago'] as const
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number]
export type PaymentSettings = Record<PaymentProvider, boolean>

// Stripe only for now (owner's decision, 2026-10-27)
export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  stripe: true,
  mercadopago: false,
}

export function readPaymentSettings(value: unknown): PaymentSettings {
  const raw = (value ?? {}) as Record<string, unknown>
  return {
    stripe: typeof raw.stripe === 'boolean' ? raw.stripe : DEFAULT_PAYMENT_SETTINGS.stripe,
    mercadopago: typeof raw.mercadopago === 'boolean' ? raw.mercadopago : DEFAULT_PAYMENT_SETTINGS.mercadopago,
  }
}
