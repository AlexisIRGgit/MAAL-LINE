'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Users,
  Percent,
  Settings,
  ChevronLeft,
  Menu,
  X,
  UserCog,
} from 'lucide-react'
import { hasPermission, type Permission } from '@/lib/permissions'
import type { UserRole } from '@prisma/client'

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission: Permission
}

const menuItems: MenuItem[] = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard, permission: 'dashboard:view' },
  { name: 'Productos', href: '/admin/products', icon: Package, permission: 'products:view' },
  { name: 'Pedidos', href: '/admin/orders', icon: ShoppingCart, permission: 'orders:view' },
  { name: 'Inventario', href: '/admin/inventory', icon: Warehouse, permission: 'inventory:view' },
  { name: 'Clientes', href: '/admin/customers', icon: Users, permission: 'customers:view' },
  { name: 'Descuentos', href: '/admin/discounts', icon: Percent, permission: 'discounts:view' },
  { name: 'Usuarios', href: '/admin/users', icon: UserCog, permission: 'users:view' },
  { name: 'Configuración', href: '/admin/settings', icon: Settings, permission: 'settings:view' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const userRole = (session?.user?.role as UserRole) || 'customer'

  // Filter menu items based on user permissions
  const visibleMenuItems = menuItems.filter((item) =>
    hasPermission(userRole, item.permission)
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-[#E5E7EB] rounded-xl shadow-sm"
      >
        <Menu className="w-5 h-5 text-[#374151]" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          bg-white border-r border-[#E5E7EB]
          flex flex-col h-screen
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-[240px]'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB]">
          <Link href="/admin" className="flex items-center gap-2">
            {isCollapsed ? (
              <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
            ) : (
              <Image
                src="/images/logo-maal-negro.png"
                alt="MAAL"
                width={80}
                height={32}
              />
            )}
          </Link>

          {/* Close Mobile / Collapse Desktop */}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileOpen(false)
              } else {
                setIsCollapsed(!isCollapsed)
              }
            }}
            className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5 text-[#6B7280] lg:hidden" />
            ) : null}
            <ChevronLeft
              className={`w-5 h-5 text-[#6B7280] hidden lg:block transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-[#111827] text-white'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                  }
                `}
              >
                {/* Icon */}
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />

                {/* Label */}
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-[#111827] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-[#E5E7EB]">
          {!isCollapsed && (
            <div className="p-4 bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-2xl text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Pro Tips</span>
              </div>
              <p className="text-xs text-white/70 mb-3">
                Usa atajos de teclado para navegar más rápido
              </p>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">
                Ver atajos
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
