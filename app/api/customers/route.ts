import { NextRequest, NextResponse } from 'next/server'
import { getAdminCustomers } from '@/lib/queries/customers'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'
import { CustomerGroup } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Check permission
    await requirePermission('customers:view')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const group = searchParams.get('group') as CustomerGroup | undefined
    const search = searchParams.get('search') || undefined

    const data = await getAdminCustomers(
      page,
      limit,
      group || undefined,
      search
    )

    return NextResponse.json(data)
  } catch (error) {
    return handleAuthError(error)
  }
}
