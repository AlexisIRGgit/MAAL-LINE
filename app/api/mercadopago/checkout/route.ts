import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPublicStoreSettings } from '@/lib/public-store-settings'
import { createPendingOrder, prepareCheckout, shippingLabel } from '@/lib/checkout/prepare-order'
import { preference } from '@/lib/mercadopago'

interface MercadoPagoItem {
  id: string
  title: string
  description?: string
  quantity: number
  unit_price: number
  currency_id: string
}

// Signed-in customers and guests both check out here; guests give their email on the MercadoPago page
export async function POST(request: NextRequest) {
  try {
    // Admin > Configuración > Pagos can switch providers off
    const { payments } = await getPublicStoreSettings()
    if (!payments.mercadopago) {
      return NextResponse.json({ error: 'Este método de pago no está disponible' }, { status: 403 })
    }

    const prepared = await prepareCheckout(await request.json().catch(() => null))
    if ('error' in prepared) return NextResponse.json({ error: prepared.error }, { status: prepared.status })

    const order = await createPendingOrder(prepared)

    // MercadoPago has no negative line items, so a discounted order is charged as one line for the exact total
    const mpItems: MercadoPagoItem[] = prepared.discount
      ? [
          {
            id: order.orderNumber,
            title: `Pedido ${order.orderNumber} · MAAL LINE`,
            description: `Incluye envío y cupón ${prepared.discount.code}`,
            quantity: 1,
            unit_price: prepared.total,
            currency_id: 'MXN',
          },
        ]
      : [
          ...prepared.lines.map((line) => ({
            id: line.productId,
            title: line.productName,
            description: line.variantName ? `Talla: ${line.variantName}` : undefined,
            quantity: line.quantity,
            unit_price: line.unitPrice,
            currency_id: 'MXN',
          })),
          ...(prepared.shippingTotal > 0
            ? [{ id: 'shipping', title: shippingLabel(prepared.shippingOption), quantity: 1, unit_price: prepared.shippingTotal, currency_id: 'MXN' }]
            : []),
        ]

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://maalline.com'
    try {
      const mpPreference = await preference.create({
        body: {
          items: mpItems,
          payer: {
            email: prepared.email || undefined,
            name: prepared.address.fullName,
            phone: { number: prepared.phone || '' },
            address: { street_name: prepared.address.streetLine1, zip_code: prepared.address.postalCode },
          },
          back_urls: {
            success: `${baseUrl}/checkout/success?order=${order.orderNumber}&source=mercadopago`,
            failure: `${baseUrl}/?checkout=failed`,
            pending: `${baseUrl}/checkout/pending?order=${order.orderNumber}`,
          },
          auto_return: 'approved',
          external_reference: order.id,
          notification_url: `${baseUrl}/api/mercadopago/webhook?source_news=webhooks`,
          statement_descriptor: 'MAAL LINE',
          metadata: { orderId: order.id, orderNumber: order.orderNumber, userId: prepared.userId ?? 'guest' },
        },
      })

      await Promise.all([
        prisma.order.update({ where: { id: order.id }, data: { internalNotes: `MercadoPago Preference: ${mpPreference.id}` } }),
        prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'pending',
            notes: prepared.userId ? 'Pedido creado, esperando pago (MercadoPago)' : 'Pedido de invitado creado, esperando pago (MercadoPago)',
          },
        }),
      ])

      return NextResponse.json({
        preferenceId: mpPreference.id,
        initPoint: mpPreference.init_point,
        sandboxInitPoint: mpPreference.sandbox_init_point,
        orderNumber: order.orderNumber,
      })
    } catch (mpError: unknown) {
      console.error('MercadoPago preference creation error:', mpError)
      // No preference, so the order would never be paid
      await prisma.order.delete({ where: { id: order.id } })
      return NextResponse.json({ error: 'No pudimos abrir el pago. Intenta de nuevo.' }, { status: 502 })
    }
  } catch (error: unknown) {
    console.error('MercadoPago checkout error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
