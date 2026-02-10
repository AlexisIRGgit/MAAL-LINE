import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (status && status !== 'all') {
      where.status = status as OrderStatus
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        {
          items: {
            some: {
              productName: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            variantName: true,
            quantity: true,
            unitPrice: true,
            total: true,
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
        shipments: {
          select: {
            trackingNumber: true,
            carrier: true,
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // Calculate stats
    const allOrders = await prisma.order.findMany({
      where: { userId: session.user.id },
      select: { status: true },
    })

    const stats = {
      total: allOrders.length,
      processing: allOrders.filter((o) => o.status === 'processing' || o.status === 'confirmed').length,
      shipped: allOrders.filter((o) => o.status === 'shipped').length,
      delivered: allOrders.filter((o) => o.status === 'delivered').length,
    }

    const formattedOrders = orders.map((order) => {
      const shippingAddress = order.shippingAddress as {
        street?: string
        streetLine1?: string
        city?: string
        state?: string
        postalCode?: string
        country?: string
      } | null

      const addressParts = [
        shippingAddress?.street || shippingAddress?.streetLine1,
        shippingAddress?.city,
        shippingAddress?.state,
        shippingAddress?.postalCode,
      ].filter(Boolean)

      const latestShipment = order.shipments[0]

      return {
        id: order.orderNumber,
        date: order.createdAt.toISOString().split('T')[0],
        status: mapOrderStatus(order.status),
        total: parseFloat(order.total.toString()),
        items: order.items.map((item) => ({
          name: item.productName,
          size: item.variantName || 'Única',
          quantity: item.quantity,
          price: parseFloat(item.unitPrice.toString()),
          image: item.product?.images[0]?.url || null,
        })),
        shippingAddress: addressParts.join(', ') || 'Sin dirección',
        trackingNumber: latestShipment?.trackingNumber || null,
      }
    })

    return NextResponse.json({
      orders: formattedOrders,
      stats,
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
