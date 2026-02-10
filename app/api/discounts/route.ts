import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError, requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { DiscountType, AppliesTo, CustomerEligibility } from '@prisma/client'

// GET - List all discounts
export async function GET(request: NextRequest) {
  try {
    await requirePermission('discounts:view')

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status === 'active') {
      where.isActive = true
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ]
    } else if (status === 'expired') {
      where.OR = [
        { isActive: false },
        { expiresAt: { lt: new Date() } },
      ]
    }

    const discounts = await prisma.discount.findMany({
      where,
      include: {
        usages: {
          select: {
            amountSaved: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate stats
    const now = new Date()
    const activeDiscounts = discounts.filter(
      (d) => d.isActive && (!d.expiresAt || d.expiresAt >= now)
    )
    const totalUsage = discounts.reduce((sum, d) => sum + d.usageCount, 0)
    const totalSavings = discounts.reduce((sum, d) => {
      const discountSavings = d.usages.reduce(
        (uSum, u) => uSum + parseFloat(u.amountSaved?.toString() || '0'),
        0
      )
      return sum + discountSavings
    }, 0)

    const formattedDiscounts = discounts.map((discount) => {
      const isExpired = discount.expiresAt && discount.expiresAt < now
      return {
        id: discount.id,
        code: discount.code,
        description: discount.description,
        type: discount.type,
        value: parseFloat(discount.value.toString()),
        minimumPurchase: discount.minimumPurchase
          ? parseFloat(discount.minimumPurchase.toString())
          : null,
        maximumDiscount: discount.maximumDiscount
          ? parseFloat(discount.maximumDiscount.toString())
          : null,
        usageCount: discount.usageCount,
        usageLimit: discount.usageLimit,
        usageLimitPerUser: discount.usageLimitPerUser,
        startsAt: discount.startsAt.toISOString(),
        expiresAt: discount.expiresAt?.toISOString() || null,
        appliesTo: discount.appliesTo,
        customerEligibility: discount.customerEligibility,
        customerGroups: discount.customerGroups,
        isCombinable: discount.isCombinable,
        isActive: discount.isActive,
        status: !discount.isActive ? 'inactive' : isExpired ? 'expired' : 'active',
        createdAt: discount.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      discounts: formattedDiscounts,
      stats: {
        total: discounts.length,
        active: activeDiscounts.length,
        totalUsage,
        totalSavings,
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// POST - Create new discount
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    await requirePermission('discounts:create')

    const body = await request.json()
    const {
      code,
      description,
      type,
      value,
      minimumPurchase,
      maximumDiscount,
      usageLimit,
      usageLimitPerUser,
      startsAt,
      expiresAt,
      appliesTo,
      customerEligibility,
      customerGroups,
      isCombinable,
      isActive,
    } = body

    // Validate required fields
    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Código, tipo y valor son requeridos' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingDiscount = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (existingDiscount) {
      return NextResponse.json(
        { error: 'Ya existe un descuento con este código' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de descuento inválido' },
        { status: 400 }
      )
    }

    // Validate percentage value
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'El porcentaje debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    const newDiscount = await prisma.discount.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        type: type as DiscountType,
        value: value,
        minimumPurchase: minimumPurchase || null,
        maximumDiscount: maximumDiscount || null,
        usageLimit: usageLimit || null,
        usageLimitPerUser: usageLimitPerUser || 1,
        startsAt: startsAt ? new Date(startsAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        appliesTo: (appliesTo as AppliesTo) || AppliesTo.all,
        customerEligibility:
          (customerEligibility as CustomerEligibility) || CustomerEligibility.all,
        customerGroups: customerGroups || [],
        isCombinable: isCombinable || false,
        isActive: isActive !== false,
        createdById: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Descuento creado correctamente',
      discount: {
        id: newDiscount.id,
        code: newDiscount.code,
        description: newDiscount.description,
        type: newDiscount.type,
        value: parseFloat(newDiscount.value.toString()),
        usageCount: 0,
        usageLimit: newDiscount.usageLimit,
        expiresAt: newDiscount.expiresAt?.toISOString() || null,
        status: 'active',
        isActive: newDiscount.isActive,
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
