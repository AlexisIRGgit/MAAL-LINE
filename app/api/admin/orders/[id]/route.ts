import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { OrderStatus, PaymentStatus, ShipmentStatus } from '@prisma/client'

// GET - Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('orders:view')
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        shipments: {
          orderBy: { createdAt: 'desc' },
        },
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
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        refunds: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PATCH - Update order (status, notes, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('orders:process')
    const userId = session.user.id
    const { id } = await params

    const body = await request.json()
    const { status, paymentStatus, internalNotes, trackingNumber, carrier } = body

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    const statusHistoryData: any[] = []

    // Handle status change
    if (status && status !== order.status) {
      updateData.status = status

      // Set appropriate timestamps
      const now = new Date()
      switch (status) {
        case 'confirmed':
          updateData.confirmedAt = now
          break
        case 'shipped':
          updateData.shippedAt = now
          break
        case 'delivered':
          updateData.deliveredAt = now
          break
        case 'cancelled':
          updateData.cancelledAt = now
          updateData.cancelledById = userId
          break
      }

      // Record status change in history
      statusHistoryData.push({
        orderId: id,
        status: status,
        previousStatus: order.status,
        createdById: userId,
        notes: `Estado cambiado de ${order.status} a ${status}`,
      })
    }

    // Handle payment status change
    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      updateData.paymentStatus = paymentStatus

      statusHistoryData.push({
        orderId: id,
        status: order.status,
        createdById: userId,
        notes: `Estado de pago cambiado a ${paymentStatus}`,
      })
    }

    // Handle internal notes
    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes
    }

    // Handle tracking info (create/update shipment)
    if (trackingNumber || carrier) {
      const existingShipment = await prisma.shipment.findFirst({
        where: { orderId: id },
        orderBy: { createdAt: 'desc' },
      })

      if (existingShipment) {
        await prisma.shipment.update({
          where: { id: existingShipment.id },
          data: {
            trackingNumber: trackingNumber || existingShipment.trackingNumber,
            carrier: carrier || existingShipment.carrier,
            status: trackingNumber ? 'in_transit' : existingShipment.status,
            shippedAt: trackingNumber ? new Date() : existingShipment.shippedAt,
          },
        })
      } else {
        await prisma.shipment.create({
          data: {
            orderId: id,
            trackingNumber,
            carrier,
            status: 'pending',
            shippingAddress: order.shippingAddress || {},
          },
        })
      }

      // If adding tracking, also update order status to shipped if not already
      if (trackingNumber && order.status === 'processing') {
        updateData.status = 'shipped'
        updateData.shippedAt = new Date()

        statusHistoryData.push({
          orderId: id,
          status: 'shipped',
          previousStatus: order.status,
          createdById: userId,
          notes: `Pedido enviado con número de rastreo: ${trackingNumber}`,
        })
      }
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        shipments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    // Create status history records
    if (statusHistoryData.length > 0) {
      await prisma.orderStatusHistory.createMany({
        data: statusHistoryData,
      })
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
