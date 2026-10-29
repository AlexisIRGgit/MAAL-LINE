import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPublicStoreSettings } from '@/lib/public-store-settings'
import { createPendingOrder, prepareCheckout, shippingLabel } from '@/lib/checkout/prepare-order'
import { stripe, formatAmountForStripe } from '@/lib/stripe'

const STRIPE_MIN_MXN = 10

// Signed-in customers and guests both check out here; guests give their email on the Stripe page
export async function POST(request: NextRequest) {
  try {
    // Admin > Configuración > Pagos can switch providers off
    const { payments } = await getPublicStoreSettings()
    if (!payments.stripe) {
      return NextResponse.json({ error: 'Este método de pago no está disponible' }, { status: 403 })
    }

    const prepared = await prepareCheckout(await request.json().catch(() => null))
    if ('error' in prepared) return NextResponse.json({ error: prepared.error }, { status: prepared.status })
    // Stripe rejects Checkout Sessions under $10 MXN (amount_too_small)
    if (prepared.total < STRIPE_MIN_MXN) {
      return NextResponse.json({ error: `Con tarjeta el total mínimo es de $${STRIPE_MIN_MXN} MXN. Elige otro método de pago o ajusta tu pedido.` }, { status: 400 })
    }

    const lineItems = prepared.lines.map((line) => ({
      price_data: {
        currency: 'mxn',
        // No images: long image URLs can push the session over Stripe's limits
        product_data: { name: line.productName, description: line.variantName ? `Talla: ${line.variantName}` : undefined },
        unit_amount: formatAmountForStripe(line.unitPrice),
      },
      quantity: line.quantity,
    }))
    if (prepared.shippingTotal > 0) {
      lineItems.push({
        price_data: {
          currency: 'mxn',
          product_data: { name: shippingLabel(prepared.shippingOption), description: undefined },
          unit_amount: formatAmountForStripe(prepared.shippingTotal),
        },
        quantity: 1,
      })
    }

    const order = await createPendingOrder(prepared)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maalline.com'

    let stripeSession
    let couponId: string | null = null
    try {
      // The coupon is charged as a one-time Stripe coupon for the exact amount
      const coupon = prepared.discount
        ? await stripe.coupons.create({
            amount_off: formatAmountForStripe(prepared.discount.amount),
            currency: 'mxn',
            duration: 'once',
            max_redemptions: 1,
            name: `Cupón ${prepared.discount.code}`,
          })
        : null
      couponId = coupon?.id ?? null
      stripeSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        ...(coupon && { discounts: [{ coupon: coupon.id }] }),
        customer_email: prepared.email || undefined,
        metadata: { orderId: order.id, orderNumber: order.orderNumber, userId: prepared.userId ?? 'guest' },
        success_url: `${baseUrl}/checkout/success?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/?checkout=canceled`,
      })
    } catch (stripeError: unknown) {
      console.error('Stripe session creation error:', stripeError)
      // No payment session, so the order would never be paid
      await prisma.order.delete({ where: { id: order.id } })
      // The one-time coupon was made for this session only
      if (couponId) await stripe.coupons.del(couponId).catch(() => undefined)
      return NextResponse.json({ error: 'No pudimos abrir el pago. Intenta de nuevo.' }, { status: 502 })
    }

    await Promise.all([
      prisma.order.update({ where: { id: order.id }, data: { internalNotes: `Stripe Session: ${stripeSession.id}` } }),
      prisma.orderStatusHistory.create({
        data: { orderId: order.id, status: 'pending', notes: prepared.userId ? 'Pedido creado, esperando pago' : 'Pedido de invitado creado, esperando pago' },
      }),
    ])

    return NextResponse.json({ sessionId: stripeSession.id, sessionUrl: stripeSession.url, orderNumber: order.orderNumber })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
