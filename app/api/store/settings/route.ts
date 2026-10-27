import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SHIPPING_SETTINGS_KEY, readShippingSettings } from '@/lib/store-settings'

// GET - Public, storefront-safe settings only (no auth)
export async function GET() {
  try {
    const row = await prisma.storeSetting.findUnique({ where: { key: SHIPPING_SETTINGS_KEY } })
    const { freeShippingBanner } = readShippingSettings(row?.value)
    return NextResponse.json(
      { freeShippingBanner },
      // Short CDN cache: admin changes show up within a minute
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  } catch (error) {
    console.error('Store settings error:', error)
    return NextResponse.json({ freeShippingBanner: true })
  }
}
