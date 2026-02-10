import { NextRequest, NextResponse } from 'next/server'
import { resetCustomerPassword } from '@/lib/queries/customers'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check permission
    await requirePermission('customers:edit')

    const { id } = params

    // Generate new temporary password
    const tempPassword = await resetCustomerPassword(id)

    return NextResponse.json({
      success: true,
      tempPassword,
      message: 'Contraseña temporal generada exitosamente',
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
