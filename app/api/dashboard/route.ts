import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    await requirePermission('dashboard:view')

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7days'

    // Calculate date ranges
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date
    let previousEndDate: Date

    switch (period) {
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        previousEndDate = startDate
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEndDate = startDate
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
        previousEndDate = startDate
        break
      default: // 7days
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        previousEndDate = startDate
    }

    // Fetch all data in parallel
    const [
      currentPeriodOrders,
      previousPeriodOrders,
      recentOrders,
      totalCustomers,
      newCustomersCount,
      refundedOrders,
      previousRefundedOrders,
      orderItems,
    ] = await Promise.all([
      // Current period orders
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { not: OrderStatus.cancelled },
        },
        select: {
          total: true,
          createdAt: true,
        },
      }),

      // Previous period orders (for comparison)
      prisma.order.findMany({
        where: {
          createdAt: { gte: previousStartDate, lt: previousEndDate },
          status: { not: OrderStatus.cancelled },
        },
        select: {
          total: true,
        },
      }),

      // Recent orders with user and items
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            take: 1,
            select: {
              productName: true,
            },
          },
        },
      }),

      // Total customers
      prisma.user.count({
        where: { role: 'customer' },
      }),

      // New customers this period
      prisma.user.count({
        where: {
          role: 'customer',
          createdAt: { gte: startDate },
        },
      }),

      // Refunded orders (current period)
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: PaymentStatus.refunded,
        },
      }),

      // Refunded orders (previous period)
      prisma.order.count({
        where: {
          createdAt: { gte: previousStartDate, lt: previousEndDate },
          paymentStatus: PaymentStatus.refunded,
        },
      }),

      // Order items for category stats
      prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { not: OrderStatus.cancelled },
          },
        },
        select: {
          productId: true,
          total: true,
        },
      }),
    ])

    // Calculate totals
    const currentTotal = currentPeriodOrders.reduce(
      (sum, order) => sum + parseFloat(order.total.toString()),
      0
    )
    const previousTotal = previousPeriodOrders.reduce(
      (sum, order) => sum + parseFloat(order.total.toString()),
      0
    )

    const salesChange = previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal) * 100
      : currentTotal > 0 ? 100 : 0

    const refundsChange = previousRefundedOrders > 0
      ? ((refundedOrders - previousRefundedOrders) / previousRefundedOrders) * 100
      : refundedOrders > 0 ? 100 : 0

    // Format sales data for chart
    const salesChartData = formatSalesForChart(currentPeriodOrders, startDate, now, period)

    // Get category data
    const categoryData = await getCategoryData(orderItems)

    // Format recent orders
    const formattedRecentOrders = recentOrders.map((order) => {
      const customerName = order.user
        ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email.split('@')[0]
        : 'Cliente Anónimo'

      const initials = customerName
        .split(' ')
        .map((n: string) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'CA'

      const productName = order.items[0]?.productName || 'Producto'
      const itemCount = order.items.length

      return {
        id: order.orderNumber,
        customer: customerName,
        product: itemCount > 1 ? `${productName} +${itemCount - 1}` : productName,
        total: `$${parseFloat(order.total.toString()).toLocaleString()}`,
        status: getStatusLabel(order.status),
        avatar: initials,
      }
    })

    return NextResponse.json({
      stats: {
        totalSales: {
          value: currentTotal,
          change: salesChange,
          ordersCount: currentPeriodOrders.length,
        },
        customers: {
          value: totalCustomers,
          newThisPeriod: newCustomersCount,
        },
        refunds: {
          value: refundedOrders,
          change: refundsChange,
        },
        averageOrderValue: currentPeriodOrders.length > 0
          ? currentTotal / currentPeriodOrders.length
          : 0,
      },
      salesChart: salesChartData,
      categoryData,
      recentOrders: formattedRecentOrders,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

function formatSalesForChart(
  orders: { total: unknown; createdAt: Date }[],
  startDate: Date,
  endDate: Date,
  period: string
) {
  const salesByDate: Record<string, number> = {}

  // Initialize all dates with 0
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const key = getDateKey(currentDate, period)
    salesByDate[key] = 0

    if (period === 'year') {
      currentDate.setMonth(currentDate.getMonth() + 1)
    } else {
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  // Add order totals
  orders.forEach((order) => {
    const key = getDateKey(order.createdAt, period)
    salesByDate[key] = (salesByDate[key] || 0) + parseFloat(order.total as string)
  })

  // Format for chart
  return Object.entries(salesByDate).map(([name, ventas]) => ({
    name,
    ventas: Math.round(ventas),
  }))
}

function getDateKey(date: Date, period: string): string {
  if (period === 'year') {
    return date.toLocaleDateString('es-MX', { month: 'short' })
  }
  if (period === '30days' || period === 'month') {
    return `${date.getDate()}/${date.getMonth() + 1}`
  }
  return date.toLocaleDateString('es-MX', { weekday: 'short' })
}

async function getCategoryData(
  orderItems: { productId: string | null; total: unknown }[]
) {
  if (orderItems.length === 0) {
    return [
      { name: 'Sin datos', value: 100, revenue: 0, color: '#E5E7EB' },
    ]
  }

  // Get unique product IDs
  const productIds = Array.from(new Set(orderItems.filter(i => i.productId).map(i => i.productId as string)))

  if (productIds.length === 0) {
    return [
      { name: 'Sin datos', value: 100, revenue: 0, color: '#E5E7EB' },
    ]
  }

  // Get products with their categories
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      category: true,
    },
  })

  // Group by category
  const categoryTotals: Record<string, number> = {}
  let totalRevenue = 0

  orderItems.forEach((item) => {
    const product = products.find((p) => p.id === item.productId)
    const categoryName = product?.category?.name || 'Sin categoría'
    const itemTotal = parseFloat(item.total?.toString() || '0')

    categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + itemTotal
    totalRevenue += itemTotal
  })

  // Convert to array and calculate percentages
  const colors = ['#111827', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB']
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return sortedCategories.map(([name, value], index) => ({
    name,
    value: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0,
    revenue: value,
    color: colors[index] || '#E5E7EB',
  }))
}

function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'En proceso',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  }
  return labels[status] || status
}
