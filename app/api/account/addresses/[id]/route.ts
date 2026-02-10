import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { AddressType } from '@prisma/client'

// PUT - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const userId = session.user.id
    const { id } = params

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Dirección no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const {
      type,
      fullName,
      phone,
      street,
      number,
      interior,
      neighborhood,
      city,
      state,
      zipCode,
      country,
      isDefault,
    } = body

    // If setting as default, unset other defaults
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const streetLine1 = number ? `${street} ${number}` : street

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        type: type === 'work' ? AddressType.billing : AddressType.shipping,
        fullName,
        phone,
        streetLine1,
        streetLine2: interior || null,
        neighborhood,
        city,
        state,
        postalCode: zipCode,
        country: country || 'México',
        isDefault,
      },
    })

    return NextResponse.json({
      success: true,
      address: {
        id: updatedAddress.id,
        type: type,
        label: type === 'work' ? 'Oficina' : 'Casa',
        fullName: updatedAddress.fullName,
        phone: updatedAddress.phone,
        street: streetLine1,
        number: '',
        interior: updatedAddress.streetLine2,
        neighborhood: updatedAddress.neighborhood,
        city: updatedAddress.city,
        state: updatedAddress.state,
        zipCode: updatedAddress.postalCode,
        country: updatedAddress.country,
        isDefault: updatedAddress.isDefault,
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// DELETE - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const userId = session.user.id
    const { id } = params

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Dirección no encontrada' }, { status: 404 })
    }

    await prisma.address.delete({
      where: { id },
    })

    // If deleted address was default, set another as default
    if (existingAddress.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      })

      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PATCH - Set as default
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const userId = session.user.id
    const { id } = params

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Dirección no encontrada' }, { status: 404 })
    }

    // Unset all defaults
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    })

    // Set this one as default
    await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
