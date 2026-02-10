import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { CustomerGroup } from '@prisma/client'

// PATCH - Update customer group
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('customers:edit')
    const { id } = params

    const body = await request.json()
    const { group } = body

    // Validate group
    const validGroups = ['standard', 'vip', 'wholesale', 'influencer']
    if (!validGroups.includes(group)) {
      return NextResponse.json(
        { error: 'Grupo inválido' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: { customerProfile: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Update or create customer profile with new group
    await prisma.customerProfile.upsert({
      where: { userId: id },
      update: {
        customerGroup: group as CustomerGroup,
      },
      create: {
        userId: id,
        customerGroup: group as CustomerGroup,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Grupo actualizado correctamente',
      group,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
