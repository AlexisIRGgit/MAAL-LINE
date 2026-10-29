import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { TRACKED_ORDER_SELECT, serializeTrackedOrder } from '@/lib/orders/tracked-order'

/** One of the signed-in customer's orders, for the "Rastrear pedido" modal in Mis pedidos */
export async function GET(_request: NextRequest, { params }: { params: { orderNumber: string } }) {
  try {
    const session = await requireAuth()
    const orderNumber = decodeURIComponent(params.orderNumber).toUpperCase().slice(0, 30)
    const order = await prisma.order.findUnique({ where: { orderNumber }, select: TRACKED_ORDER_SELECT })
    // Someone else's order answers like a missing one
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ order: await serializeTrackedOrder(order) })
  } catch (error) {
    return handleAuthError(error)
  }
}
