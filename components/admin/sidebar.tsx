'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Users,
  Percent,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/products', icon: Package },
  { name: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Inventario', href: '/admin/inventory', icon: Warehouse },
  { name: 'Clientes', href: '/admin/customers', icon: Users },
  { name: 'Descuentos', href: '/admin/discounts', icon: Percent },
  { name: 'Configuración', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const sidebarVariants = {
    expanded: { width: 200 },
    collapsed: { width: 56 },
  }

  const linkVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 },
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-1.5 bg-[#111111] border border-[#222222] rounded-lg text-[#E8E4D9]"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          bg-[#0a0a0a] border-r border-[#1a1a1a]
          flex flex-col h-screen
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none duration-300
        `}
      >
        {/* Logo Section */}
        <div className="h-12 flex items-center justify-between px-2 border-b border-[#1a1a1a]">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/logo-maal-negro.png"
                  alt="MAAL"
                  width={70}
                  height={28}
                  className="invert"
                />
                <span className="text-[10px] text-[#666] font-mono bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                  ADMIN
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg bg-[#111] border border-[#222] text-[#888] hover:text-[#E8E4D9] hover:border-[#333] transition-all"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  relative flex items-center gap-2 px-2 py-2 rounded-lg
                  transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-[#C9A962]/20 to-transparent text-[#C9A962]'
                    : 'text-[#888] hover:text-[#E8E4D9] hover:bg-[#111]'
                  }
                `}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#C9A962] rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div className={`
                  relative p-1.5 rounded-md
                  ${isActive ? 'bg-[#C9A962]/10' : 'bg-[#111] group-hover:bg-[#1a1a1a]'}
                  transition-all duration-200
                `}>
                  <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C9A962]' : ''}`} />
                </div>

                {/* Label */}
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      variants={linkVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="text-xs font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#111] border border-[#222] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    <span className="text-xs text-[#E8E4D9]">{item.name}</span>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-2 border-t border-[#1a1a1a]">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`
              w-full flex items-center gap-2 px-2 py-2 rounded-lg
              text-[#888] hover:text-red-400 hover:bg-red-500/10
              transition-all duration-200 group
            `}
          >
            <div className="p-1.5 rounded-md bg-[#111] group-hover:bg-red-500/10 transition-all">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  variants={linkVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="text-xs font-medium"
                >
                  Cerrar Sesión
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#C9A962]/5 to-transparent pointer-events-none" />
      </motion.aside>
    </>
  )
}
