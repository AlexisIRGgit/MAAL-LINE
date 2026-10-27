import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

async function findCustomer(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, status: true, deletedAt: true },
  })
  // Only shoppers are managed here; staff accounts live in Usuarios
  return user && user.role === UserRole.customer && !user.deletedAt ? user : null
}

// PATCH - { status: 'active' | 'inactive' } turns a customer's access on or off
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission('customers:edit')
    const { id } = await params
    const body = await request.json().catch(() => null)
    const status = body?.status
    if (status !== 'active' && status !== 'inactive') {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 })
    }

    const customer = await findCustomer(id)
    if (!customer) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    await prisma.user.update({ where: { id }, data: { status } })
    // Inactive customers can't sign in again; drop their stored sessions
    if (status === 'inactive') await prisma.userSession.deleteMany({ where: { userId: id } })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: status === 'inactive' ? 'customer.deactivated' : 'customer.activated',
        entityType: 'user',
        entityId: id,
        oldValues: { status: customer.status },
        newValues: { status },
        description: `${status === 'inactive' ? 'Cliente desactivado' : 'Cliente activado'}: ${customer.email}`,
      },
    })

    return NextResponse.json({ id, status })
  } catch (error) {
    return handleAuthError(error)
  }
}

/**
 * DELETE - Removes a customer. Orders keep their own snapshot of name and address,
 * so the account is anonymized (soft delete) instead of hard-deleted: sales history
 * and reports stay intact, and the email is freed to sign up again.
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission('customers:delete')
    const { id } = await params

    const customer = await findCustomer(id)
    if (!customer) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    await prisma.$transaction([
      prisma.address.deleteMany({ where: { userId: id } }),
      prisma.userSession.deleteMany({ where: { userId: id } }),
      prisma.user.update({
        where: { id },
        data: {
          email: `eliminado-${id}@deleted.maalline.invalid`,
          passwordHash: null,
          firstName: null,
          lastName: null,
          phone: null,
          avatarUrl: null,
          authProviderId: null,
          status: 'inactive',
          deletedAt: new Date(),
        },
      }),
      prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'customer.deleted',
          entityType: 'user',
          entityId: id,
          description: `Cliente eliminado: ${customer.email}`,
        },
      }),
    ])

    return NextResponse.json({ id, deleted: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
