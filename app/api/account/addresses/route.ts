import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { AddressType } from '@prisma/client'

// GET - Fetch user addresses
export async function GET() {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({
      addresses: addresses.map((addr) => ({
        id: addr.id,
        type: addr.type === AddressType.shipping ? 'home' : 'work',
        label: addr.type === AddressType.shipping ? 'Casa' : 'Oficina',
        fullName: addr.fullName,
        phone: addr.phone,
        // New format for checkout
        streetLine1: addr.streetLine1,
        streetLine2: addr.streetLine2,
        postalCode: addr.postalCode,
        // Old format for direcciones page (backward compat)
        street: addr.streetLine1,
        number: '',
        interior: addr.streetLine2,
        zipCode: addr.postalCode,
        // Common fields
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        isDefault: addr.isDefault,
      })),
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// POST - Create new address
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

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
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    // Check if this is the first address
    const addressCount = await prisma.address.count({ where: { userId } })
    const shouldBeDefault = isDefault || addressCount === 0

    // Handle both field naming conventions
    const streetLine1 = streetLine1Input || (number ? `${street} ${number}` : street)
    const streetLine2 = streetLine2Input || interior || null
    const postalCode = postalCodeInput || zipCode

    const newAddress = await prisma.address.create({
      data: {
        userId,
        type: type === 'work' ? AddressType.billing : AddressType.shipping,
        fullName,
        phone,
        streetLine1,
        streetLine2,
        neighborhood,
        city,
        state,
        postalCode,
        country: 'MX',
        isDefault: shouldBeDefault,
      },
    })

    return NextResponse.json({
      success: true,
      address: {
        id: newAddress.id,
        type: type || 'home',
        label: type === 'work' ? 'Oficina' : 'Casa',
        fullName: newAddress.fullName,
        phone: newAddress.phone,
        // New format for checkout
        streetLine1: newAddress.streetLine1,
        streetLine2: newAddress.streetLine2,
        postalCode: newAddress.postalCode,
        // Old format for direcciones page (backward compat)
        street: newAddress.streetLine1,
        number: '',
        interior: newAddress.streetLine2,
        zipCode: newAddress.postalCode,
        // Common fields
        neighborhood: newAddress.neighborhood,
        city: newAddress.city,
        state: newAddress.state,
        country: newAddress.country,
        isDefault: newAddress.isDefault,
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
