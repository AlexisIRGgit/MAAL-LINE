import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { preference } from '@/lib/mercadopago'
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

    // Calculate totals and prepare items for MercadoPago
    let subtotal = 0
    const mpItems: {
      id: string
      title: string
      description?: string
      quantity: number
      unit_price: number
      currency_id: string
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

      // MercadoPago item
      mpItems.push({
        id: product.id,
        title: product.name,
        description: item.variantName ? `Talla: ${item.variantName}` : undefined,
        quantity: item.quantity,
        unit_price: price,
        currency_id: 'MXN',
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

    // Add shipping as an item if not free
    if (shippingTotal > 0) {
      mpItems.push({
        id: 'shipping',
        title: SHIPPING_NAMES[shippingMethod] || 'Envío',
        quantity: 1,
        unit_price: shippingTotal,
        currency_id: 'MXN',
      })
    }

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

    // Create MercadoPago Preference
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maalline.com'

    try {
      const mpPreference = await preference.create({
        body: {
          items: mpItems,
          payer: {
            email: session.user.email || undefined,
            name: address.fullName,
            phone: {
              number: address.phone || '',
            },
            address: {
              street_name: address.streetLine1,
              zip_code: address.postalCode,
            },
          },
          back_urls: {
            success: `${baseUrl}/checkout/success?order=${order.orderNumber}&source=mercadopago`,
            failure: `${baseUrl}/checkout?error=payment_failed`,
            pending: `${baseUrl}/checkout/pending?order=${order.orderNumber}`,
          },
          auto_return: 'approved',
          external_reference: order.id,
          notification_url: `${baseUrl}/api/mercadopago/webhook?source_news=webhooks`,
          statement_descriptor: 'MAAL LINE',
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId,
          },
        },
      })

      // Update order with MercadoPago preference ID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          internalNotes: `MercadoPago Preference: ${mpPreference.id}`,
        },
      })

      // Create order status history
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'pending',
          notes: 'Pedido creado, esperando pago (MercadoPago)',
        },
      })

      return NextResponse.json({
        preferenceId: mpPreference.id,
        initPoint: mpPreference.init_point,
        sandboxInitPoint: mpPreference.sandbox_init_point,
        orderNumber: order.orderNumber,
      })
    } catch (mpError: unknown) {
      console.error('MercadoPago preference creation error:', mpError)
      // Delete the order since preference creation failed
      await prisma.order.delete({ where: { id: order.id } })
      const errorMessage = mpError instanceof Error ? mpError.message : 'Error al crear preferencia de pago'
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    console.error('MercadoPago checkout error:', error)

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
