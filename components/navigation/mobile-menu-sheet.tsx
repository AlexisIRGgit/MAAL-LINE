'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, LogOut, LogIn, Sparkles, Dumbbell, Footprints, LayoutGrid, Heart, User, type LucideIcon } from 'lucide-react'
import { Logo } from '@/components/common/logo'
import { cn } from '@/lib/utils/cn'
import { useModalA11y } from '@/hooks/use-modal-a11y'

interface MenuLink {
  href: string
  label: string
  icon: LucideIcon
}

// Same look as the account panel's mobile sheet (app/cuenta/layout.tsx)
const STORE_LINKS: MenuLink[] = [
  { href: '/coleccion', label: 'Todo el equipo', icon: LayoutGrid },
  { href: '/coleccion?q=strap', label: 'Lifting Straps', icon: Dumbbell },
  { href: '/coleccion?q=chaleco', label: 'Chalecos de running', icon: Footprints },
  { href: '/drop', label: 'Drop 001 · Pronto', icon: Sparkles },
]

const pillSpring = { type: 'spring', stiffness: 360, damping: 32 } as const

function MenuLinks({
  links,
  pathname,
  layoutPrefix,
  reduceMotion,
  onNavigate,
}: {
  links: MenuLink[]
  pathname: string
  layoutPrefix: string
  reduceMotion: boolean
  onNavigate: () => void
}) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const transition = reduceMotion ? { duration: 0 } : pillSpring

  return (
    <div className="space-y-1" onMouseLeave={() => setHoveredHref(null)}>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <motion.div key={link.href} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Link
              href={link.href}
              onClick={onNavigate}
              onMouseEnter={() => setHoveredHref(link.href)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 h-12 px-4 rounded-xl transition-colors',
                isActive
                  ? 'text-white dark:text-[#0A0A0A] font-semibold'
                  : 'text-[#6B7280] hover:text-[#111827] dark:text-[#9CA3AF] dark:hover:text-white'
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
                {hoveredHref === link.href && !isActive && (
                  <motion.span
                    layoutId={`${layoutPrefix}-hover`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    transition={transition}
                    className="absolute inset-0 rounded-xl bg-[#F3F4F6] dark:bg-white/[0.06]"
                  />
                )}
              </AnimatePresence>
              <link.icon className="relative w-5 h-5 flex-shrink-0" />
              <span className="relative">{link.label}</span>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}

export function MobileMenuSheet({
  open,
  onClose,
  triggerRef,
  user,
  avatar,
  onSignIn,
  onSignOut,
}: {
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement | null>
  user: { name: string; email?: string | null } | null
  avatar?: React.ReactNode
  onSignIn: () => void
  onSignOut: () => void
}) {
  const reduceMotion = useReducedMotion() ?? false
  const pathname = usePathname() ?? ''
  const panelRef = useRef<HTMLDivElement>(null)
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
            aria-label="Menú"
            tabIndex={-1}
            initial={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
            transition={reduceMotion ? { duration: 0.1 } : { type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed left-0 top-0 bottom-0 z-[300] w-72 max-w-[88vw] bg-white shadow-xl outline-none lg:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="h-16 px-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <Link href="/" onClick={onClose} aria-label="Inicio">
                  <Logo size="xs" />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar menú"
                  className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User */}
              <div className="p-4 border-b border-[#E5E7EB]">
                {user ? (
                  <Link href="/cuenta" onClick={onClose} className="flex items-center gap-3 rounded-xl p-1 -m-1 hover:bg-[#F3F4F6] transition-colors">
                    {avatar}
                    <div className="min-w-0">
                      <p className="font-semibold text-[#111827] truncate">{user.name}</p>
                      {user.email && <p className="text-sm text-[#6B7280] truncate">{user.email}</p>}
                    </div>
                  </Link>
                ) : (
                  <div>
                    <p className="font-semibold text-[#111827]">Bienvenido a MAAL</p>
                    <p className="text-sm text-[#6B7280]">Inicia sesión para ver tus pedidos</p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-4">
                <MenuLinks links={STORE_LINKS} pathname={pathname} layoutPrefix="store-menu" reduceMotion={reduceMotion} onNavigate={onClose} />
                <div className="border-t border-[#E5E7EB] pt-4">
                  <MenuLinks
                    links={[
                      { href: '/wishlist', label: 'Lista de deseos', icon: Heart },
                      ...(user ? [{ href: '/cuenta', label: 'Mi cuenta', icon: User }] : []),
                    ]}
                    pathname={pathname}
                    layoutPrefix="store-menu-account"
                    reduceMotion={reduceMotion}
                    onNavigate={onClose}
                  />
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-[#E5E7EB]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
                {user ? (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:scale-[0.98] transition-[background-color,transform]"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-[#1F2937] active:scale-[0.98] transition-[background-color,transform]"
                  >
                    <LogIn className="w-5 h-5" />
                    Iniciar sesión
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
