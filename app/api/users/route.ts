import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError, getUserRole } from '@/lib/auth-utils'
import { getTeamMembers, createTeamMember, emailExists } from '@/lib/queries/users'
import { getAssignableRoles } from '@/lib/permissions'
import { UserRole } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET /api/users - List team members
export async function GET() {
  try {
    await requirePermission('users:view')

    const users = await getTeamMembers()

    return NextResponse.json({ users })
  } catch (error) {
    return handleAuthError(error)
  }
}

// POST /api/users - Create team member
export async function POST(request: NextRequest) {
  try {
    await requirePermission('users:create')

    const data = await request.json()

    // Validate required fields
    if (!data.email || !data.firstName || !data.lastName || !data.role || !data.password) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Check if email already exists
    if (await emailExists(data.email)) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Check if user can assign this role
    const currentRole = await getUserRole()
    if (!currentRole) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const assignableRoles = getAssignableRoles(currentRole)
    if (!assignableRoles.includes(data.role as UserRole)) {
      return NextResponse.json(
        { error: 'No tienes permiso para asignar este rol' },
        { status: 403 }
      )
    }

    // Validate password strength
    if (data.password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createTeamMember({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role as UserRole,
      password: data.password,
      department: data.department,
      position: data.position,
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return handleAuthError(error)
  }
}
