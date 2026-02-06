'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
}

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

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

  return (
    <article
      className="group relative flex flex-col product-card-gothic"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link
        href={`/producto/${slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-[#111111]"
      >
        {/* Primary Image */}
        <Image
          src={images[0]}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            'object-cover transition-all duration-700',
            isHovered && images[1] ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
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
              'object-cover transition-all duration-700',
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            )}
          />
        )}

        {/* Dark gradient overlay on hover */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        )} />

        {/* Badges - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isNew && <Badge variant="new">NEW</Badge>}
          {isRestock && <Badge variant="restock">RESTOCK</Badge>}
          {isBestSeller && <Badge variant="bestseller">BEST SELLER</Badge>}
          {hasDiscount && <Badge variant="sale">-{discountPercent}%</Badge>}
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="text-[#E8E4D9]/50 font-bold text-sm tracking-[0.2em]">
              AGOTADO
            </span>
          </div>
        )}

        {/* Quick Add Button (Desktop) */}
        {!isSoldOut && (
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 p-4',
              'translate-y-full opacity-0 transition-all duration-300',
              'group-hover:translate-y-0 group-hover:opacity-100',
              'hidden md:block'
            )}
          >
            <Button variant="primary" fullWidth size="sm">
              AÑADIR AL CARRITO
            </Button>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="mt-4 space-y-2 px-1">
        <Link href={`/producto/${slug}`}>
          <h3 className="font-bold text-[#E8E4D9] text-sm tracking-wide uppercase truncate hover:text-[#C9A962] transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-bold text-[#E8E4D9] tracking-wide">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-[#6B6860] line-through text-sm">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Available Sizes */}
        <div className="flex gap-1.5 mt-2">
          {sizes.slice(0, 5).map((size) => (
            <span
              key={size}
              className="text-[10px] text-[#E8E4D9]/50 border border-[#E8E4D9]/20 px-2 py-0.5 tracking-wider"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
