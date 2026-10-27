import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { isNtfyConfigured, sendNtfy } from '@/lib/ntfy'
import { NOTIFICATION_SETTINGS_KEY, readNotificationSettings } from '@/lib/store-settings'

// GET - Notification switches, plus whether the ntfy topic is configured on the server
export async function GET() {
  try {
    await requirePermission('settings:view')
    const row = await prisma.storeSetting.findUnique({ where: { key: NOTIFICATION_SETTINGS_KEY } })
    return NextResponse.json({ settings: readNotificationSettings(row?.value), ntfyConfigured: isNtfyConfigured() })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PUT - { paidOrderPush: boolean }
export async function PUT(request: NextRequest) {
  try {
    const session = await requirePermission('settings:edit')
    const body = await request.json().catch(() => null)
    if (typeof body?.paidOrderPush !== 'boolean') {
      return NextResponse.json({ error: 'Valor no válido' }, { status: 400 })
    }

    const current = await prisma.storeSetting.findUnique({ where: { key: NOTIFICATION_SETTINGS_KEY } })
    const next = { ...readNotificationSettings(current?.value), paidOrderPush: body.paidOrderPush }
    const row = await prisma.storeSetting.upsert({
      where: { key: NOTIFICATION_SETTINGS_KEY },
      create: {
        key: NOTIFICATION_SETTINGS_KEY,
        value: next,
        category: 'notifications',
        description: 'Notificaciones para el dueño de la tienda',
        updatedById: session.user.id,
      },
      update: { value: next, updatedById: session.user.id },
    })

    return NextResponse.json({ settings: readNotificationSettings(row.value) })
  } catch (error) {
    return handleAuthError(error)
  }
}

// POST - Sends a test push to the configured ntfy topic
export async function POST() {
  try {
    await requirePermission('settings:edit')
    if (!isNtfyConfigured()) {
      return NextResponse.json({ error: 'Falta configurar NTFY_TOPIC_URL en el servidor' }, { status: 400 })
    }
    const sent = await sendNtfy({
      title: '🔔 Prueba de MAAL LINE',
      message: 'Las notificaciones de pagos confirmados están funcionando.',
      tags: ['white_check_mark'],
    })
    if (!sent) {
      return NextResponse.json({ error: 'ntfy no respondió, revisa la URL del tema' }, { status: 502 })
    }
    return NextResponse.json({ sent: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
