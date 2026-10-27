import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { STORE_SETTINGS_TAG } from '@/lib/public-store-settings'
import {
  PAYMENT_PROVIDERS,
  PAYMENT_SETTINGS_KEY,
  readPaymentSettings,
  type PaymentProvider,
} from '@/lib/store-settings'

// GET - Which payment providers the checkout offers
export async function GET() {
  try {
    await requirePermission('settings:view')
    const row = await prisma.storeSetting.findUnique({ where: { key: PAYMENT_SETTINGS_KEY } })
    return NextResponse.json({ settings: readPaymentSettings(row?.value) })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PUT - { provider: 'stripe' | 'mercadopago', enabled: boolean }
export async function PUT(request: NextRequest) {
  try {
    const session = await requirePermission('settings:payments')
    const body = await request.json().catch(() => null)
    const provider = body?.provider as PaymentProvider
    if (!PAYMENT_PROVIDERS.includes(provider) || typeof body?.enabled !== 'boolean') {
      return NextResponse.json({ error: 'Valor no válido' }, { status: 400 })
    }

    const current = await prisma.storeSetting.findUnique({ where: { key: PAYMENT_SETTINGS_KEY } })
    const next = { ...readPaymentSettings(current?.value), [provider]: body.enabled }
    // The store can't sell with every provider off
    if (!PAYMENT_PROVIDERS.some((p) => next[p])) {
      return NextResponse.json({ error: 'Debe quedar al menos un método de pago activo' }, { status: 400 })
    }

    const row = await prisma.storeSetting.upsert({
      where: { key: PAYMENT_SETTINGS_KEY },
      create: {
        key: PAYMENT_SETTINGS_KEY,
        value: next,
        category: 'payments',
        description: 'Métodos de pago activos en el checkout',
        updatedById: session.user.id,
      },
      update: { value: next, updatedById: session.user.id },
    })
    revalidateTag(STORE_SETTINGS_TAG)

    return NextResponse.json({ settings: readPaymentSettings(row.value) })
  } catch (error) {
    return handleAuthError(error)
  }
}
