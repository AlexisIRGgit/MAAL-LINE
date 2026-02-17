'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/product/product-card'
import { useCartStore } from '@/lib/store/cart-store'
import { cn } from '@/lib/utils/cn'
import { ChevronLeft, ChevronRight, Minus, Plus, Heart, Share2, Truck, RotateCcw, Shield, Check, Loader2 } from 'lucide-react'
import type { ProductDetailData, ProductCardData } from '@/lib/transformers/product'
import { toast } from '@/lib/toast'

interface ProductPageClientProps {
  product: ProductDetailData
  relatedProducts: ProductCardData[]
}

export function ProductPageClient({ product, relatedProducts }: ProductPageClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const { addItem } = useCartStore()
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (sessionStatus !== 'authenticated') return
      try {
        const response = await fetch(`/api/wishlist/${product.id}`)
        if (response.ok) {
          const data = await response.json()
          setInWishlist(data.inWishlist)
        }
      } catch (error) {
        console.error('Error checking wishlist:', error)
      }
    }
    checkWishlist()
  }, [product.id, sessionStatus])

  const handleWishlistToggle = async () => {
    if (sessionStatus !== 'authenticated') {
      toast.info('Inicia sesión para guardar favoritos')
      router.push(`/login?redirect=/producto/${product.slug}`)
      return
    }

    setWishlistLoading(true)
    try {
      if (inWishlist) {
        const response = await fetch(`/api/wishlist/${product.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setInWishlist(false)
          toast.success('Eliminado de favoritos')
        }
      } else {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        })
        if (response.ok) {
          setInWishlist(true)
          toast.success('Agregado a favoritos')
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      toast.error('Error al actualizar favoritos')
    } finally {
      setWishlistLoading(false)
    }
  }

  const {
    name,
    price,
    compareAtPrice,
    images,
    isNew,
    isBestSeller,
    isRestock,
    isSoldOut,
    description,
    shortDescription,
    category,
    variants,
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

  // Get unique sizes with stock info
  const sizesWithStock = variants
    .filter(v => v.size)
    .reduce((acc, v) => {
      const existing = acc.find(s => s.size === v.size)
      if (existing) {
        existing.stock += v.stockQuantity
      } else {
        acc.push({ size: v.size!, stock: v.stockQuantity })
      }
      return acc
    }, [] as { size: string; stock: number }[])

  const selectedVariantStock = selectedSize
    ? sizesWithStock.find(s => s.size === selectedSize)?.stock ?? 0
    : 0

  const canAddToCart = selectedSize && selectedVariantStock > 0 && !isSoldOut

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleAddToCart = () => {
    if (!canAddToCart || !selectedSize) return

    setIsAdding(true)
    addItem(product, selectedSize, quantity)
    toast.success('Producto agregado al carrito', `${name} - Talla ${selectedSize}`)

    // Show confirmation
    setJustAdded(true)
    setTimeout(() => {
      setJustAdded(false)
      setIsAdding(false)
    }, 2000)
  }

  return (
    <>
      <PromoBar />
      <Navbar />

      <main className="bg-[#0A0A0A] min-h-screen">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="text-xs text-[#E8E4D9]/50">
            <Link href="/" className="hover:text-[#E8E4D9]">Inicio</Link>
            <span className="mx-2">/</span>
            {category && (
              <>
                <Link href={`/categoria/${category.slug}`} className="hover:text-[#E8E4D9]">
                  {category.name}
                </Link>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-[#E8E4D9]">{name}</span>
          </nav>
        </div>

        {/* Product Section */}
        <section className="container mx-auto px-4 pb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[3/4] bg-[#111111] overflow-hidden group">
                <Image
                  src={images[selectedImageIndex] || '/images/placeholder.png'}
                  alt={name}
                  fill
                  priority
                  className="object-cover"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {isNew && <Badge variant="new">NEW</Badge>}
                  {isRestock && <Badge variant="restock">RESTOCK</Badge>}
                  {isBestSeller && <Badge variant="bestseller">BEST SELLER</Badge>}
                  {hasDiscount && <Badge variant="sale">-{discountPercent}%</Badge>}
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#0A0A0A]/80 text-[#E8E4D9] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#0A0A0A]/80 text-[#E8E4D9] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Sold Out Overlay */}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-[#E8E4D9]/50 font-bold text-xl tracking-[0.2em]">
                      AGOTADO
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        'relative w-20 h-24 flex-shrink-0 bg-[#111111] overflow-hidden border-2 transition-colors',
                        selectedImageIndex === index
                          ? 'border-[#E8E4D9]'
                          : 'border-transparent hover:border-[#E8E4D9]/50'
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${name} - Vista ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title & Price */}
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#E8E4D9] uppercase tracking-wide">
                  {name}
                </h1>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-2xl font-bold text-[#E8E4D9]">
                    {formatPrice(price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-[#6B6860] line-through">
                      {formatPrice(compareAtPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              {shortDescription && (
                <p className="text-[#E8E4D9]/60 text-sm leading-relaxed">
                  {shortDescription}
                </p>
              )}

              {/* Size Selector */}
              {sizesWithStock.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-[#E8E4D9] tracking-wider">TALLA</span>
                    <Link href="/guia-tallas" className="text-xs text-[#C9A962] hover:underline">
                      Guía de tallas
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizesWithStock.map(({ size, stock }) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={stock === 0}
                        className={cn(
                          'px-4 py-2 text-sm font-bold tracking-wider border transition-all',
                          selectedSize === size
                            ? 'bg-[#E8E4D9] text-[#0A0A0A] border-[#E8E4D9]'
                            : stock > 0
                              ? 'bg-transparent text-[#E8E4D9] border-[#E8E4D9]/30 hover:border-[#E8E4D9]'
                              : 'bg-transparent text-[#E8E4D9]/30 border-[#E8E4D9]/10 cursor-not-allowed line-through'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <span className="text-sm font-bold text-[#E8E4D9] tracking-wider block mb-3">CANTIDAD</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[#E8E4D9]/30">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-[#E8E4D9] hover:bg-[#E8E4D9]/10 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-[#E8E4D9] font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariantStock || 10, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-[#E8E4D9] hover:bg-[#E8E4D9]/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {selectedSize && selectedVariantStock > 0 && selectedVariantStock <= 5 && (
                    <span className="text-xs text-[#C9A962]">
                      Solo quedan {selectedVariantStock} unidades
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  disabled={!canAddToCart || isAdding}
                  onClick={handleAddToCart}
                  className={cn(
                    "flex-1 transition-all",
                    justAdded && "bg-green-600 hover:bg-green-600"
                  )}
                >
                  {justAdded ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      AGREGADO
                    </span>
                  ) : isSoldOut ? (
                    'AGOTADO'
                  ) : sizesWithStock.length > 0 && !selectedSize ? (
                    'SELECCIONA UNA TALLA'
                  ) : (
                    'AÑADIR AL CARRITO'
                  )}
                </Button>
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={cn(
                    "w-12 h-12 border flex items-center justify-center transition-colors disabled:opacity-50",
                    inWishlist
                      ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30"
                      : "border-[#E8E4D9]/30 text-[#E8E4D9] hover:bg-[#E8E4D9]/10"
                  )}
                  title={inWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  {wishlistLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
                  )}
                </button>
                <button className="w-12 h-12 border border-[#E8E4D9]/30 flex items-center justify-center text-[#E8E4D9] hover:bg-[#E8E4D9]/10 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8E4D9]/10">
                <div className="text-center">
                  <Truck className="w-5 h-5 mx-auto text-[#C9A962] mb-2" />
                  <span className="text-[10px] text-[#E8E4D9]/60 tracking-wider block">ENVÍO EXPRESS</span>
                  <span className="text-xs text-[#E8E4D9]">24-48h</span>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-5 h-5 mx-auto text-[#C9A962] mb-2" />
                  <span className="text-[10px] text-[#E8E4D9]/60 tracking-wider block">DEVOLUCIONES</span>
                  <span className="text-xs text-[#E8E4D9]">30 días</span>
                </div>
                <div className="text-center">
                  <Shield className="w-5 h-5 mx-auto text-[#C9A962] mb-2" />
                  <span className="text-[10px] text-[#E8E4D9]/60 tracking-wider block">PAGO SEGURO</span>
                  <span className="text-xs text-[#E8E4D9]">100%</span>
                </div>
              </div>

              {/* Description */}
              {description && (
                <div className="pt-6 border-t border-[#E8E4D9]/10">
                  <h3 className="text-sm font-bold text-[#E8E4D9] tracking-wider mb-3">DESCRIPCIÓN</h3>
                  <div className="text-[#E8E4D9]/60 text-sm leading-relaxed whitespace-pre-line">
                    {description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-16 border-t border-[#E8E4D9]/10">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-black text-[#E8E4D9] mb-8">
                TAMBIÉN TE PUEDE <span className="text-[#C9A962]">GUSTAR</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}
