import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

// GET - Fetch current user profile
export async function GET() {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        customerProfile: {
          select: {
            birthday: true,
            acceptsMarketing: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      birthDate: user.customerProfile?.birthday?.toISOString().split('T')[0] || null,
      acceptsMarketing: user.customerProfile?.acceptsMarketing || false,
      createdAt: user.createdAt,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const body = await request.json()
    const { firstName, lastName, phone, birthDate, acceptsMarketing } = body

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
      },
    })

    // Update or create customer profile
    if (birthDate !== undefined || acceptsMarketing !== undefined) {
      await prisma.customerProfile.upsert({
        where: { userId },
        update: {
          ...(birthDate && { birthday: new Date(birthDate) }),
          ...(acceptsMarketing !== undefined && { acceptsMarketing }),
        },
        create: {
          userId,
          ...(birthDate && { birthday: new Date(birthDate) }),
          acceptsMarketing: acceptsMarketing || false,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
