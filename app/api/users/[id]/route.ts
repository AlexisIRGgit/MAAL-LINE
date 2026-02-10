import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, handleAuthError, getUserRole, getCurrentUserId } from '@/lib/auth-utils'
import { getUserById, updateTeamMember, deleteTeamMember, emailExists } from '@/lib/queries/users'
import { getAssignableRoles, canManageRole, ROLE_HIERARCHY } from '@/lib/permissions'
import { UserRole, UserStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/users/[id] - Get user by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePermission('users:view')

    const { id } = await params
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    return handleAuthError(error)
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePermission('users:edit')

    const { id } = await params
    const data = await request.json()

    // Get current user to check permissions
    const existingUser = await getUserById(id)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const currentRole = await getUserRole()
    const currentUserId = await getCurrentUserId()

    if (!currentRole || !currentUserId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Allow users to edit their own profile, or check role hierarchy
    const isEditingSelf = currentUserId === id
    if (!isEditingSelf && !canManageRole(currentRole, existingUser.role)) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar este usuario' },
        { status: 403 }
      )
    }

    // If changing role, validate the new role
    if (data.role && data.role !== existingUser.role) {
      // Users cannot change their own role
      if (isEditingSelf) {
        return NextResponse.json(
          { error: 'No puedes cambiar tu propio rol' },
          { status: 403 }
        )
      }

      const assignableRoles = getAssignableRoles(currentRole)
      if (!assignableRoles.includes(data.role as UserRole)) {
        return NextResponse.json(
          { error: 'No tienes permiso para asignar este rol' },
          { status: 403 }
        )
      }
    }

    // Validate email if changing
    if (data.email && data.email !== existingUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return NextResponse.json(
          { error: 'Email inválido' },
          { status: 400 }
        )
      }

      if (await emailExists(data.email, id)) {
        return NextResponse.json(
          { error: 'Este email ya está registrado' },
          { status: 400 }
        )
      }
    }

    // Validate password if provided
    if (data.password && data.password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Update user
    const user = await updateTeamMember(id, {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role as UserRole,
      status: data.status as UserStatus,
      password: data.password,
      department: data.department,
      position: data.position,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return handleAuthError(error)
  }
}

// DELETE /api/users/[id] - Delete user (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requirePermission('users:delete')

    const { id } = await params

    // Get user to check permissions
    const existingUser = await getUserById(id)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const currentRole = await getUserRole()
    const currentUserId = await getCurrentUserId()

    if (!currentRole || !currentUserId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Prevent deleting self
    if (currentUserId === id) {
      return NextResponse.json(
        { error: 'No puedes eliminarte a ti mismo' },
        { status: 403 }
      )
    }

    // Check if user can delete target user
    if (!canManageRole(currentRole, existingUser.role)) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este usuario' },
        { status: 403 }
      )
    }

    // Prevent deleting owner
    if (existingUser.role === 'owner') {
      return NextResponse.json(
        { error: 'No se puede eliminar al dueño' },
        { status: 403 }
      )
    }

    await deleteTeamMember(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return handleAuthError(error)
  }
}
