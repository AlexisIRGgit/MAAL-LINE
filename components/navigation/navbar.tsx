'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Logo } from '@/components/common/logo'
import { useCartStore } from '@/lib/store/cart-store'
import { cn } from '@/lib/utils/cn'

const NAV_LINKS = [
  { href: '/drops', label: 'NEW DROPS', highlight: true },
  { href: '/restocks', label: 'RESTOCKS' },
  { href: '/best-sellers', label: 'BEST SELLERS' },
  { href: '/coleccion', label: 'SHOP ALL' },
  { href: '/lookbook', label: 'LOOKBOOK' },
]

export function Navbar() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { openCart, itemCount } = useCartStore()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 glass-dark border-b border-[#E8E4D9]/10">
        <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Left - Mobile Menu + Logo */}
          <div className="flex items-center gap-6">
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 -ml-2 text-[#E8E4D9] hover:text-[#E8E4D9]/70 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo size="xs" />
            </Link>
          </div>

          {/* Center - Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map(({ href, label, highlight }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300',
                  highlight
                    ? 'text-[#E8E4D9] hover:text-[#C9A962]'
                    : 'text-[#E8E4D9]/70 hover:text-[#E8E4D9]'
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button
              className="p-2 text-[#E8E4D9]/70 hover:text-[#E8E4D9] transition-colors"
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Account */}
            <Link
              href={session ? '/cuenta' : '/login'}
              className="hidden md:block p-2 text-[#E8E4D9]/70 hover:text-[#E8E4D9] transition-colors"
              aria-label={session ? 'Mi cuenta' : 'Iniciar sesión'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-[#E8E4D9]/70 hover:text-[#E8E4D9] transition-colors"
              aria-label="Carrito"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E8E4D9] text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8E4D9]/10 bg-[#0A0A0A]">
            <div className="container mx-auto px-4 py-6 space-y-4">
              {NAV_LINKS.map(({ href, label, highlight }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'block text-sm font-bold tracking-[0.15em] uppercase',
                    highlight ? 'text-[#E8E4D9]' : 'text-[#E8E4D9]/70'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {/* Account link in mobile */}
              <div className="pt-4 border-t border-[#E8E4D9]/10">
                <Link
                  href={session ? '/cuenta' : '/login'}
                  className="block text-sm font-bold tracking-[0.15em] uppercase text-[#E8E4D9]/70"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {session ? 'MI CUENTA' : 'INICIAR SESIÓN'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
