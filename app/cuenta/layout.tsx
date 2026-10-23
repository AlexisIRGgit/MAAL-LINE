'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  User,
  MapPin,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useThemeToggle, ThemeToggleIcon } from '@/components/ui/theme-toggle'

interface MenuItem {
  href: string
  label: string
  icon: LucideIcon
}

const menuItems: MenuItem[] = [
  { href: '/cuenta', label: 'Resumen', icon: LayoutDashboard },
  { href: '/cuenta/pedidos', label: 'Mis Pedidos', icon: Package },
  { href: '/cuenta/perfil', label: 'Mi Perfil', icon: User },
  { href: '/cuenta/direcciones', label: 'Direcciones', icon: MapPin },
]

const SIDEBAR_WIDTH = 256
const SIDEBAR_RAIL_WIDTH = 68
const COLLAPSED_STORAGE_KEY = 'maal-account-sidebar-collapsed'

// Critically damped so the width settles without overshooting
const widthSpring: Transition = { type: 'spring', stiffness: 380, damping: 35, mass: 0.75 }
const pillSpring: Transition = { type: 'spring', stiffness: 360, damping: 32 }

function isItemActive(pathname: string, href: string) {
  return href === '/cuenta' ? pathname === href : pathname.startsWith(href)
}

function Avatar({
  avatarUrl,
  name,
  initial,
  className,
}: {
  avatarUrl: string | null
  name: string
  initial: string
  className?: string
}) {
  return (
    <div className={cn('rounded-full overflow-hidden flex-shrink-0', className)}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#111827] to-[#374151] flex items-center justify-center text-white font-bold">
          {initial}
        </div>
      )}
    </div>
  )
}

// Fades labels in after the width has started opening, and out quickly when closing
function SidebarLabel({
  show,
  reduceMotion,
  className,
  children,
}: {
  show: boolean
  reduceMotion: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.span
          initial={{ opacity: 0, x: reduceMotion ? 0 : -6 }}
          animate={{
            opacity: 1,
            x: 0,
            transition: { duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : 0.08 },
          }}
          exit={{ opacity: 0, x: reduceMotion ? 0 : -6, transition: { duration: reduceMotion ? 0 : 0.12 } }}
          className={cn('whitespace-nowrap overflow-hidden', className)}
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

function SidebarNav({
  pathname,
  collapsed,
  layoutPrefix,
  reduceMotion,
  onNavigate,
}: {
  pathname: string
  collapsed: boolean
  layoutPrefix: string
  reduceMotion: boolean
  onNavigate?: () => void
}) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const transition = reduceMotion ? { duration: 0 } : pillSpring

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden" onMouseLeave={() => setHoveredHref(null)}>
      {menuItems.map((item) => {
        const isActive = isItemActive(pathname, item.href)
        const isHovered = hoveredHref === item.href

        return (
          <motion.div key={item.href} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Link
              href={item.href}
              onClick={onNavigate}
              onMouseEnter={() => setHoveredHref(item.href)}
              onFocus={() => setHoveredHref(item.href)}
              onBlur={() => setHoveredHref(null)}
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 h-11 px-3 rounded-xl text-sm transition-colors duration-200 outline-none',
                isActive ? 'text-white dark:text-[#0A0A0A] font-semibold' : 'text-[#6B7280] hover:text-[#111827] focus-visible:text-[#111827]'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={`${layoutPrefix}-active`}
                  transition={transition}
                  className="absolute inset-0 rounded-xl bg-[#111827] dark:bg-[#F5F5F5] shadow-sm"
                />
              )}
              <AnimatePresence>
                {isHovered && !isActive && (
                  <motion.span
                    layoutId={`${layoutPrefix}-hover`}
                    initial={{ opacity: 0, filter: reduceMotion ? 'none' : 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    transition={transition}
                    className="absolute inset-0 rounded-xl bg-[#F3F4F6]"
                  />
                )}
              </AnimatePresence>
              <item.icon className="relative w-5 h-5 flex-shrink-0" />
              <SidebarLabel show={!collapsed} reduceMotion={reduceMotion} className="relative">
                {item.label}
              </SidebarLabel>
            </Link>
          </motion.div>
        )
      })}
    </nav>
  )
}

