'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Package, User, MapPin, LogOut, Menu, ChevronLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { FloatingHomeButton } from '@/components/account/floating-home-button'
import {
  DesktopSidebar,
  MobileSidebarSheet,
  SidebarAvatar,
  type SidebarConfig,
} from '@/components/navigation/app-sidebar'

const menuItems = [
  { href: '/cuenta', label: 'Resumen', icon: LayoutDashboard },
  { href: '/cuenta/pedidos', label: 'Mis Pedidos', icon: Package },
  { href: '/cuenta/perfil', label: 'Mi Perfil', icon: User },
  { href: '/cuenta/direcciones', label: 'Direcciones', icon: MapPin },
]

function isItemActive(pathname: string, href: string) {
  return href === '/cuenta' ? pathname === href : pathname.startsWith(href)
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const fetchAvatar = useCallback(async () => {
    try {
      const res = await fetch('/api/account/profile')
      if (res.ok) {
        const data = await res.json()
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (session?.user) fetchAvatar()
  }, [session, fetchAvatar])

  const userName = session?.user?.firstName || session?.user?.name?.split(' ')[0] || 'Usuario'
  const userEmail = session?.user?.email || ''

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  const sidebarConfig: SidebarConfig = useMemo(
    () => ({
      brand: 'MAAL LINE',
      brandHref: '/',
      items: menuItems,
      isActive: isItemActive,
      user: { name: userName, subtitle: userEmail, avatarUrl, href: '/cuenta/perfil' },
      footerLinks: [{ href: '/', label: 'Volver a la tienda', icon: ChevronLeft }],
      onSignOut: () => signOut({ callbackUrl: '/' }),
    }),
    [userName, userEmail, avatarUrl]
  )

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-4 py-3">
        <div className="relative flex items-center justify-between">
          <button
            ref={mobileTriggerRef}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={isMobileMenuOpen}
            className="p-2 -ml-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-[#111827]">
            MAAL LINE
          </Link>

          {/* Theme toggle + User Menu */}
          <div className="relative flex items-center gap-1.5" ref={userMenuRef}>
            <ThemeToggle
              className="w-9 h-9 rounded-full text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
              iconClassName="w-5 h-5"
            />
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            >
              <SidebarAvatar user={sidebarConfig.user} className="w-8 h-8 text-sm" />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-[#E5E7EB]">
                    <p className="font-semibold text-[#111827] text-sm truncate">{userName}</p>
                    <p className="text-xs text-[#6B7280] truncate">{userEmail}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/cuenta/perfil"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Mi Perfil
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <MobileSidebarSheet
        config={sidebarConfig}
        open={isMobileMenuOpen}
        onClose={closeMobileMenu}
        triggerRef={mobileTriggerRef}
        label="Menú de cuenta"
        layoutPrefix="account-mobile"
      />

      <div className="flex">
        <DesktopSidebar config={sidebarConfig} storageKey="maal-account-sidebar-collapsed" />

        {/* Main Content */}
        <main className="flex-1 min-w-0 min-h-screen">
          {/* Extra bottom padding on mobile so the floating home button never covers content */}
          <div className="p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      <FloatingHomeButton />
    </div>
  )
}
