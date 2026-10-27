import { NextResponse } from 'next/server'
import { getPublicStoreSettings } from '@/lib/public-store-settings'
import { DEFAULT_PAYMENT_SETTINGS } from '@/lib/store-settings'

// Without this, Next 14 renders the handler once at build time and freezes the value
export const dynamic = 'force-dynamic'

// GET - Public, storefront-safe settings only (no auth)
export async function GET() {
  try {
    const { promoBar, freeShippingBanner, payments } = await getPublicStoreSettings()
    // Served from the Next data cache (invalidated on save), so skip the CDN cache:
    // admin changes must show up right away
    return NextResponse.json({ promoBar, freeShippingBanner, payments }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Store settings error:', error)
    return NextResponse.json({ promoBar: true, freeShippingBanner: true, payments: DEFAULT_PAYMENT_SETTINGS }, { headers: { 'Cache-Control': 'no-store' } })
  }
}
