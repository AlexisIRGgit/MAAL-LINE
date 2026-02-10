'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  User,
  MapPin,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Bell,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const menuItems = [
  { href: '/cuenta', label: 'Resumen', icon: LayoutDashboard },
  { href: '/cuenta/pedidos', label: 'Mis Pedidos', icon: Package },
  { href: '/cuenta/perfil', label: 'Mi Perfil', icon: User },
  { href: '/cuenta/direcciones', label: 'Direcciones', icon: MapPin },
  { href: '/cuenta/pagos', label: 'Métodos de Pago', icon: CreditCard },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const userName = session?.user?.firstName || session?.user?.name?.split(' ')[0] || 'Usuario'
  const userEmail = session?.user?.email || ''
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="text-lg font-bold text-[#111827]">
            MAAL LINE
          </Link>
          <Link
            href="/cuenta/perfil"
            className="w-8 h-8 bg-gradient-to-br from-[#111827] to-[#374151] rounded-full flex items-center justify-center text-white text-sm font-bold"
          >
            {userInitial}
          </Link>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
                  <Link href="/" className="text-xl font-bold text-[#111827]">
                    MAAL LINE
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#111827] to-[#374151] rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#111827] truncate">{userName}</p>
                      <p className="text-sm text-[#6B7280] truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                          isActive
                            ? 'bg-[#111827] text-white font-semibold'
                            : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-[#E5E7EB] space-y-1">
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] rounded-xl transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span>Volver a la tienda</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-[#E5E7EB] sticky top-0">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
            <Link href="/" className="text-xl font-bold text-[#111827]">
              MAAL LINE
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#111827] to-[#374151] rounded-full flex items-center justify-center text-white font-bold">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#111827] text-sm truncate">{userName}</p>
                <p className="text-xs text-[#6B7280] truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm',
                    isActive
                      ? 'bg-[#111827] text-white font-semibold'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#E5E7EB] space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] rounded-xl transition-all text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver a la tienda</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
