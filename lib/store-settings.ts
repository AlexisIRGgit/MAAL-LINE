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
/** Orders at or above this subtotal ship free (also hardcoded in checkout APIs) */
export const FREE_SHIPPING_THRESHOLD = 999

export type ShippingSettings = {
  /** Show the "free shipping over $999" message in the store's top promo bar */
  freeShippingBanner: boolean
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  freeShippingBanner: true,
}

export function readShippingSettings(value: unknown): ShippingSettings {
  const raw = (value ?? {}) as Record<string, unknown>
  return {
    freeShippingBanner:
      typeof raw.freeShippingBanner === 'boolean' ? raw.freeShippingBanner : DEFAULT_SHIPPING_SETTINGS.freeShippingBanner,
  }
}

/** Validates a partial update and merges it over the current values */
export function parseShippingSettingsUpdate(
  current: ShippingSettings,
  input: unknown
): { data: ShippingSettings } | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>
  const next = { ...current }
  if ('freeShippingBanner' in raw) {
    if (typeof raw.freeShippingBanner !== 'boolean') return { error: 'Valor no válido para el aviso de envío gratis' }
    next.freeShippingBanner = raw.freeShippingBanner
  }
  return { data: next }
}

// ---------- Promo bar ----------

export const PROMO_BAR_SETTINGS_KEY = 'store.promoBar'

/** Whether the rotating announcement bar shows at the top of the store */
export function readPromoBarEnabled(value: unknown): boolean {
  const enabled = (value as { enabled?: unknown } | null)?.enabled
  return typeof enabled === 'boolean' ? enabled : true
}
