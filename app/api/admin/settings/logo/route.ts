import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { LOGO_SETTINGS_KEY, parseLogoDataUrl } from '@/lib/store-settings'

function readLogo(value: unknown): string | null {
  const url = (value as { url?: unknown } | null)?.url
  return typeof url === 'string' ? url : null
}

// GET - Store logo (null until one is uploaded)
export async function GET() {
  try {
    await requirePermission('settings:view')
    const row = await prisma.storeSetting.findUnique({ where: { key: LOGO_SETTINGS_KEY } })
    return NextResponse.json({ logoUrl: readLogo(row?.value) })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PUT - Replace the logo with a resized image data URI { dataUrl }
export async function PUT(request: NextRequest) {
  try {
    const session = await requirePermission('settings:edit')
    const body = await request.json().catch(() => null)
    const parsed = parseLogoDataUrl(body?.dataUrl)
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    await prisma.storeSetting.upsert({
      where: { key: LOGO_SETTINGS_KEY },
      create: {
        key: LOGO_SETTINGS_KEY,
        value: { url: parsed.data },
        category: 'general',
        description: 'Logo de la tienda',
        updatedById: session.user.id,
      },
      update: { value: { url: parsed.data }, updatedById: session.user.id },
    })

    return NextResponse.json({ logoUrl: parsed.data })
  } catch (error) {
    return handleAuthError(error)
  }
}

// DELETE - Remove the logo
export async function DELETE() {
  try {
    await requirePermission('settings:edit')
    await prisma.storeSetting.deleteMany({ where: { key: LOGO_SETTINGS_KEY } })
    return NextResponse.json({ logoUrl: null })
  } catch (error) {
    return handleAuthError(error)
  }
}
