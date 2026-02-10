import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { UserRole } from '@prisma/client'
import { hasPermission, canAccessAdmin, canManageRole, type Permission } from './permissions'

// Roles that have admin access
const ADMIN_ROLES: UserRole[] = ['viewer', 'employee', 'manager', 'admin', 'owner']

/**
 * Check if current user has admin privileges
 */
export async function requireAdmin() {
  const session = await auth()

  if (!session?.user) {
    throw new AuthError('Unauthorized', 401)
  }

  const userRole = session.user.role as UserRole

  if (!ADMIN_ROLES.includes(userRole)) {
    throw new AuthError('Forbidden', 403)
  }

  return session
}

/**
 * Check if current user is authenticated
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    throw new AuthError('Unauthorized', 401)
  }

  return session
}

/**
 * Check if user has admin role without throwing
 */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin()
    return true
  } catch {
    return false
  }
}

/**
 * Get current user session or null
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'AuthError'
    this.statusCode = statusCode
  }
}

/**
 * Handle auth errors in API routes
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  console.error('Unexpected error:', error)
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  )
}

/**
 * Check if user has specific permission
 */
export async function requirePermission(permission: Permission) {
  const session = await auth()

  if (!session?.user) {
    throw new AuthError('Unauthorized', 401)
  }

  const userRole = session.user.role as UserRole

  if (!canAccessAdmin(userRole)) {
    throw new AuthError('Forbidden', 403)
  }

  if (!hasPermission(userRole, permission)) {
    throw new AuthError('Permission denied', 403)
  }

  return session
}

/**
 * Check if user can manage a target role
 */
export async function requireRoleManagement(targetRole: UserRole) {
  const session = await auth()

  if (!session?.user) {
    throw new AuthError('Unauthorized', 401)
  }

  const userRole = session.user.role as UserRole

  if (!canManageRole(userRole, targetRole)) {
    throw new AuthError('Cannot manage users with this role', 403)
  }

  return session
}

/**
 * Get user role from session
 */
export async function getUserRole(): Promise<UserRole | null> {
  const session = await auth()
  return (session?.user?.role as UserRole) ?? null
}

/**
 * Get current user ID from session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}
