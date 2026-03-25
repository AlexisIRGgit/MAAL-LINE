import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

const MAX_SIZE_BYTES = 500_000 // ~500KB base64 string limit

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const { avatarUrl } = await request.json()

    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return NextResponse.json({ error: 'avatarUrl es requerido' }, { status: 400 })
    }

    // Validate it's a data URI with image type
    if (!avatarUrl.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Formato de imagen inválido' }, { status: 400 })
    }

    // Check size
    if (avatarUrl.length > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'La imagen es demasiado grande (máximo ~375KB)' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    })

    return NextResponse.json({ success: true, avatarUrl })
  } catch (error) {
    return handleAuthError(error)
  }
}

export async function DELETE() {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
