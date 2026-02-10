import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    // Fetch all data in parallel
    const [
      recentOrders,
      ordersCount,
      addressesCount,
      wishlistCount,
      defaultAddress,
    ] = await Promise.all([
      // Recent orders (last 3)
      prisma.order.findMany({
        where: { userId },
        select: {
          orderNumber: true,
          createdAt: true,
          status: true,
          total: true,
          items: {
            select: {
              id: true,
              product: {
                select: {
                  images: {
                    take: 1,
                    orderBy: { sortOrder: 'asc' },
                    select: { url: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),

      // Total orders count
      prisma.order.count({
        where: { userId },
      }),

      // Addresses count
      prisma.address.count({
        where: { userId },
      }),

      // Wishlist count
      prisma.wishlist.count({
        where: { userId },
      }),

      // Default address
      prisma.address.findFirst({
        where: { userId, isDefault: true },
        select: {
          id: true,
          label: true,
          street: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
        },
      }),
    ])

    // Format recent orders
    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.orderNumber,
      date: order.createdAt.toISOString().split('T')[0],
      status: mapOrderStatus(order.status),
      total: parseFloat(order.total.toString()),
      items: order.items.length,
      image: order.items[0]?.product?.images[0]?.url || null,
    }))

    // Format quick actions with real counts
    const quickActions = [
      { type: 'orders', count: ordersCount },
      { type: 'addresses', count: addressesCount },
      { type: 'wishlist', count: wishlistCount },
    ]

    // Format default address
    const formattedDefaultAddress = defaultAddress
      ? {
          id: defaultAddress.id,
          label: defaultAddress.label || 'Principal',
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          postalCode: defaultAddress.postalCode,
          country: defaultAddress.country === 'MX' ? 'México' : defaultAddress.country,
        }
      : null

    return NextResponse.json({
      recentOrders: formattedRecentOrders,
      quickActions,
      defaultAddress: formattedDefaultAddress,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

function mapOrderStatus(status: OrderStatus): string {
  const mapping: Record<OrderStatus, string> = {
    pending: 'processing',
    confirmed: 'processing',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
    refunded: 'cancelled',
  }
  return mapping[status] || status
}
