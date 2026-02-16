import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { payment } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('MercadoPago webhook received:', JSON.stringify(body, null, 2))

    // MercadoPago sends different types of notifications
    const { type, data, action } = body

    // Handle payment notifications
    if (type === 'payment' && data?.id) {
      const paymentId = data.id

      // Fetch payment details from MercadoPago
      const paymentData = await payment.get({ id: paymentId })

      if (!paymentData) {
        console.error('Payment not found:', paymentId)
        return NextResponse.json({ received: true })
      }

      console.log('Payment data:', JSON.stringify(paymentData, null, 2))

      const orderId = paymentData.external_reference
      const paymentStatus = paymentData.status

      if (!orderId) {
        console.error('No external_reference in payment')
        return NextResponse.json({ received: true })
      }

      // Find the order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      })

      if (!order) {
        console.error('Order not found:', orderId)
        return NextResponse.json({ received: true })
      }

      // Map MercadoPago status to our status
      let newOrderStatus = order.status
      let newPaymentStatus = order.paymentStatus

      switch (paymentStatus) {
        case 'approved':
          newOrderStatus = 'processing'
          newPaymentStatus = 'paid'
          break
        case 'pending':
        case 'in_process':
          newPaymentStatus = 'pending'
          break
        case 'rejected':
        case 'cancelled':
          newPaymentStatus = 'failed'
          break
        case 'refunded':
          newPaymentStatus = 'refunded'
          newOrderStatus = 'refunded'
          break
      }

      // Update order
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: newOrderStatus,
          paymentStatus: newPaymentStatus,
          ...(paymentStatus === 'approved' && { confirmedAt: new Date() }),
        },
      })

      // Create payment record if approved
      if (paymentStatus === 'approved') {
        // Check if payment record already exists
        const existingPayment = await prisma.payment.findFirst({
          where: { providerPaymentId: paymentId.toString() },
        })

        if (!existingPayment) {
          await prisma.payment.create({
            data: {
              orderId: order.id,
              amount: paymentData.transaction_amount || parseFloat(order.total.toString()),
              currency: 'MXN',
              provider: 'mercadopago',
              status: 'completed',
              providerPaymentId: paymentId.toString(),
              method: 'card',
              completedAt: new Date(),
              metadata: {
                mercadopago_payment_id: paymentId,
                payment_method_id: paymentData.payment_method_id,
                payment_type_id: paymentData.payment_type_id,
                installments: paymentData.installments,
                payer_email: paymentData.payer?.email,
              },
            },
          })

          // Update stock for each item
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId: order.id },
          })

          for (const item of orderItems) {
            if (item.variantId) {
              await prisma.productVariant.update({
                where: { id: item.variantId },
                data: {
                  stockQuantity: {
                    decrement: item.quantity,
                  },
                },
              })
            }
          }

          // Create status history
          await prisma.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: 'processing',
              notes: `Pago confirmado via MercadoPago (ID: ${paymentId})`,
            },
          })

          // Update discount usage if applicable
          if (order.discountId) {
            await prisma.discount.update({
              where: { id: order.discountId },
              data: {
                usageCount: {
                  increment: 1,
                },
              },
            })

            await prisma.discountUsage.create({
              data: {
                discountId: order.discountId,
                orderId: order.id,
                userId: order.userId,
                amountSaved: parseFloat(order.discountTotal.toString()),
              },
            })
          }
        }
      }

      console.log(`Order ${order.orderNumber} updated: status=${newOrderStatus}, paymentStatus=${newPaymentStatus}`)
    }

    // Handle merchant_order notifications (alternative notification type)
    if (type === 'merchant_order' && data?.id) {
      // MercadoPago can also send merchant_order notifications
      // These contain aggregated information about payments
      console.log('Merchant order notification received:', data.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('MercadoPago webhook error:', error)
    // Return 200 to acknowledge receipt even on error
    // to prevent MercadoPago from retrying indefinitely
    return NextResponse.json({ received: true, error: 'Processing error' })
  }
}

// MercadoPago also sends GET requests to verify the webhook URL
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
