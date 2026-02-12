import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

// DELETE - Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    // Get confirmation from request body
    const body = await request.json()
    const { confirmation } = body

    if (confirmation !== 'ELIMINAR') {
      return NextResponse.json(
        { error: 'Confirmación incorrecta' },
        { status: 400 }
      )
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Don't allow admin/owner accounts to be deleted this way
    if (user.role === 'admin' || user.role === 'owner') {
      return NextResponse.json(
        { error: 'Las cuentas de administrador no pueden eliminarse de esta forma' },
        { status: 403 }
      )
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({
      success: true,
      message: 'Cuenta eliminada correctamente',
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
