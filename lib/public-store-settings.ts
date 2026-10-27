import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import {
  LOGO_SETTINGS_KEY,
  PROMO_BAR_SETTINGS_KEY,
  SHIPPING_SETTINGS_KEY,
  readPromoBarEnabled,
  readShippingSettings,
} from '@/lib/store-settings'

/** Admin routes that change these settings call revalidateTag(STORE_SETTINGS_TAG) */
export const STORE_SETTINGS_TAG = 'store-settings'

export type PublicStoreSettings = {
  promoBar: boolean
  freeShippingBanner: boolean
  /** Uploaded store logo; `version` busts browser caches (favicons are cached aggressively) */
  logo: { dataUrl: string; version: string } | null
}

/**
 * Storefront-safe settings, cached in the Next data cache until an admin saves a change,
 * so public pages and the favicon never hit the database per visit.
 */
export const getPublicStoreSettings = unstable_cache(
  async (): Promise<PublicStoreSettings> => {
    const rows = await prisma.storeSetting.findMany({
      where: { key: { in: [SHIPPING_SETTINGS_KEY, LOGO_SETTINGS_KEY, PROMO_BAR_SETTINGS_KEY] } },
      select: { key: true, value: true, updatedAt: true },
    })
    const shipping = rows.find((row) => row.key === SHIPPING_SETTINGS_KEY)
    const logoRow = rows.find((row) => row.key === LOGO_SETTINGS_KEY)
    const promoBarRow = rows.find((row) => row.key === PROMO_BAR_SETTINGS_KEY)
    const logoUrl = (logoRow?.value as { url?: unknown } | null)?.url

    return {
      promoBar: readPromoBarEnabled(promoBarRow?.value),
      freeShippingBanner: readShippingSettings(shipping?.value).freeShippingBanner,
      logo:
        logoRow && typeof logoUrl === 'string'
          ? { dataUrl: logoUrl, version: String(logoRow.updatedAt.getTime()) }
          : null,
    }
  },
  ['public-store-settings'],
  { tags: [STORE_SETTINGS_TAG] }
)
