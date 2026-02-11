import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    await requirePermission('orders:view')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as OrderStatus | null
    const paymentStatus = searchParams.get('paymentStatus') as PaymentStatus | null
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    // Build orderBy
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Fetch orders with items
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            select: {
              id: true,
              productName: true,
              variantName: true,
              quantity: true,
              unitPrice: true,
              total: true,
              imageUrl: true,
            },
          },
          shipments: {
            select: {
              id: true,
              status: true,
              carrier: true,
              trackingNumber: true,
              trackingUrl: true,
              shippedAt: true,
              deliveredAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    // Get stats
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'processing' } }),
      prisma.order.count({ where: { status: 'shipped' } }),
      prisma.order.count({ where: { status: 'delivered' } }),
      prisma.order.count({ where: { status: 'cancelled' } }),
    ])

    // Format orders
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user
        ? {
            id: order.user.id,
            name: [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') || order.email,
            email: order.user.email,
          }
        : {
            id: null,
            name: (order.shippingAddress as any)?.fullName || 'Invitado',
            email: order.email,
          },
      email: order.email,
      phone: order.phone,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      subtotal: parseFloat(order.subtotal.toString()),
      shippingTotal: parseFloat(order.shippingTotal.toString()),
      discountTotal: parseFloat(order.discountTotal.toString()),
      total: parseFloat(order.total.toString()),
      itemsCount: order.items.reduce((acc, item) => acc + item.quantity, 0),
      items: order.items.map((item) => ({
        id: item.id,
        name: item.productName,
        variant: item.variantName,
        quantity: item.quantity,
        price: parseFloat(item.unitPrice.toString()),
        total: parseFloat(item.total.toString()),
        image: item.imageUrl,
      })),
      shippingAddress: order.shippingAddress,
      shippingMethod: order.shippingMethod,
      discountCode: order.discountCode,
      shipment: order.shipments[0] || null,
      customerNotes: order.customerNotes,
      internalNotes: order.internalNotes,
      createdAt: order.createdAt.toISOString(),
      confirmedAt: order.confirmedAt?.toISOString() || null,
      shippedAt: order.shippedAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,
      cancelledAt: order.cancelledAt?.toISOString() || null,
    }))

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
