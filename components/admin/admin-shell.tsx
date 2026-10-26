'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Users,
  Percent,
  Settings,
  UserCog,
  Store,
} from 'lucide-react'
import type { UserRole } from '@prisma/client'
import { hasPermission, type Permission } from '@/lib/permissions'
import { AdminHeader } from '@/components/admin/header'
import {
  DesktopSidebar,
  MobileSidebarSheet,
  type SidebarConfig,
  type SidebarItem,
} from '@/components/navigation/app-sidebar'

const menuItems: (SidebarItem & { permission: Permission })[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, permission: 'dashboard:view' },
  { label: 'Productos', href: '/admin/products', icon: Package, permission: 'products:view' },
  { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart, permission: 'orders:view' },
  { label: 'Inventario', href: '/admin/inventory', icon: Warehouse, permission: 'inventory:view' },
  { label: 'Clientes', href: '/admin/customers', icon: Users, permission: 'customers:view' },
  { label: 'Descuentos', href: '/admin/discounts', icon: Percent, permission: 'discounts:view' },
  { label: 'Usuarios', href: '/admin/users', icon: UserCog, permission: 'users:view' },
  { label: 'Configuración', href: '/admin/settings', icon: Settings, permission: 'settings:view' },
]

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Empleado',
  viewer: 'Viewer',
  customer: 'Cliente',
}

function isItemActive(pathname: string, href: string) {
  return href === '/admin' ? pathname === href : pathname.startsWith(href)
}

/** Admin chrome: the shared sidebar (same as the customer panel) plus the admin header. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  const role = (session?.user?.role as UserRole) || 'customer'
  const userName = session?.user?.firstName || session?.user?.email?.split('@')[0] || 'Admin'

  const config: SidebarConfig = useMemo(
    () => ({
      brand: <Image src="/images/logo-maal-negro.png" alt="MAAL" width={80} height={32} className="h-8 w-auto" />,
      brandHref: '/admin',
      items: menuItems.filter((item) => hasPermission(role, item.permission)),
      isActive: isItemActive,
      user: {
        name: userName,
        subtitle: roleLabels[role] ?? role,
        avatarUrl: session?.user?.avatarUrl ?? null,
        seed: session?.user?.email || session?.user?.id || userName,
        href: '/admin/settings',
      },
      footerLinks: [{ href: '/', label: 'Ver tienda', icon: Store }],
      onSignOut: () => signOut({ callbackUrl: '/admin/login' }),
    }),
    [role, userName, session?.user?.avatarUrl, session?.user?.email, session?.user?.id]
  )

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">
      <DesktopSidebar config={config} storageKey="maal-admin-sidebar-collapsed" />
      <MobileSidebarSheet
        config={config}
        open={isMobileMenuOpen}
        onClose={closeMobileMenu}
        triggerRef={menuTriggerRef}
        label="Menú de administración"
        layoutPrefix="admin-mobile"
      />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} menuTriggerRef={menuTriggerRef} isMenuOpen={isMobileMenuOpen} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
