import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { GENERAL_SETTINGS_KEY, parseGeneralSettings, readGeneralSettings } from '@/lib/store-settings'

// GET - General store settings (defaults until first saved)
export async function GET() {
  try {
    await requirePermission('settings:view')
    const row = await prisma.storeSetting.findUnique({ where: { key: GENERAL_SETTINGS_KEY } })
    return NextResponse.json({ settings: readGeneralSettings(row?.value), updatedAt: row?.updatedAt ?? null })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PUT - Save general store settings
export async function PUT(request: NextRequest) {
  try {
    const session = await requirePermission('settings:edit')
    const body = await request.json().catch(() => null)
    const parsed = parseGeneralSettings(body)
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const row = await prisma.storeSetting.upsert({
      where: { key: GENERAL_SETTINGS_KEY },
      create: {
        key: GENERAL_SETTINGS_KEY,
        value: parsed.data,
        category: 'general',
        description: 'Nombre, contacto y moneda de la tienda',
        updatedById: session.user.id,
      },
      update: { value: parsed.data, updatedById: session.user.id },
    })

    return NextResponse.json({ settings: readGeneralSettings(row.value), updatedAt: row.updatedAt })
  } catch (error) {
    return handleAuthError(error)
  }
}
