import { UserRole } from '@prisma/client'

// Permission codes for different actions
export type Permission =
  // Dashboard
  | 'dashboard:view'
  | 'dashboard:view_full'
  // Products
  | 'products:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  // Orders
  | 'orders:view'
  | 'orders:process'
  | 'orders:cancel'
  | 'orders:refund'
  // Customers
  | 'customers:view'
  | 'customers:edit'
  | 'customers:delete'
  // Inventory
  | 'inventory:view'
  | 'inventory:adjust'
  // Discounts
  | 'discounts:view'
  | 'discounts:create'
  | 'discounts:edit'
  | 'discounts:delete'
  // Reports
  | 'reports:view'
  | 'reports:export'
  | 'reports:financial'
  // Users
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  // Settings
  | 'settings:view'
  | 'settings:edit'
  | 'settings:payments'
  | 'settings:shipping'

// Role hierarchy (higher = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  customer: 0,
  viewer: 1,
  employee: 2,
  manager: 3,
  admin: 4,
  owner: 5,
}

// Permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  customer: [],

  viewer: [
    'dashboard:view',
    'products:view',
    'orders:view',
    'customers:view',
    'discounts:view',
    'reports:view',
  ],

  employee: [
    'dashboard:view',
    'products:view',
    'products:edit',
    'orders:view',
    'orders:process',
    'customers:view',
    'inventory:view',
    'inventory:adjust',
  ],

  manager: [
    'dashboard:view',
    'dashboard:view_full',
    'products:view',
    'products:create',
    'products:edit',
    'orders:view',
    'orders:process',
    'orders:cancel',
    'customers:view',
    'customers:edit',
    'inventory:view',
    'inventory:adjust',
    'discounts:view',
    'reports:view',
  ],

  admin: [
    'dashboard:view',
    'dashboard:view_full',
    'products:view',
    'products:create',
    'products:edit',
    'products:delete',
    'orders:view',
    'orders:process',
    'orders:cancel',
    'orders:refund',
    'customers:view',
    'customers:edit',
    'customers:delete',
    'inventory:view',
    'inventory:adjust',
    'discounts:view',
    'discounts:create',
    'discounts:edit',
    'discounts:delete',
    'reports:view',
    'reports:export',
    'users:view',
    'users:create',
    'users:edit',
    'settings:view',
    'settings:edit',
  ],

  owner: [
    'dashboard:view',
    'dashboard:view_full',
    'products:view',
    'products:create',
    'products:edit',
    'products:delete',
    'orders:view',
    'orders:process',
    'orders:cancel',
    'orders:refund',
    'customers:view',
    'customers:edit',
    'customers:delete',
    'inventory:view',
    'inventory:adjust',
    'discounts:view',
    'discounts:create',
    'discounts:edit',
    'discounts:delete',
    'reports:view',
    'reports:export',
    'reports:financial',
    'users:view',
    'users:create',
    'users:edit',
    'users:delete',
    'settings:view',
    'settings:edit',
    'settings:payments',
    'settings:shipping',
  ],
}

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

// Check if a role has any of the given permissions
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

// Check if a role has all of the given permissions
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

// Get all permissions for a role
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

// Check if role can manage another role (based on hierarchy)
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole]
}

// Get roles that a user can assign (lower than their own)
export function getAssignableRoles(role: UserRole): UserRole[] {
  const currentLevel = ROLE_HIERARCHY[role]
  return (Object.keys(ROLE_HIERARCHY) as UserRole[])
    .filter(r => r !== 'customer' && ROLE_HIERARCHY[r] < currentLevel)
}

// Check if user is admin or higher
export function isAdminOrHigher(role: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.admin
}

// Check if user can access admin panel
export function canAccessAdmin(role: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.viewer
}

// Role display info
export const ROLE_INFO: Record<UserRole, { label: string; description: string; color: string }> = {
  customer: {
    label: 'Cliente',
    description: 'Usuario de la tienda',
    color: 'gray',
  },
  viewer: {
    label: 'Visor',
    description: 'Solo lectura - consulta y reportes',
    color: 'blue',
  },
  employee: {
    label: 'Empleado',
    description: 'Tareas operativas básicas',
    color: 'green',
  },
  manager: {
    label: 'Gerente',
    description: 'Operaciones diarias de la tienda',
    color: 'amber',
  },
  admin: {
    label: 'Administrador',
    description: 'Gestión completa excepto config crítica',
    color: 'purple',
  },
  owner: {
    label: 'Dueño',
    description: 'Acceso total sin restricciones',
    color: 'red',
  },
}

// Sidebar sections with required permissions
export const SIDEBAR_SECTIONS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: 'LayoutDashboard',
    permission: 'dashboard:view' as Permission,
  },
  {
    key: 'products',
    label: 'Productos',
    href: '/admin/products',
    icon: 'Package',
    permission: 'products:view' as Permission,
  },
  {
    key: 'orders',
    label: 'Pedidos',
    href: '/admin/orders',
    icon: 'ShoppingBag',
    permission: 'orders:view' as Permission,
  },
  {
    key: 'customers',
    label: 'Clientes',
    href: '/admin/customers',
    icon: 'Users',
    permission: 'customers:view' as Permission,
  },
  {
    key: 'inventory',
    label: 'Inventario',
    href: '/admin/inventory',
    icon: 'Warehouse',
    permission: 'inventory:view' as Permission,
  },
  {
    key: 'discounts',
    label: 'Descuentos',
    href: '/admin/discounts',
    icon: 'Percent',
    permission: 'discounts:view' as Permission,
  },
  {
    key: 'users',
    label: 'Usuarios',
    href: '/admin/users',
    icon: 'UserCog',
    permission: 'users:view' as Permission,
  },
  {
    key: 'settings',
    label: 'Configuración',
    href: '/admin/settings',
    icon: 'Settings',
    permission: 'settings:view' as Permission,
  },
]
