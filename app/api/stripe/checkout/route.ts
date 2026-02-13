import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { nanoid } from 'nanoid'

interface CheckoutItem {
  productId: string
  variantName: string
  quantity: number
  unitPrice: number
}

interface CheckoutRequest {
  addressId: string
  shippingMethod: string
  items: CheckoutItem[]
  discountCode?: string
}

const SHIPPING_COSTS: Record<string, number> = {
  standard: 99,
  express: 199,
  next_day: 349,
}

const SHIPPING_NAMES: Record<string, string> = {
  standard: 'Envío Estándar (5-7 días)',
  express: 'Envío Express (2-3 días)',
  next_day: 'Envío al Día Siguiente',
}

const FREE_SHIPPING_THRESHOLD = 999

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const body: CheckoutRequest = await request.json()
    const { addressId, shippingMethod, items, discountCode } = body

    // Validate request
    if (!addressId || !shippingMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Fetch shipping address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    })

    if (!address) {
      return NextResponse.json(
        { error: 'Dirección no encontrada' },
        { status: 404 }
      )
    }

    // Validate products and get current prices
    const productIds = items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'active' },
      include: {
        variants: true,
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Algunos productos no están disponibles' },
        { status: 400 }
      )
    }

    // Calculate totals and prepare line items for Stripe
    let subtotal = 0
    const stripeLineItems: {
      price_data: {
        currency: string
        product_data: {
          name: string
          description?: string
          images?: string[]
        }
        unit_amount: number
      }
      quantity: number
    }[] = []

    const orderItems: {
      productId: string
      variantId: string | null
      productName: string
      variantName: string | null
      sku: string | null
      imageUrl: string | null
      quantity: number
      unitPrice: number
      total: number
    }[] = []

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) continue

      // Find matching variant
      const variant = product.variants.find(
        (v) => v.size === item.variantName || v.color === item.variantName
      )

      // Check stock if variant exists
      if (variant && variant.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}` },
          { status: 400 }
        )
      }

      const price = parseFloat(product.price.toString())
      const itemTotal = price * item.quantity
      subtotal += itemTotal

      // Stripe line item
      const imageUrl = product.images[0]?.url
      stripeLineItems.push({
        price_data: {
          currency: 'mxn',
          product_data: {
            name: product.name,
            description: item.variantName ? `Talla: ${item.variantName}` : undefined,
            images: imageUrl ? [imageUrl] : undefined,
          },
          unit_amount: formatAmountForStripe(price),
        },
        quantity: item.quantity,
      })

      orderItems.push({
        productId: product.id,
        variantId: variant?.id || null,
        productName: product.name,
        variantName: item.variantName,
        sku: variant?.sku || null,
        imageUrl: product.images[0]?.url || null,
        quantity: item.quantity,
        unitPrice: price,
        total: itemTotal,
      })
    }

    // Calculate shipping
    const shippingTotal = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (SHIPPING_COSTS[shippingMethod] || 99)

    // Handle discount code
    let discountTotal = 0
    let discountId: string | null = null
    let stripeDiscountCoupon: string | undefined

    if (discountCode) {
      const discount = await prisma.discount.findUnique({
        where: { code: discountCode.toUpperCase() },
      })

      if (discount && discount.isActive) {
        const now = new Date()
        const isValid = discount.startsAt <= now && (!discount.expiresAt || discount.expiresAt >= now)
        const withinUsageLimit = !discount.usageLimit || discount.usageCount < discount.usageLimit

        if (isValid && withinUsageLimit) {
          if (discount.type === 'percentage') {
            discountTotal = subtotal * (parseFloat(discount.value.toString()) / 100)
            if (discount.maximumDiscount) {
              discountTotal = Math.min(discountTotal, parseFloat(discount.maximumDiscount.toString()))
            }
          } else if (discount.type === 'fixed_amount') {
            discountTotal = parseFloat(discount.value.toString())
          } else if (discount.type === 'free_shipping') {
            discountTotal = shippingTotal
          }
          discountId = discount.id
        }
      }
    }

    const total = subtotal + shippingTotal - discountTotal

    // Generate order number
    const orderNumber = `ML-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`

    // Create order with payment_pending status
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        email: session.user.email,
        phone: address.phone,
        status: 'pending',
        paymentStatus: 'pending',
        subtotal,
        shippingTotal,
        discountTotal,
        total,
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          streetLine1: address.streetLine1,
          streetLine2: address.streetLine2,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        shippingMethod,
        discountCode: discountCode?.toUpperCase() || null,
        discountId,
        source: 'web',
        items: {
          create: orderItems,
        },
      },
    })

    // Add shipping as a line item if not free
    if (shippingTotal > 0) {
      stripeLineItems.push({
        price_data: {
          currency: 'mxn',
          product_data: {
            name: SHIPPING_NAMES[shippingMethod] || 'Envío',
          },
          unit_amount: formatAmountForStripe(shippingTotal),
        },
        quantity: 1,
      })
    }

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maalline.com'

    // Build session config
    const sessionConfig: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
      },
      success_url: `${baseUrl}/checkout/success?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
      locale: 'es-419',
    }

    // Add customer email if available
    if (session.user.email) {
      sessionConfig.customer_email = session.user.email
    }

    // Add discount if applicable
    if (discountTotal > 0) {
      const couponId = await createStripeCoupon(discountTotal)
      sessionConfig.discounts = [{ coupon: couponId }]
    }

    let stripeSession
    try {
      stripeSession = await stripe.checkout.sessions.create(sessionConfig)
    } catch (stripeError: unknown) {
      console.error('Stripe session creation error:', stripeError)
      // Delete the order since payment session failed
      await prisma.order.delete({ where: { id: order.id } })
      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Error al crear sesión de pago'
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        internalNotes: `Stripe Session: ${stripeSession.id}`,
      },
    })

    // Create order status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'pending',
        notes: 'Pedido creado, esperando pago',
      },
    })

    return NextResponse.json({
      sessionId: stripeSession.id,
      sessionUrl: stripeSession.url,
      orderNumber: order.orderNumber,
    })
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error)

    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('autenticado')) {
      return handleAuthError(error)
    }

    // Return generic error with details in dev
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Helper to create a one-time Stripe coupon for discounts
async function createStripeCoupon(amount: number): Promise<string> {
  const coupon = await stripe.coupons.create({
    amount_off: formatAmountForStripe(amount),
    currency: 'mxn',
    duration: 'once',
    name: 'Descuento aplicado',
  })
  return coupon.id
}
