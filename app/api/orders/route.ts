import { NextRequest, NextResponse } from 'next/server'
import { getAdminOrders } from '@/lib/queries/orders'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { OrderStatus, PaymentStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Check permission
    await requirePermission('orders:view')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as OrderStatus | undefined
    const paymentStatus = searchParams.get('paymentStatus') as PaymentStatus | undefined
    const search = searchParams.get('search') || undefined

    const data = await getAdminOrders(
      page,
      limit,
      status || undefined,
      paymentStatus || undefined,
      search
    )

    return NextResponse.json(data)
  } catch (error) {
    return handleAuthError(error)
  }
}
