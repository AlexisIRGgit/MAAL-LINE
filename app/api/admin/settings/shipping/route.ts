import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { SHIPPING_SETTINGS_KEY, parseShippingSettingsUpdate, readShippingSettings } from '@/lib/store-settings'

// GET - Shipping settings (defaults until first saved)
export async function GET() {
  try {
    await requirePermission('settings:view')
    const row = await prisma.storeSetting.findUnique({ where: { key: SHIPPING_SETTINGS_KEY } })
    return NextResponse.json({ settings: readShippingSettings(row?.value) })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PUT - Partial update, e.g. { freeShippingBanner: false }
export async function PUT(request: NextRequest) {
  try {
    const session = await requirePermission('settings:shipping')
    const body = await request.json().catch(() => null)

    const row = await prisma.storeSetting.findUnique({ where: { key: SHIPPING_SETTINGS_KEY } })
    const parsed = parseShippingSettingsUpdate(readShippingSettings(row?.value), body)
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const saved = await prisma.storeSetting.upsert({
      where: { key: SHIPPING_SETTINGS_KEY },
      create: {
        key: SHIPPING_SETTINGS_KEY,
        value: parsed.data,
        category: 'shipping',
        description: 'Opciones de envío',
        updatedById: session.user.id,
      },
      update: { value: parsed.data, updatedById: session.user.id },
    })

    return NextResponse.json({ settings: readShippingSettings(saved.value) })
  } catch (error) {
    return handleAuthError(error)
  }
}
