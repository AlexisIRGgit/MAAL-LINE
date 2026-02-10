import { NextRequest, NextResponse } from 'next/server'
import { getAdminCustomers } from '@/lib/queries/customers'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { CustomerGroup, UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    // Check permission
    await requirePermission('customers:view')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const group = searchParams.get('group') as CustomerGroup | undefined
    const search = searchParams.get('search') || undefined

    const data = await getAdminCustomers(
      page,
      limit,
      group || undefined,
      search
    )

    return NextResponse.json(data)
  } catch (error) {
    return handleAuthError(error)
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    await requirePermission('customers:edit')

    const body = await request.json()
    const { firstName, lastName, email, phone, group } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }

    // Generate a temporary password
    const tempPassword = randomBytes(4).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        passwordHash: hashedPassword,
        role: UserRole.customer,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    })

    // Create customer profile with group
    await prisma.customerProfile.create({
      data: {
        userId: newUser.id,
        customerGroup: (group as CustomerGroup) || CustomerGroup.standard,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Cliente creado correctamente',
      customer: {
        id: newUser.id,
        name: `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0],
        email: newUser.email,
        phone: newUser.phone,
        group: group || 'standard',
        orders: 0,
        spent: 0,
        createdAt: new Date().toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        addresses: [],
      },
      tempPassword,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