function SidebarFooter({
  collapsed,
  reduceMotion,
  onNavigate,
}: {
  collapsed: boolean
  reduceMotion: boolean
  onNavigate?: () => void
}) {
  const { isDark, toggleTheme } = useThemeToggle()
  const themeLabel = isDark ? 'Modo claro' : 'Modo oscuro'

  return (
    <div className="px-3 py-4 border-t border-[#E5E7EB] space-y-1">
      <button
        type="button"
        onClick={(event) => toggleTheme(event.currentTarget)}
        title={collapsed ? themeLabel : undefined}
        aria-label={themeLabel}
        className="w-full flex items-center gap-3 h-11 px-3 text-sm text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] rounded-xl transition-colors"
      >
        <ThemeToggleIcon isDark={isDark} className="w-5 h-5 flex-shrink-0" />
        <SidebarLabel show={!collapsed} reduceMotion={reduceMotion}>
          {themeLabel}
        </SidebarLabel>
      </button>
      <Link
        href="/"
        onClick={onNavigate}
        title={collapsed ? 'Volver a la tienda' : undefined}
        aria-label={collapsed ? 'Volver a la tienda' : undefined}
        className="flex items-center gap-3 h-11 px-3 text-sm text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] rounded-xl transition-colors"
      >
        <ChevronLeft className="w-5 h-5 flex-shrink-0" />
        <SidebarLabel show={!collapsed} reduceMotion={reduceMotion}>
          Volver a la tienda
        </SidebarLabel>
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        title={collapsed ? 'Cerrar sesión' : undefined}
        aria-label={collapsed ? 'Cerrar sesión' : undefined}
        className="w-full flex items-center gap-3 h-11 px-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
      >
        <LogOut className="w-5 h-5 flex-shrink-0" />
        <SidebarLabel show={!collapsed} reduceMotion={reduceMotion}>
          Cerrar sesión
        </SidebarLabel>
      </button>
    </div>
  )
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const reduceMotion = useReducedMotion() ?? false
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)
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

  // Restore collapsed preference without animating on first paint
  useEffect(() => {
    try {
      setIsCollapsed(localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true')
    } catch {}
    const frame = requestAnimationFrame(() => setHasHydrated(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next))
      } catch {}
      return next
    })
  }, [])

  // Cmd/Ctrl + B toggles the desktop sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'b' || !(event.metaKey || event.ctrlKey)) return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, [contenteditable="true"]')) return
      event.preventDefault()
      toggleCollapsed()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleCollapsed])

  // Mobile sheet: Escape closes, body scroll is locked, focus returns to the trigger
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const trigger = mobileTriggerRef.current
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      trigger?.focus()
    }
  }, [isMobileMenuOpen])

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
  const userInitial = userName.charAt(0).toUpperCase()

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#E5E7EB] px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            ref={mobileTriggerRef}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={isMobileMenuOpen}
            className="p-2 -ml-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="text-lg font-bold text-[#111827]">
            MAAL LINE
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            >
              <Avatar avatarUrl={avatarUrl} name={userName} initial={userInitial} className="w-8 h-8 text-sm" />
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

      {/* Mobile Menu Sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menú de cuenta"
              initial={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
              animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
              transition={reduceMotion ? { duration: 0.1 } : { type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-0 w-72 max-w-[88vw] bg-white z-50 lg:hidden shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="h-16 px-4 border-b border-[#E5E7EB] flex items-center justify-between">
                  <Link href="/" className="text-xl font-bold text-[#111827]">
                    MAAL LINE
                  </Link>
                  <button
                    onClick={closeMobileMenu}
                    aria-label="Cerrar menú"
                    autoFocus
                    className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <Avatar avatarUrl={avatarUrl} name={userName} initial={userInitial} className="w-12 h-12 text-lg" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#111827] truncate">{userName}</p>
                      <p className="text-sm text-[#6B7280] truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>

                <SidebarNav
                  pathname={pathname}
                  collapsed={false}
                  layoutPrefix="mobile-nav"
                  reduceMotion={reduceMotion}
                  onNavigate={closeMobileMenu}
                />
                <SidebarFooter collapsed={false} reduceMotion={reduceMotion} onNavigate={closeMobileMenu} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: isCollapsed ? SIDEBAR_RAIL_WIDTH : SIDEBAR_WIDTH }}
          transition={hasHydrated && !reduceMotion ? widthSpring : { duration: 0 }}
          className="hidden lg:flex flex-col h-screen bg-white border-r border-[#E5E7EB] sticky top-0 flex-shrink-0 overflow-hidden"
        >
          {/* Logo + Toggle */}
          <div className="h-16 flex items-center px-3 border-b border-[#E5E7EB]">
            <Link href="/" className="pl-3 text-xl font-bold text-[#111827]">
              <SidebarLabel show={!isCollapsed} reduceMotion={reduceMotion}>
                MAAL LINE
              </SidebarLabel>
            </Link>
            <button
              onClick={toggleCollapsed}
              aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
              aria-expanded={!isCollapsed}
              title={`${isCollapsed ? 'Expandir' : 'Colapsar'} (⌘B)`}
              className={cn(
                'w-11 h-11 flex items-center justify-center flex-shrink-0 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors',
                isCollapsed ? '-ml-3' : 'ml-auto'
              )}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>

          {/* User Info */}
          <div className="px-3 py-4 border-b border-[#E5E7EB]">
            <Link
              href="/cuenta/perfil"
              title={isCollapsed ? userName : undefined}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-[#F3F4F6] transition-colors"
            >
              <Avatar avatarUrl={avatarUrl} name={userName} initial={userInitial} className="w-9 h-9 text-sm" />
              <SidebarLabel show={!isCollapsed} reduceMotion={reduceMotion} className="min-w-0 flex-1">
                <span className="block font-semibold text-[#111827] text-sm truncate">{userName}</span>
                <span className="block text-xs text-[#6B7280] truncate">{userEmail}</span>
              </SidebarLabel>
            </Link>
          </div>

          <SidebarNav
            pathname={pathname}
            collapsed={isCollapsed}
            layoutPrefix="desktop-nav"
            reduceMotion={reduceMotion}
          />
          <SidebarFooter collapsed={isCollapsed} reduceMotion={reduceMotion} />

          {/* Rail: click the edge to toggle */}
          <button
            onClick={toggleCollapsed}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute top-0 right-0 h-full w-1.5 cursor-ew-resize after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-transparent hover:after:bg-[#D1D5DB] after:transition-colors"
          />
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
