'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, Heart, X, Loader2, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from '@/components/common/logo'
import { useCartStore, selectCartItems } from '@/lib/store/cart-store'
import { useAuthModalStore } from '@/lib/store/auth-modal-store'
import { cn } from '@/lib/utils/cn'

const NAV_LINKS = [
  { href: '/drops', label: 'NEW DROPS', highlight: true },
  { href: '/restocks', label: 'RESTOCKS' },
  { href: '/best-sellers', label: 'BEST SELLERS' },
  { href: '/coleccion', label: 'SHOP ALL' },
  { href: '/lookbook', label: 'LOOKBOOK' },
]

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  images: { url: string; altText: string | null }[]
  category: { name: string } | null
}

function UserAvatar({ firstName, lastName, avatarUrl, size = 32 }: {
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  size?: number
}) {
  const [imgError, setImgError] = useState(false)
  const initials = `${(firstName ?? '')[0] ?? ''}${(lastName ?? '')[0] ?? ''}`.toUpperCase() || '?'

  if (avatarUrl && !imgError) {
    // Use <img> for data URIs, next/image for external URLs
    const isDataUri = avatarUrl.startsWith('data:')
    return (
      <div
        className="relative rounded-full overflow-hidden flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {isDataUri ? (
          <img
            src={avatarUrl}
            alt={`${firstName ?? ''} ${lastName ?? ''}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <Image
            src={avatarUrl}
            alt={`${firstName ?? ''} ${lastName ?? ''}`}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    )
  }

  return (
    <div
      className="rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="text-xs font-semibold text-[#374151]">{initials}</span>
    </div>
  )
}

interface WishlistDropdownItem {
  wishlistId: string
  addedAt: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice: number | null
    image: string | null
  }
}

export function Navbar() {
  const { data: session } = useSession()
  const [freshAvatarUrl, setFreshAvatarUrl] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const openCart = useCartStore((state) => state.openCart)
  const items = useCartStore(selectCartItems)
  const openAuthModal = useAuthModalStore((state) => state.openAuthModal)

  // Memoize itemCount to avoid recalculating on unrelated re-renders
  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  )

  // ─── Search state ───
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchQueried, setSearchQueried] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const openSearch = useCallback(() => {
    setSearchOpen(true)
  }, [])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
    setSearchQueried(false)
  }, [])

  // Fetch fresh avatar from DB (prioritizes custom over Google OAuth)
  useEffect(() => {
    if (!session?.user) return
    fetch('/api/account/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.avatarUrl) setFreshAvatarUrl(data.avatarUrl)
      })
      .catch(() => {})
  }, [session?.user])

  // Resolved avatar: fresh DB avatar > session avatar
  const resolvedAvatarUrl = freshAvatarUrl || session?.user?.avatarUrl || null

  // Auto-focus input when search opens (small delay so element is visible)
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [searchOpen])

  // Escape key to close search
  useEffect(() => {
    if (!searchOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen, closeSearch])

  // Click outside to close search
  useEffect(() => {
    if (!searchOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen, closeSearch])

  // Debounced search API call
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setSearchQueried(false)
      setSearchLoading(false)
      return
    }

    setSearchLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const data = await res.json() as { products: SearchResult[] }
          setSearchResults(data.products)
          setSearchQueried(true)
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery])

  // Profile dropdown hover state (desktop only)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileDropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const openProfileDropdown = useCallback(() => {
    if (profileDropdownTimeout.current) {
      clearTimeout(profileDropdownTimeout.current)
      profileDropdownTimeout.current = null
    }
    setProfileDropdownOpen(true)
  }, [])

  const closeProfileDropdown = useCallback(() => {
    profileDropdownTimeout.current = setTimeout(() => {
      setProfileDropdownOpen(false)
    }, 150)
  }, [])

  // Wishlist dropdown hover state (desktop only)
  const [wishlistDropdownOpen, setWishlistDropdownOpen] = useState(false)
  const wishlistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [wishlistItems, setWishlistItems] = useState<WishlistDropdownItem[]>([])
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const fetchWishlistItems = useCallback(async () => {
    if (!session) return
    setWishlistLoading(true)
    try {
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json() as { items: WishlistDropdownItem[] }
        setWishlistItems(data.items)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setWishlistLoading(false)
    }
  }, [session])

  const openWishlistDropdown = useCallback(() => {
    if (wishlistTimeoutRef.current) {
      clearTimeout(wishlistTimeoutRef.current)
      wishlistTimeoutRef.current = null
    }
    setWishlistDropdownOpen(true)
    fetchWishlistItems()
  }, [fetchWishlistItems])

  const closeWishlistDropdown = useCallback(() => {
    wishlistTimeoutRef.current = setTimeout(() => {
      setWishlistDropdownOpen(false)
    }, 150)
  }, [])

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
      if (response.ok) {
        setWishlistItems((prev) => prev.filter((item) => item.product.id !== productId))
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }, [])

  const formatPrice = useCallback((value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }, [])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
        <nav className="container mx-auto px-4 h-20 flex items-center justify-between relative">
          {/* Left - Mobile Menu + Logo */}
          <div className="flex items-center gap-6 z-20">
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 -ml-2 text-[#111827] hover:text-[#6B7280] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menu"
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
          <div className="hidden lg:flex items-center gap-10 flex-1 justify-center relative">
            {/* Nav links - fade out when search is open */}
            <AnimatePresence>
              {!searchOpen && (
                <motion.div
                  className="flex items-center gap-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {NAV_LINKS.map(({ href, label, highlight }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300',
                        highlight
                          ? 'text-[#111827] hover:text-[#6B7280]'
                          : 'text-[#6B7280] hover:text-[#111827]'
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search bar overlay - expands from right to left */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  ref={searchContainerRef}
                  className="absolute top-0 bottom-0 right-0 flex items-center z-10 ml-10"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'calc(100% - 40px)', opacity: 1, overflow: 'visible' }}
                  exit={{ width: 0, opacity: 0, overflow: 'hidden' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  style={{ transformOrigin: 'right center' }}
                >
                  <div className="relative w-full min-w-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 focus:shadow-none text-sm"
                    />
                    <button
                      onClick={closeSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Cerrar busqueda"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Search results dropdown */}
                    {searchQuery.length >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[400px] overflow-y-auto"
                      >
                        {searchLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                          </div>
                        ) : searchQueried && searchResults.length === 0 ? (
                          <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-gray-500">No se encontraron productos</p>
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div>
                            {searchResults.map((product, index) => (
                              <Link
                                key={product.id}
                                href={`/producto/${product.slug}`}
                                onClick={closeSearch}
                                className={cn(
                                  'flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
                                  index < searchResults.length - 1 && 'border-b border-gray-50'
                                )}
                              >
                                {/* Thumbnail */}
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                  {product.images[0] ? (
                                    <Image
                                      src={product.images[0].url}
                                      alt={product.images[0].altText ?? product.name}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Search className="w-4 h-4 text-gray-300" />
                                    </div>
                                  )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      {formatPrice(product.price)}
                                    </span>
                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                      <span className="text-xs text-gray-400 line-through">
                                        {formatPrice(product.compareAtPrice)}
                                      </span>
                                    )}
                                    {product.category && (
                                      <span className="text-xs text-gray-400">
                                        {product.category.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-4 z-20">
            {/* Search */}
            <button
              className={cn(
                'hidden lg:block p-2 transition-colors',
                searchOpen
                  ? 'text-[#111827]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              )}
              onClick={searchOpen ? closeSearch : openSearch}
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile search - unchanged icon */}
            <button
              className="lg:hidden p-2 text-[#6B7280] hover:text-[#111827] transition-colors"
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Wishlist - Desktop dropdown */}
            <div
              className="relative hidden md:block"
              onMouseEnter={openWishlistDropdown}
              onMouseLeave={closeWishlistDropdown}
            >
              <button
                className={cn(
                  'p-2 transition-colors',
                  wishlistDropdownOpen
                    ? 'bg-white rounded-t-2xl rounded-b-none shadow-xl text-[#111827]'
                    : 'text-[#6B7280] hover:text-[#111827] rounded-xl hover:bg-[#F3F4F6]'
                )}
                aria-label="Lista de deseos"
              >
                <Heart className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {wishlistDropdownOpen && (
                  <motion.div
                    className="absolute top-full right-0 w-80 bg-white rounded-b-2xl rounded-tl-2xl shadow-xl z-50 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
                    transition={{
                      type: 'spring',
                      damping: 20,
                      stiffness: 200,
                      mass: 0.8,
                      opacity: { duration: 0.15 },
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">Lista de deseos</span>
                        {wishlistItems.length > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-600 rounded-full">
                            {wishlistItems.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    {wishlistLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      </div>
                    ) : !session ? (
                      <div className="flex flex-col items-center py-8 px-4">
                        <Heart className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">Inicia sesion para ver tu lista</p>
                      </div>
                    ) : wishlistItems.length === 0 ? (
                      <div className="flex flex-col items-center py-8 px-4">
                        <Heart className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">Tu lista esta vacia</p>
                      </div>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto">
                        {wishlistItems.map((item, index) => (
                          <Link
                            key={item.wishlistId}
                            href={`/producto/${item.product.slug}`}
                            className={cn(
                              'flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors',
                              index < wishlistItems.length - 1 && 'border-b border-gray-50'
                            )}
                          >
                            {/* Thumbnail */}
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {item.product.image ? (
                                <Image
                                  src={item.product.image}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Heart className="w-4 h-4 text-gray-300" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatPrice(item.product.price)}
                              </p>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                removeFromWishlist(item.product.id)
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                              aria-label="Eliminar de la lista"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="border-t border-gray-100">
                      <Link
                        href="/wishlist"
                        className="block text-sm text-center text-[#FF3D00] hover:text-[#E63600] font-medium px-4 py-3 hover:bg-gray-50 transition-colors rounded-b-2xl"
                      >
                        Ver lista completa
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account */}
            {session ? (
              <div
                ref={profileRef}
                className="relative hidden md:block -mr-2"
                onMouseEnter={openProfileDropdown}
                onMouseLeave={closeProfileDropdown}
              >
                {/* Profile button - STAYS IN FLOW, never moves */}
                <Link
                  href="/cuenta"
                  className={cn(
                    'flex items-center gap-2 py-1.5 px-4 transition-colors',
                    profileDropdownOpen
                      ? 'bg-white hover:bg-[#F3F4F6] rounded-t-2xl rounded-b-none shadow-xl'
                      : 'rounded-xl hover:bg-[#F3F4F6]'
                  )}
                  aria-label="Mi cuenta"
                >
                  {/* Name + Status */}
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      'text-xs font-medium leading-tight transition-colors',
                      profileDropdownOpen ? 'text-gray-900' : 'text-[#111827]'
                    )}>
                      {session.user.firstName ?? 'Mi cuenta'}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className={cn(
                        'text-[10px] leading-tight transition-colors',
                        profileDropdownOpen ? 'text-gray-500' : 'text-[#9CA3AF]'
                      )}>
                        Cuenta
                      </span>
                    </span>
                  </div>
                  {/* Avatar */}
                  <UserAvatar
                    firstName={session.user.firstName}
                    lastName={session.user.lastName}
                    avatarUrl={resolvedAvatarUrl}
                    size={32}
                  />
                </Link>

                {/* Dropdown - ABSOLUTE, below the button, outside flow */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      className="absolute top-full left-0 w-full bg-white rounded-b-2xl shadow-xl z-50 overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
                      transition={{
                        type: 'spring',
                        damping: 20,
                        stiffness: 200,
                        mass: 0.8,
                        opacity: { duration: 0.15 },
                      }}
                    >
                      <div className="border-t border-gray-100 mx-2" />
                      <button
                        onClick={() => signOut()}
                        className={cn(
                          'flex items-center justify-center gap-2 w-full px-5 py-2 text-xs font-medium text-red-500',
                          'hover:bg-red-50 rounded-b-2xl transition-colors cursor-pointer whitespace-nowrap'
                        )}
                      >
                        <LogOut size={14} className="flex-shrink-0" />
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0.05 } }}
                          transition={{ delay: 0.1, duration: 0.15 }}
                        >
                          Cerrar sesion
                        </motion.span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="hidden md:block p-2 text-[#6B7280] hover:text-[#111827] transition-colors"
                aria-label="Iniciar sesion"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-[#6B7280] hover:text-[#111827] transition-colors"
              aria-label="Carrito"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#111827] text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E7EB] bg-white">
            <div className="container mx-auto px-4 py-6 space-y-4">
              {NAV_LINKS.map(({ href, label, highlight }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'block text-sm font-bold tracking-[0.15em] uppercase',
                    highlight ? 'text-[#111827]' : 'text-[#6B7280]'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {/* Account & Wishlist links in mobile */}
              <div className="pt-4 border-t border-[#E5E7EB] space-y-4">
                <Link
                  href="/wishlist"
                  className="block text-sm font-bold tracking-[0.15em] uppercase text-[#6B7280]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  LISTA DE DESEOS
                </Link>
                {session ? (
                  <Link
                    href="/cuenta"
                    className="flex items-center gap-3"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserAvatar
                      firstName={session.user.firstName}
                      lastName={session.user.lastName}
                      avatarUrl={resolvedAvatarUrl}
                      size={36}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-[0.05em] text-[#111827]">
                        {session.user.firstName ?? 'Mi cuenta'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-xs text-[#9CA3AF]">Cuenta</span>
                      </span>
                    </div>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      openAuthModal()
                    }}
                    className="block text-sm font-bold tracking-[0.15em] uppercase text-[#6B7280]"
                  >
                    INICIAR SESION
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
