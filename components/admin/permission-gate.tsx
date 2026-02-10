'use client'

import { usePermissions } from '@/hooks/use-permissions'
import type { Permission } from '@/lib/permissions'
import { ShieldAlert } from 'lucide-react'

interface PermissionGateProps {
  permission: Permission | Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({
  permission,
  requireAll = false,
  fallback,
  children,
}: PermissionGateProps) {
  const { can, canAny, isLoading } = usePermissions()

  if (isLoading) {
    return null
  }

  const permissions = Array.isArray(permission) ? permission : [permission]
  const hasAccess = requireAll
    ? permissions.every((p) => can(p))
    : canAny(permissions)

  if (!hasAccess) {
    return fallback ?? null
  }

  return <>{children}</>
}

// Full page access denied component
export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="p-4 bg-red-50 rounded-full mb-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-[#111827] mb-2">Acceso Denegado</h2>
      <p className="text-[#6B7280] max-w-md">
        No tienes permisos para acceder a esta sección. Contacta a tu administrador si crees que esto es un error.
      </p>
    </div>
  )
}

// Button that's disabled or hidden based on permission
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission: Permission
  hideIfDenied?: boolean
  children: React.ReactNode
}

export function PermissionButton({
  permission,
  hideIfDenied = false,
  children,
  disabled,
  ...props
}: PermissionButtonProps) {
  const { can } = usePermissions()
  const hasAccess = can(permission)

  if (hideIfDenied && !hasAccess) {
    return null
  }

  return (
    <button {...props} disabled={disabled || !hasAccess}>
      {children}
    </button>
  )
}
