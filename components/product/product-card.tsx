'use client'

// Styled after uiarc.dev/components/card: the card lifts on a spring, the photo drifts in slowly,
// and a footer holds the price and the action. Clicking anywhere opens the quick view.
import Image from 'next/image'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ShoppingBag, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useQuickViewStore } from '@/lib/store/quick-view-store'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  compareAtPrice?: number
  images: string[]
  isNew?: boolean
  isRestock?: boolean
  isBestSeller?: boolean
  isSoldOut?: boolean
  sizes: string[]
  category?: string
}

interface ProductCardProps {
  product: Product
  priority?: boolean
  variant?: 'dark' | 'light'
}

/** Presses and lifts: settles fast and never overshoots */
const SPRING_SNAPPY = { type: 'spring', visualDuration: 0.26, bounce: 0 } as const
const EASE_STANDARD = [0.22, 1, 0.36, 1] as const
/** The photo drifts in slowly while pointed at, and eases back a little faster */
const ZOOM = 1.04
const ZOOM_IN = { duration: 0.96, ease: EASE_STANDARD }
const ZOOM_OUT = { duration: 0.48, ease: EASE_STANDARD }

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(value)

export function ProductCard({ product, priority = false, variant = 'light' }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [hovered, setHovered] = useState(false)
  const reduced = useReducedMotion() ?? false
  const openQuickView = useQuickViewStore((state) => state.openQuickView)

  const { id, slug, name, price, compareAtPrice, images, isNew, isRestock, isBestSeller, isSoldOut, sizes, category } = product

  const hasDiscount = compareAtPrice && compareAtPrice > price
  const discountPercent = hasDiscount ? Math.round((1 - price / compareAtPrice) * 100) : 0
  const isDark = variant === 'dark'

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openQuickView({ id, slug, name, price, compareAtPrice, images, sizes, category, isNew, isBestSeller, isRestock, isSoldOut })
  }

  const sizeLine = sizes.length > 0 ? `Tallas ${sizes.slice(0, 5).join(' · ')}${sizes.length > 5 ? ` +${sizes.length - 5}` : ''}` : null

  return (
    <motion.article
      data-hover={hovered || undefined}
      whileHover={reduced ? undefined : { y: -2 }}
      transition={SPRING_SNAPPY}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleOpenQuickView}
      className={cn(
        // isolate keeps the rounded clip on the photo while the card lifts on its own layer (Safari)
        'group relative isolate flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-[22px] border transition-[border-color,box-shadow] duration-300',
        isDark
          ? 'border-[#2A2A2A] bg-[#1A1A1A] data-[hover]:border-[#3A3A3A]'
          : 'border-[#E5E7EB] bg-white data-[hover]:border-[#D1D5DB]',
        'data-[hover]:shadow-[0_18px_40px_-20px_rgba(17,24,39,0.35)] dark:data-[hover]:shadow-[0_18px_40px_-16px_rgba(0,0,0,0.7)]'
      )}
    >
      {/* Media */}
      <div className={cn('relative aspect-[4/5] overflow-hidden', isDark ? 'bg-[#111111]' : 'bg-[#F3F4F6]')}>
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ scale: hovered && !reduced ? ZOOM : 1 }}
          transition={hovered ? ZOOM_IN : ZOOM_OUT}
        >
          <Image
            src={images[0] || '/images/placeholder.png'}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn('object-cover transition-opacity duration-500', images[1] && 'md:group-hover:opacity-0')}
            priority={priority}
          />
          {images[1] && (
            <Image
              src={images[1]}
              alt={`${name} - Vista alternativa`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              className="object-cover opacity-0 transition-opacity duration-500 md:group-hover:opacity-100"
            />
          )}
        </motion.div>

        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {isNew && <span className="rounded-full bg-[#111827] px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">NUEVO</span>}
          {isRestock && <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">RESTOCK</span>}
          {isBestSeller && <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white">TOP</span>}
          {hasDiscount && <span className="rounded-full bg-[#FF3D00] px-2.5 py-1 text-[10px] font-bold text-white">-{discountPercent}%</span>}
        </div>

        {/* Wishlist (always visible on touch, on hover with a pointer) */}
        <motion.button
          type="button"
          aria-label={isLiked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={isLiked}
          whileTap={reduced ? undefined : { scale: 0.9 }}
          transition={SPRING_SNAPPY}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsLiked(!isLiked)
          }}
          className={cn(
            'absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-opacity duration-200',
            'md:opacity-0 md:group-hover:opacity-100 md:group-data-[hover]:opacity-100',
            isDark ? 'border-white/10 bg-black/40' : 'border-black/[0.06] bg-white/80'
          )}
        >
          <Heart className={cn('h-4 w-4', isLiked ? 'fill-red-500 text-red-500' : isDark ? 'text-white' : 'text-[#374151]')} />
        </motion.button>

        {isSoldOut && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/55 backdrop-blur-sm">
            <span className={cn('rounded-full px-4 py-2 text-sm font-bold tracking-wider', isDark ? 'bg-[#1A1A1A] text-white/70' : 'bg-white text-[#6B7280]')}>
              AGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 md:p-5">
        {category && (
          <span className={cn('mb-1 text-[10px] font-semibold uppercase tracking-[0.18em]', isDark ? 'text-[#C9A962]' : 'text-[#9CA3AF]')}>
            {category}
          </span>
        )}
        <h3 className={cn('line-clamp-2 text-[15px] font-medium leading-snug [text-wrap:balance]', isDark ? 'text-[#E8E4D9]' : 'text-[#111827]')}>
          {name}
        </h3>
        {sizeLine && <p className={cn('mt-1.5 text-xs', isDark ? 'text-[#E8E4D9]/50' : 'text-[#6B7280]')}>{sizeLine}</p>}

        {/* Footer: price on the left, action on the right */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className={cn('text-sm font-semibold tabular-nums', isDark ? 'text-[#E8E4D9]' : 'text-[#111827]')}>{formatPrice(price)}</p>
            {hasDiscount && (
              <p className={cn('text-xs tabular-nums line-through', isDark ? 'text-[#6B6860]' : 'text-[#9CA3AF]')}>
                {formatPrice(compareAtPrice)}
              </p>
            )}
          </div>
          {!isSoldOut && (
            <motion.button
              type="button"
              onClick={handleOpenQuickView}
              whileTap={reduced ? undefined : { scale: 0.94 }}
              transition={SPRING_SNAPPY}
              aria-label={`Agregar ${name}`}
              className={cn(
                'relative z-10 inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors',
                isDark ? 'bg-white text-[#111827] hover:bg-[#F3F4F6]' : 'bg-[#111827] text-white hover:bg-[#1F2937]'
              )}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Agregar</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
