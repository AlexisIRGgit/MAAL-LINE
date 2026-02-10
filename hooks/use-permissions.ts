'use client'

import { useSession } from 'next-auth/react'
import {
  hasPermission,
  hasAnyPermission,
  canManageRole,
  getAssignableRoles,
  ROLE_INFO,
  type Permission
} from '@/lib/permissions'
import type { UserRole } from '@prisma/client'

export function usePermissions() {
  const { data: session, status } = useSession()

  const userRole = (session?.user?.role as UserRole) || 'customer'
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'

  return {
    // User info
    userRole,
    isLoading,
    isAuthenticated,
    roleInfo: ROLE_INFO[userRole],

    // Permission checks
    can: (permission: Permission) => hasPermission(userRole, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),

    // Role management
    canManage: (targetRole: UserRole) => canManageRole(userRole, targetRole),
    assignableRoles: getAssignableRoles(userRole),

    // Common permission checks
    canViewDashboard: hasPermission(userRole, 'dashboard:view'),
    canViewProducts: hasPermission(userRole, 'products:view'),
    canCreateProducts: hasPermission(userRole, 'products:create'),
    canEditProducts: hasPermission(userRole, 'products:edit'),
    canDeleteProducts: hasPermission(userRole, 'products:delete'),
    canViewOrders: hasPermission(userRole, 'orders:view'),
    canProcessOrders: hasPermission(userRole, 'orders:process'),
    canViewCustomers: hasPermission(userRole, 'customers:view'),
    canViewInventory: hasPermission(userRole, 'inventory:view'),
    canViewDiscounts: hasPermission(userRole, 'discounts:view'),
    canCreateDiscounts: hasPermission(userRole, 'discounts:create'),
    canViewUsers: hasPermission(userRole, 'users:view'),
    canCreateUsers: hasPermission(userRole, 'users:create'),
    canViewSettings: hasPermission(userRole, 'settings:view'),
    canEditSettings: hasPermission(userRole, 'settings:edit'),
  }
}
