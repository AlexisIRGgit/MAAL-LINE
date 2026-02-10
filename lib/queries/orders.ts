import { prisma } from '@/lib/db'
import { OrderStatus, PaymentStatus } from '@prisma/client'

/**
 * Get orders for admin panel with filtering and pagination
 */
export async function getAdminOrders(
  page = 1,
  limit = 20,
  status?: OrderStatus,
  paymentStatus?: PaymentStatus,
  search?: string
) {
  const where = {
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { user: { firstName: { contains: search, mode: 'insensitive' as const } } },
        { user: { lastName: { contains: search, mode: 'insensitive' as const } } },
      ],
    }),
  }

  const [orders, total, stats] = await Promise.all([
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
            quantity: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
    // Get order stats
    getOrderStats(),
  ])

  return {
    orders: orders.map((order) => ({
      id: order.orderNumber,
      orderId: order.id,
      customer: {
        name: order.user
          ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Cliente'
          : order.email.split('@')[0],
        email: order.email,
      },
      date: order.createdAt.toISOString().split('T')[0],
      items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: parseFloat(order.total.toString()),
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingAddress: formatShippingAddress(order.shippingAddress),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats,
  }
}

/**
 * Get order statistics for dashboard
 */
export async function getOrderStats() {
  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.pending } }),
    prisma.order.count({ where: { status: OrderStatus.processing } }),
    prisma.order.count({ where: { status: OrderStatus.shipped } }),
    prisma.order.count({ where: { status: OrderStatus.delivered } }),
    prisma.order.count({ where: { status: OrderStatus.cancelled } }),
  ])

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
  }
}

/**
 * Get single order by ID with full details
 */
export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variant: {
            select: {
              id: true,
              size: true,
              color: true,
              sku: true,
            },
          },
        },
      },
      payments: true,
      shipments: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  })
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variant: {
            select: {
              id: true,
              size: true,
              color: true,
              sku: true,
            },
          },
        },
      },
      payments: true,
      shipments: true,
    },
  })
}

/**
 * Format shipping address from JSON to string
 */
function formatShippingAddress(address: unknown): string {
  if (!address || typeof address !== 'object') return ''

  const addr = address as Record<string, string>
  const parts = [
    addr.neighborhood || addr.streetLine1,
    addr.city,
    addr.state,
  ].filter(Boolean)

  return parts.join(', ')
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  userId?: string,
  notes?: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  })

  if (!order) throw new Error('Order not found')

  const previousStatus = order.status

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === OrderStatus.shipped && { shippedAt: new Date() }),
        ...(status === OrderStatus.delivered && { deliveredAt: new Date() }),
        ...(status === OrderStatus.cancelled && {
          cancelledAt: new Date(),
          cancelledById: userId,
        }),
        ...(status === OrderStatus.confirmed && { confirmedAt: new Date() }),
      },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        previousStatus,
        notes,
        createdById: userId,
      },
    }),
  ])

  return updatedOrder
}

/**
 * Get customer orders (for customer panel)
 */
export async function getCustomerOrders(userId: string, page = 1, limit = 10) {
  const where = { userId }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
              },
            },
            variant: {
              select: {
                size: true,
                color: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ])

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}
