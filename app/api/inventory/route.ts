import { NextRequest, NextResponse } from 'next/server'
import { getInventory } from '@/lib/queries/products'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Check permission
    await requirePermission('inventory:view')

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const stockFilter = searchParams.get('stock') as 'all' | 'low' | 'out' | 'ok' | undefined
    const search = searchParams.get('search') || undefined

    const data = await getInventory(page, limit, stockFilter || 'all', search)

    return NextResponse.json(data)
  } catch (error) {
    return handleAuthError(error)
  }
}
