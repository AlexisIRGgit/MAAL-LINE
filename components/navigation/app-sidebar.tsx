'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion, type Transition } from 'framer-motion'
import { LogOut, X, PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useThemeToggle, ThemeToggleIcon } from '@/components/ui/theme-toggle'
import { useModalA11y } from '@/hooks/use-modal-a11y'
import { UserAvatar } from '@/components/ui/user-avatar'

// Shared sidebar for the customer panel (/cuenta) and the admin panel (/admin):
// a desktop rail that collapses on a spring (button, edge click or Cmd/Ctrl+B) and
// a mobile side sheet, both with animated active/hover pills.

export interface SidebarItem {
  href: string
  label: string
  icon: LucideIcon
}

export interface SidebarUser {
  name: string
  /** Second line under the name (email, role…) */
  subtitle?: string | null
  avatarUrl: string | null
  /** Stable per person (email), seeds the blobatar shown when there's no photo */
  seed: string
  /** Where tapping the user card goes */
  href: string
}

export interface SidebarConfig {
  /** Shown in the header when expanded */
  brand: React.ReactNode
  brandHref: string
  items: SidebarItem[]
  isActive: (pathname: string, href: string) => boolean
  user: SidebarUser
  /** Extra footer links on desktop, e.g. back to the store */
  footerLinks?: SidebarItem[]
  onSignOut: () => void
}

const SIDEBAR_WIDTH = 256
const SIDEBAR_RAIL_WIDTH = 68

// Critically damped so the width settles without overshooting
const widthSpring: Transition = { type: 'spring', stiffness: 380, damping: 35, mass: 0.75 }
const pillSpring: Transition = { type: 'spring', stiffness: 360, damping: 32 }

export function SidebarAvatar({ user, className }: { user: SidebarUser; className?: string }) {
  return <UserAvatar seed={user.seed} name={user.name} avatarUrl={user.avatarUrl} className={className} />
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
  items,
  isActive,
  collapsed,
  layoutPrefix,
  reduceMotion,
  onNavigate,
}: {
  items: SidebarItem[]
  isActive: (pathname: string, href: string) => boolean
  collapsed: boolean
  layoutPrefix: string
  reduceMotion: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? ''
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const transition = reduceMotion ? { duration: 0 } : pillSpring

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden" onMouseLeave={() => setHoveredHref(null)}>
      {items.map((item) => {
        const active = isActive(pathname, item.href)
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
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 h-11 px-3 rounded-xl text-sm transition-colors duration-200 outline-none',
                active
                  ? 'text-white dark:text-[#0A0A0A] font-semibold'
                  : 'text-[#6B7280] hover:text-[#111827] focus-visible:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-white dark:focus-visible:text-white'
              )}
            >
              {active && (
                <motion.span
                  layoutId={`${layoutPrefix}-active`}
                  transition={transition}
                  className="absolute inset-0 rounded-xl bg-[#111827] dark:bg-[#F5F5F5] shadow-sm"
                />
              )}
              <AnimatePresence>
                {isHovered && !active && (
                  <motion.span
                    layoutId={`${layoutPrefix}-hover`}
                    initial={{ opacity: 0, filter: reduceMotion ? 'none' : 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    transition={transition}
                    className="absolute inset-0 rounded-xl bg-[#F3F4F6] dark:bg-white/[0.06] dark:ring-1 dark:ring-white/[0.06]"
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

function DesktopFooter({
  collapsed,
  reduceMotion,
  footerLinks = [],
  onSignOut,
}: {
  collapsed: boolean
  reduceMotion: boolean
  footerLinks?: SidebarItem[]
  onSignOut: () => void
}) {
  const { isDark, toggleTheme } = useThemeToggle()
  const themeLabel = isDark ? 'Modo claro' : 'Modo oscuro'
  const rowClass = 'w-full flex items-center gap-3 h-11 px-3 text-sm text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] rounded-xl transition-colors'

  return (
    <div className="px-3 py-4 border-t border-[#E5E7EB] space-y-1">
      <button
        type="button"
        onClick={(event) => toggleTheme(event.currentTarget)}
        title={collapsed ? themeLabel : undefined}
        aria-label={themeLabel}
        className={rowClass}
      >
        <ThemeToggleIcon isDark={isDark} className="w-5 h-5 flex-shrink-0" />
        <SidebarLabel show={!collapsed} reduceMotion={reduceMotion}>
          {themeLabel}
        </SidebarLabel>
      </button>
      {footerLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          title={collapsed ? link.label : undefined}
          aria-label={collapsed ? link.label : undefined}
          className={rowClass}
        >
          <link.icon className="w-5 h-5 flex-shrink-0" />
          <SidebarLabel show={!collapsed} reduceMotion={reduceMotion}>
            {link.label}
          </SidebarLabel>
        </Link>
      ))}
      <button
        type="button"
        onClick={onSignOut}
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

/** Collapsed state persisted per panel, with Cmd/Ctrl+B to toggle. */
export function useSidebarCollapse(storageKey: string) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)

  // Restore the preference without animating on first paint
  useEffect(() => {
    try {
      setIsCollapsed(localStorage.getItem(storageKey) === 'true')
    } catch {}
    const frame = requestAnimationFrame(() => setHasHydrated(true))
    return () => cancelAnimationFrame(frame)
  }, [storageKey])

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(storageKey, String(next))
      } catch {}
      return next
    })
  }, [storageKey])

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

  return { isCollapsed, hasHydrated, toggleCollapsed }
}

