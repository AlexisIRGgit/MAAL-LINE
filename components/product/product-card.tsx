'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

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

export function ProductCard({ product, priority = false, variant = 'dark' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const {
    slug,
    name,
    price,
    compareAtPrice,
    images,
    isNew,
    isRestock,
    isBestSeller,
    isSoldOut,
    sizes,
    category,
  } = product

  const hasDiscount = compareAtPrice && compareAtPrice > price
  const discountPercent = hasDiscount
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const isDark = variant === 'dark'

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300',
        isDark
          ? 'bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A]'
          : 'bg-white border border-[#E5E7EB] hover:border-[#D1D5DB]',
        'hover:shadow-xl hover:-translate-y-1'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link
        href={`/producto/${slug}`}
        className={cn(
          'relative aspect-[3/4] overflow-hidden',
          isDark ? 'bg-[#111111]' : 'bg-[#F3F4F6]'
        )}
      >
        {/* Primary Image */}
        <Image
          src={images[0] || '/images/placeholder.png'}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'object-cover transition-all duration-500',
            isHovered && images[1] ? 'opacity-0' : 'opacity-100',
            'group-hover:scale-105'
          )}
          priority={priority}
        />

        {/* Secondary Image (hover) */}
        {images[1] && (
          <Image
            src={images[1]}
            alt={`${name} - Vista alternativa`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover transition-all duration-500',
              isHovered ? 'opacity-100 scale-105' : 'opacity-0'
            )}
          />
        )}

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {isNew && (
            <span className="px-2.5 py-1 bg-[#111827] text-white text-[10px] font-bold tracking-wider rounded-lg">
              NUEVO
            </span>
          )}
          {isRestock && (
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold tracking-wider rounded-lg">
              RESTOCK
            </span>
          )}
          {isBestSeller && (
            <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold tracking-wider rounded-lg">
              TOP
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button - Top Right */}
        <button
          onClick={(e) => {
            e.preventDefault()
            setIsLiked(!isLiked)
          }}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10',
            'opacity-0 group-hover:opacity-100',
            isDark
              ? 'bg-black/50 backdrop-blur-sm hover:bg-black/70'
              : 'bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white',
          )}
        >
          <Heart
            className={cn(
              'w-4 h-4 transition-colors',
              isLiked
                ? 'fill-red-500 text-red-500'
                : isDark ? 'text-white' : 'text-[#6B7280]'
            )}
          />
        </button>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <span className={cn(
              'px-4 py-2 rounded-lg text-sm font-bold tracking-wider',
              isDark ? 'bg-[#1A1A1A] text-white/70' : 'bg-white text-[#6B7280]'
            )}>
              AGOTADO
            </span>
          </div>
        )}

        {/* Quick Add Button */}
        {!isSoldOut && (
          <div
            className={cn(
              'absolute bottom-3 left-3 right-3',
              'translate-y-4 opacity-0 transition-all duration-300',
              'group-hover:translate-y-0 group-hover:opacity-100',
              'hidden md:block'
            )}
          >
            <button className={cn(
              'w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2',
              isDark
                ? 'bg-white text-[#111827] hover:bg-[#F3F4F6]'
                : 'bg-[#111827] text-white hover:bg-[#1F2937]'
            )}>
              <ShoppingBag className="w-4 h-4" />
              Agregar
            </button>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        {category && (
          <span className={cn(
            'text-[10px] font-medium tracking-wider uppercase mb-1',
            isDark ? 'text-[#C9A962]' : 'text-[#6B7280]'
          )}>
            {category}
          </span>
        )}

        {/* Name */}
        <Link href={`/producto/${slug}`}>
          <h3 className={cn(
            'font-semibold text-sm line-clamp-2 transition-colors',
            isDark
              ? 'text-[#E8E4D9] hover:text-[#C9A962]'
              : 'text-[#111827] hover:text-[#374151]'
          )}>
            {name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className={cn(
            'font-bold',
            isDark ? 'text-[#E8E4D9]' : 'text-[#111827]'
          )}>
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className={cn(
              'text-sm line-through',
              isDark ? 'text-[#6B6860]' : 'text-[#9CA3AF]'
            )}>
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Available Sizes */}
        {sizes && sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {sizes.slice(0, 5).map((size) => (
              <span
                key={size}
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-md',
                  isDark
                    ? 'bg-[#2A2A2A] text-[#E8E4D9]/70'
                    : 'bg-[#F3F4F6] text-[#374151]'
                )}
              >
                {size}
              </span>
            ))}
            {sizes.length > 5 && (
              <span className={cn(
                'text-[10px] px-2 py-0.5',
                isDark ? 'text-[#E8E4D9]/50' : 'text-[#6B7280]'
              )}>
                +{sizes.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
