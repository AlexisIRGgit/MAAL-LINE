import { prisma } from '@/lib/db'
import { UserRole, CustomerGroup } from '@prisma/client'

/**
 * Get customers for admin panel with filtering and pagination
 */
export async function getAdminCustomers(
  page = 1,
  limit = 20,
  group?: CustomerGroup,
  search?: string
) {
  const where = {
    role: UserRole.customer,
    deletedAt: null,
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(group && {
      customerProfile: {
        customerGroup: group,
      },
    }),
  }

  const [customers, total, stats] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        customerProfile: true,
        _count: {
          select: { orders: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
    getCustomerStats(),
  ])

  return {
    customers: customers.map((customer) => ({
      id: customer.id,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email.split('@')[0],
      email: customer.email,
      orders: customer.customerProfile?.orderCount || customer._count.orders || 0,
      spent: parseFloat(customer.customerProfile?.totalSpent?.toString() || '0'),
      group: customer.customerProfile?.customerGroup || 'standard',
      createdAt: customer.createdAt.toISOString().split('T')[0],
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats,
  }
}

/**
 * Get customer statistics for dashboard
 */
export async function getCustomerStats() {
  const [
    totalCustomers,
    vipCustomers,
    revenueStats,
    orderStats,
  ] = await Promise.all([
    prisma.user.count({
      where: { role: UserRole.customer, deletedAt: null },
    }),
    prisma.customerProfile.count({
      where: { customerGroup: CustomerGroup.vip },
    }),
    prisma.customerProfile.aggregate({
      _sum: { totalSpent: true },
    }),
    prisma.customerProfile.aggregate({
      _sum: { orderCount: true },
    }),
  ])

  const totalRevenue = parseFloat(revenueStats._sum.totalSpent?.toString() || '0')
  const totalOrders = orderStats._sum.orderCount || 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return {
    totalCustomers,
    vipCustomers,
    totalRevenue,
    avgOrderValue,
  }
}

/**
 * Get single customer by ID with full details
 */
export async function getCustomerById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      customerProfile: true,
      addresses: true,
      orders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      },
    },
  })
}

/**
 * Update customer group
 */
export async function updateCustomerGroup(userId: string, group: CustomerGroup) {
  return prisma.customerProfile.upsert({
    where: { userId },
    update: { customerGroup: group },
    create: {
      userId,
      customerGroup: group,
    },
  })
}
