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
        street: addr.streetLine1,
        number: '',
        interior: addr.streetLine2,
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        zipCode: addr.postalCode,
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
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    // Check if this is the first address
    const addressCount = await prisma.address.count({ where: { userId } })
    const shouldBeDefault = isDefault || addressCount === 0

    const streetLine1 = number ? `${street} ${number}` : street

    const newAddress = await prisma.address.create({
      data: {
        userId,
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
        isDefault: shouldBeDefault,
      },
    })

    return NextResponse.json({
      success: true,
      address: {
        id: newAddress.id,
        type: type,
        label: type === 'work' ? 'Oficina' : 'Casa',
        fullName: newAddress.fullName,
        phone: newAddress.phone,
        street: streetLine1,
        number: '',
        interior: newAddress.streetLine2,
        neighborhood: newAddress.neighborhood,
        city: newAddress.city,
        state: newAddress.state,
        zipCode: newAddress.postalCode,
        country: newAddress.country,
        isDefault: newAddress.isDefault,
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
