import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { isEmailConfigured, sendEmail } from '@/lib/email'
import { customerWelcomeEmail } from '@/lib/email-templates'
import { isNtfyConfigured, sendNtfy } from '@/lib/ntfy'
import {
  GENERAL_SETTINGS_KEY,
  NOTIFICATION_KEYS,
  NOTIFICATION_SETTINGS_KEY,
  readGeneralSettings,
  readNotificationSettings,
  type NotificationKey,
} from '@/lib/store-settings'

async function ownerEmail() {
  const row = await prisma.storeSetting.findUnique({ where: { key: GENERAL_SETTINGS_KEY } })
  return readGeneralSettings(row?.value).contactEmail
}

// GET - Switches, which channels are configured, and where owner emails go
export async function GET() {
  try {
    await requirePermission('settings:view')
    const row = await prisma.storeSetting.findUnique({ where: { key: NOTIFICATION_SETTINGS_KEY } })
    return NextResponse.json({
      settings: readNotificationSettings(row?.value),
      ntfyConfigured: isNtfyConfigured(),
      emailConfigured: isEmailConfigured(),
      ownerEmail: await ownerEmail(),
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PUT - { key: 'newOrder' | 'orderShipped' | 'lowStock' | 'newAccount', enabled: boolean }
export async function PUT(request: NextRequest) {
  try {
    const session = await requirePermission('settings:edit')
    const body = await request.json().catch(() => null)
    const key = body?.key as NotificationKey
    if (!NOTIFICATION_KEYS.includes(key) || typeof body?.enabled !== 'boolean') {
      return NextResponse.json({ error: 'Valor no válido' }, { status: 400 })
    }

    const current = await prisma.storeSetting.findUnique({ where: { key: NOTIFICATION_SETTINGS_KEY } })
    const next = { ...readNotificationSettings(current?.value), [key]: body.enabled }
    const row = await prisma.storeSetting.upsert({
      where: { key: NOTIFICATION_SETTINGS_KEY },
      create: {
        key: NOTIFICATION_SETTINGS_KEY,
        value: next,
        category: 'notifications',
        description: 'Notificaciones de la tienda',
        updatedById: session.user.id,
      },
      update: { value: next, updatedById: session.user.id },
    })

    return NextResponse.json({ settings: readNotificationSettings(row.value) })
  } catch (error) {
    return handleAuthError(error)
  }
}

// POST - { channel: 'ntfy' | 'email' } sends a test to the owner
export async function POST(request: NextRequest) {
  try {
    await requirePermission('settings:edit')
    const body = await request.json().catch(() => ({}))
    const channel = body?.channel === 'email' ? 'email' : 'ntfy'

    if (channel === 'ntfy') {
      if (!isNtfyConfigured()) {
        return NextResponse.json({ error: 'Falta configurar NTFY_TOPIC_URL en el servidor' }, { status: 400 })
      }
      const sent = await sendNtfy({
        title: '🔔 Prueba de MAAL LINE',
        message: 'Las notificaciones push están funcionando.',
        tags: ['white_check_mark'],
      })
      if (!sent) return NextResponse.json({ error: 'ntfy no respondió, revisa la URL del tema' }, { status: 502 })
      return NextResponse.json({ sent: true })
    }

    if (!isEmailConfigured()) {
      return NextResponse.json({ error: 'Falta configurar RESEND_API_KEY en el servidor' }, { status: 400 })
    }
    const to = await ownerEmail()
    // The welcome email doubles as a preview of what customers receive
    const preview = customerWelcomeEmail('MAAL')
    const sent = await sendEmail({ to, ...preview, subject: `[Prueba] ${preview.subject}`, type: 'test' })
    if (!sent) {
      return NextResponse.json({ error: 'Resend rechazó el correo; revisa que el dominio esté verificado' }, { status: 502 })
    }
    return NextResponse.json({ sent: true, to })
  } catch (error) {
    return handleAuthError(error)
  }
}
