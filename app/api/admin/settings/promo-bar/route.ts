import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { STORE_SETTINGS_TAG } from '@/lib/public-store-settings'
import { PROMO_BAR_SETTINGS_KEY, readPromoBarEnabled } from '@/lib/store-settings'

// GET - Whether the store's announcement bar is on
export async function GET() {
  try {
    await requirePermission('settings:view')
    const row = await prisma.storeSetting.findUnique({ where: { key: PROMO_BAR_SETTINGS_KEY } })
    return NextResponse.json({ enabled: readPromoBarEnabled(row?.value) })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PUT - { enabled: boolean }
export async function PUT(request: NextRequest) {
  try {
    const session = await requirePermission('settings:edit')
    const body = await request.json().catch(() => null)
    if (typeof body?.enabled !== 'boolean') {
      return NextResponse.json({ error: 'Valor no válido' }, { status: 400 })
    }

    const row = await prisma.storeSetting.upsert({
      where: { key: PROMO_BAR_SETTINGS_KEY },
      create: {
        key: PROMO_BAR_SETTINGS_KEY,
        value: { enabled: body.enabled },
        category: 'general',
        description: 'Barra de anuncios de la tienda',
        updatedById: session.user.id,
      },
      update: { value: { enabled: body.enabled }, updatedById: session.user.id },
    })
    revalidateTag(STORE_SETTINGS_TAG)

    return NextResponse.json({ enabled: readPromoBarEnabled(row.value) })
  } catch (error) {
    return handleAuthError(error)
  }
}
