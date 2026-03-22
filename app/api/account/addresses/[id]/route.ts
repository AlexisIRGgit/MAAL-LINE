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
      // Support both old format (street, zipCode) and new format (streetLine1, postalCode)
      street,
      streetLine1: streetLine1Input,
      number,
      interior,
      streetLine2: streetLine2Input,
      neighborhood,
      city,
      state,
      zipCode,
      postalCode: postalCodeInput,
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

    // Handle both field naming conventions
    const streetLine1 = streetLine1Input || (number ? `${street} ${number}` : street)
    const streetLine2 = streetLine2Input !== undefined ? (streetLine2Input || null) : (interior || null)
    const postalCode = postalCodeInput || zipCode

    const addressType = type
      ? (type === 'work' ? AddressType.billing : AddressType.shipping)
      : existingAddress.type

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        type: addressType,
        fullName,
        phone: phone || null,
        streetLine1,
        streetLine2,
        neighborhood: neighborhood || null,
        city,
        state,
        postalCode,
        country: 'MX',
        isDefault: isDefault ?? existingAddress.isDefault,
      },
    })

    return NextResponse.json({
      success: true,
      address: {
        id: updatedAddress.id,
        type: type || 'home',
        label: type === 'work' ? 'Oficina' : 'Casa',
        fullName: updatedAddress.fullName,
        phone: updatedAddress.phone,
        // New format
        streetLine1: updatedAddress.streetLine1,
        streetLine2: updatedAddress.streetLine2,
        postalCode: updatedAddress.postalCode,
        // Old format (backward compat)
        street: updatedAddress.streetLine1,
        number: '',
        interior: updatedAddress.streetLine2,
        zipCode: updatedAddress.postalCode,
        // Common fields
        neighborhood: updatedAddress.neighborhood,
        city: updatedAddress.city,
        state: updatedAddress.state,
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