export function DesktopSidebar({
  config,
  storageKey,
}: {
  config: SidebarConfig
  storageKey: string
}) {
  const reduceMotion = useReducedMotion() ?? false
  const { isCollapsed, hasHydrated, toggleCollapsed } = useSidebarCollapse(storageKey)

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? SIDEBAR_RAIL_WIDTH : SIDEBAR_WIDTH }}
      transition={hasHydrated && !reduceMotion ? widthSpring : { duration: 0 }}
      className="hidden lg:flex flex-col h-screen bg-white border-r border-[#E5E7EB] sticky top-0 flex-shrink-0 overflow-hidden"
    >
      {/* Brand + Toggle */}
      <div className="h-16 flex items-center px-3 border-b border-[#E5E7EB]">
        <Link href={config.brandHref} className="pl-3 text-xl font-bold text-[#111827]">
          <SidebarLabel show={!isCollapsed} reduceMotion={reduceMotion} className="block">
            {config.brand}
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

      {/* User */}
      <div className="px-3 py-4 border-b border-[#E5E7EB]">
        <Link
          href={config.user.href}
          title={isCollapsed ? config.user.name : undefined}
          className="flex items-center gap-3 p-1 rounded-xl hover:bg-[#F3F4F6] transition-colors"
        >
          <SidebarAvatar user={config.user} className="w-9 h-9 text-sm" />
          <SidebarLabel show={!isCollapsed} reduceMotion={reduceMotion} className="min-w-0 flex-1">
            <span className="block font-semibold text-[#111827] text-sm truncate">{config.user.name}</span>
            {config.user.subtitle && <span className="block text-xs text-[#6B7280] truncate">{config.user.subtitle}</span>}
          </SidebarLabel>
        </Link>
      </div>

      <SidebarNav
        items={config.items}
        isActive={config.isActive}
        collapsed={isCollapsed}
        layoutPrefix={`${storageKey}-desktop`}
        reduceMotion={reduceMotion}
      />
      <DesktopFooter
        collapsed={isCollapsed}
        reduceMotion={reduceMotion}
        footerLinks={config.footerLinks}
        onSignOut={config.onSignOut}
      />

      {/* Rail: click the edge to toggle */}
      <button
        onClick={toggleCollapsed}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute top-0 right-0 h-full w-1.5 cursor-ew-resize after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-transparent hover:after:bg-[#D1D5DB] after:transition-colors"
      />
    </motion.aside>
  )
}

/** Mobile side sheet. Keeps only a red sign-out button in the footer. */
export function MobileSidebarSheet({
  config,
  open,
  onClose,
  triggerRef,
  label,
  layoutPrefix,
}: {
  config: SidebarConfig
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement | null>
  label: string
  layoutPrefix: string
}) {
  const reduceMotion = useReducedMotion() ?? false
  const panelRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname() ?? ''
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useModalA11y({ open, panelRef, onClose, returnFocusRef: triggerRef })

  // Close when navigation happens
  const lastPathname = useRef(pathname)
  useEffect(() => {
    if (lastPathname.current !== pathname && open) onClose()
    lastPathname.current = pathname
  }, [pathname, open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[300] bg-black/40 lg:hidden"
          />
          <motion.aside
            key="sheet"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            initial={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
            transition={reduceMotion ? { duration: 0.1 } : { type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed left-0 top-0 bottom-0 z-[300] w-72 max-w-[88vw] bg-white shadow-xl outline-none lg:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="h-16 px-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <Link href={config.brandHref} onClick={onClose} className="text-xl font-bold text-[#111827]">
                  {config.brand}
                </Link>
                <button
                  onClick={onClose}
                  aria-label="Cerrar menú"
                  className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-[#E5E7EB]">
                <Link href={config.user.href} onClick={onClose} className="flex items-center gap-3 rounded-xl p-1 -m-1 hover:bg-[#F3F4F6] transition-colors">
                  <SidebarAvatar user={config.user} className="w-12 h-12 text-lg" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#111827] truncate">{config.user.name}</p>
                    {config.user.subtitle && <p className="text-sm text-[#6B7280] truncate">{config.user.subtitle}</p>}
                  </div>
                </Link>
              </div>

              <SidebarNav
                items={config.items}
                isActive={config.isActive}
                collapsed={false}
                layoutPrefix={layoutPrefix}
                reduceMotion={reduceMotion}
                onNavigate={onClose}
              />

              <div className="p-4 border-t border-[#E5E7EB]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
                <button
                  onClick={config.onSignOut}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-[0.98] transition-[background-color,transform]"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
