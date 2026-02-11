import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
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

    // Calculate totals
    let subtotal = 0
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

    // Generate order number
    const orderNumber = `ML-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`

    // Create order
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
      include: {
        items: true,
      },
    })

    // Update product stock
    for (const item of orderItems) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        })
      }
    }

    // Update discount usage
    if (discountId) {
      await prisma.discount.update({
        where: { id: discountId },
        data: { usageCount: { increment: 1 } },
      })

      await prisma.discountUsage.create({
        data: {
          discountId,
          orderId: order.id,
          userId,
          amountSaved: discountTotal,
        },
      })
    }

    // Create order status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'pending',
        notes: 'Pedido creado',
      },
    })

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return handleAuthError(error)
  }
}
