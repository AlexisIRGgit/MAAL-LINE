import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { DiscountType, AppliesTo, CustomerEligibility } from '@prisma/client'

// GET - Get single discount
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('discounts:view')
    const { id } = params

    const discount = await prisma.discount.findUnique({
      where: { id, deletedAt: null },
      include: {
        usages: {
          select: {
            id: true,
            amountSaved: true,
            createdAt: true,
            order: {
              select: {
                orderNumber: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!discount) {
      return NextResponse.json(
        { error: 'Descuento no encontrado' },
        { status: 404 }
      )
    }

    const now = new Date()
    const isExpired = discount.expiresAt && discount.expiresAt < now

    return NextResponse.json({
      discount: {
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
        productIds: discount.productIds,
        categoryIds: discount.categoryIds,
        collectionIds: discount.collectionIds,
        customerEligibility: discount.customerEligibility,
        customerIds: discount.customerIds,
        customerGroups: discount.customerGroups,
        isCombinable: discount.isCombinable,
        isActive: discount.isActive,
        status: !discount.isActive ? 'inactive' : isExpired ? 'expired' : 'active',
        createdAt: discount.createdAt.toISOString(),
        recentUsages: discount.usages.map((u) => ({
          id: u.id,
          amountSaved: u.amountSaved ? parseFloat(u.amountSaved.toString()) : 0,
          orderNumber: u.order?.orderNumber,
          createdAt: u.createdAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PUT - Update discount
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('discounts:edit')
    const { id } = params

    const existingDiscount = await prisma.discount.findUnique({
      where: { id, deletedAt: null },
    })

    if (!existingDiscount) {
      return NextResponse.json(
        { error: 'Descuento no encontrado' },
        { status: 404 }
      )
    }

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

    // If code is changing, check it doesn't already exist
    if (code && code.toUpperCase() !== existingDiscount.code) {
      const codeExists = await prisma.discount.findUnique({
        where: { code: code.toUpperCase() },
      })
      if (codeExists) {
        return NextResponse.json(
          { error: 'Ya existe un descuento con este código' },
          { status: 400 }
        )
      }
    }

    // Validate percentage value
    if (type === 'percentage' && value !== undefined && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'El porcentaje debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(type && { type: type as DiscountType }),
        ...(value !== undefined && { value }),
        ...(minimumPurchase !== undefined && { minimumPurchase }),
        ...(maximumDiscount !== undefined && { maximumDiscount }),
        ...(usageLimit !== undefined && { usageLimit }),
        ...(usageLimitPerUser !== undefined && { usageLimitPerUser }),
        ...(startsAt && { startsAt: new Date(startsAt) }),
        ...(expiresAt !== undefined && {
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }),
        ...(appliesTo && { appliesTo: appliesTo as AppliesTo }),
        ...(customerEligibility && {
          customerEligibility: customerEligibility as CustomerEligibility,
        }),
        ...(customerGroups !== undefined && { customerGroups }),
        ...(isCombinable !== undefined && { isCombinable }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    const now = new Date()
    const isExpired = updatedDiscount.expiresAt && updatedDiscount.expiresAt < now

    return NextResponse.json({
      success: true,
      message: 'Descuento actualizado correctamente',
      discount: {
        id: updatedDiscount.id,
        code: updatedDiscount.code,
        description: updatedDiscount.description,
        type: updatedDiscount.type,
        value: parseFloat(updatedDiscount.value.toString()),
        usageCount: updatedDiscount.usageCount,
        usageLimit: updatedDiscount.usageLimit,
        expiresAt: updatedDiscount.expiresAt?.toISOString() || null,
        status: !updatedDiscount.isActive ? 'inactive' : isExpired ? 'expired' : 'active',
        isActive: updatedDiscount.isActive,
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// DELETE - Soft delete discount
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('discounts:delete')
    const { id } = params

    const existingDiscount = await prisma.discount.findUnique({
      where: { id, deletedAt: null },
    })

    if (!existingDiscount) {
      return NextResponse.json(
        { error: 'Descuento no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete
    await prisma.discount.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Descuento eliminado correctamente',
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PATCH - Toggle discount status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('discounts:edit')
    const { id } = params

    const existingDiscount = await prisma.discount.findUnique({
      where: { id, deletedAt: null },
    })

    if (!existingDiscount) {
      return NextResponse.json(
        { error: 'Descuento no encontrado' },
        { status: 404 }
      )
    }

    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: {
        isActive: !existingDiscount.isActive,
      },
    })

    return NextResponse.json({
      success: true,
      message: updatedDiscount.isActive ? 'Descuento activado' : 'Descuento desactivado',
      isActive: updatedDiscount.isActive,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
