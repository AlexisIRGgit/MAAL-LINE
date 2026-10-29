// Shape of an order shown on /rastrear (guests) and in the "Rastrear pedido" modal of Mis pedidos
import type { Prisma } from '@prisma/client'
import { getPublicStoreSettings } from '@/lib/public-store-settings'

export const TRACKED_ORDER_SELECT = {
  orderNumber: true,
  userId: true,
  email: true,
  phone: true,
  status: true,
  paymentStatus: true,
  subtotal: true,
  shippingTotal: true,
  discountTotal: true,
  total: true,
  discountCode: true,
  shippingMethod: true,
  shippingAddress: true,
  createdAt: true,
  shippedAt: true,
  deliveredAt: true,
  items: {
    select: {
      productName: true,
      variantName: true,
      quantity: true,
      unitPrice: true,
      total: true,
      product: { select: { slug: true } },
    },
  },
  shipments: {
    orderBy: { createdAt: 'desc' },
    take: 1,
    select: { carrier: true, trackingNumber: true, trackingUrl: true },
  },
} satisfies Prisma.OrderSelect

type TrackedOrderRow = Prisma.OrderGetPayload<{
  select: typeof TRACKED_ORDER_SELECT
}>

export async function serializeTrackedOrder(order: TrackedOrderRow) {
  const { shipping } = await getPublicStoreSettings()
  const method = shipping.methods.find((m) => m.id === order.shippingMethod)
  const address = (order.shippingAddress ?? {}) as Record<string, unknown>
  const str = (key: string) => (typeof address[key] === 'string' ? (address[key] as string) : null)
  const num = (key: string) => (typeof address[key] === 'number' ? (address[key] as number) : null)

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    email: order.email || null,
    subtotal: Number(order.subtotal),
    shippingTotal: Number(order.shippingTotal),
    discountTotal: Number(order.discountTotal),
    total: Number(order.total),
    discountCode: order.discountCode,
    shippingMethod: method ? { name: method.name, description: method.description } : null,
    items: order.items.map((item) => ({
      name: item.productName,
      variant: item.variantName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
      slug: item.product?.slug ?? null,
    })),
    shipment: order.shipments[0] ?? null,
    address: {
      fullName: str('fullName'),
      phone: str('phone') ?? order.phone,
      streetLine1: str('streetLine1'),
      streetLine2: str('streetLine2'),
      neighborhood: str('neighborhood'),
      city: str('city'),
      state: str('state'),
      postalCode: str('postalCode'),
      latitude: num('latitude'),
      longitude: num('longitude'),
    },
  }
}

export type TrackedOrderData = Awaited<ReturnType<typeof serializeTrackedOrder>>
