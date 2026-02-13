import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

// Disable body parsing for webhook
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('No stripe-signature header')
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Get order ID from metadata
      const orderId = session.metadata?.orderId
      const orderNumber = session.metadata?.orderNumber

      if (!orderId) {
        console.error('No orderId in session metadata')
        break
      }

      console.log(`Payment completed for order: ${orderNumber}`)

      // Fetch the order with items
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      })

      if (!order) {
        console.error(`Order not found: ${orderId}`)
        break
      }

      // Update order payment status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          status: 'processing',
          confirmedAt: new Date(),
        },
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'stripe',
          providerPaymentId: session.payment_intent as string,
          method: 'card',
          amount: parseFloat(order.total.toString()),
          currency: 'MXN',
          status: 'completed',
          completedAt: new Date(),
          metadata: {
            sessionId: session.id,
            customerEmail: session.customer_email,
          },
        },
      })

      // Update stock for each item
      for (const item of order.items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          })
        }
      }

      // Update discount usage if applicable
      if (order.discountId) {
        await prisma.discount.update({
          where: { id: order.discountId },
          data: { usageCount: { increment: 1 } },
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

      // Create order status history
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'processing',
          notes: `Pago confirmado via Stripe. Payment Intent: ${session.payment_intent}`,
        },
      })

      console.log(`Order ${orderNumber} successfully updated to paid/processing`)
      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId) {
        // Mark order as cancelled due to expired session
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'cancelled',
            paymentStatus: 'failed',
          },
        })

        await prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: 'cancelled',
            notes: 'Sesión de pago expirada',
          },
        })

        console.log(`Order ${orderId} cancelled due to expired session`)
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.error('Payment failed:', paymentIntent.last_payment_error?.message)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
