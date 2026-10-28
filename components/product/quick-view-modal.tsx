'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, ChevronLeft, ChevronRight, Heart, ExternalLink } from 'lucide-react'
import { useQuickViewStore } from '@/lib/store/quick-view-store'
import { useCartStore } from '@/lib/store/cart-store'
import { toast } from '@/lib/toast'

export function QuickViewModal() {
  const { isOpen, product, closeQuickView } = useQuickViewStore()
  const addToCart = useCartStore((state) => state.addItem)

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)

  // Reset state when modal opens with new product
  useEffect(() => {
    if (isOpen && product) {
      setSelectedSize(null)
      setCurrentImageIndex(0)
    }
  }, [isOpen, product?.id])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeQuickView()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeQuickView])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!product) return null

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.warning('Selecciona una talla', 'Por favor elige una talla antes de agregar')
      return
    }

    setIsAdding(true)

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300))

    addToCart(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        images: product.images,
        sizes: product.sizes,
      },
      selectedSize,
      1
    )

    toast.success('Agregado al carrito')
    setIsAdding(false)
    closeQuickView()
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeQuickView}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-white rounded-[24px] border border-[#E5E7EB] shadow-2xl overflow-hidden max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain dark:bg-[#1E2128] dark:border-white/10"
          >
            {/* Close Button */}
            <button
              onClick={closeQuickView}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-[#111827]" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Image Section */}
              <div className="relative aspect-[5/4] md:aspect-auto md:h-full bg-[#F3F4F6]">
                {/* Main Image */}
                <div className="relative w-full h-full md:min-h-[500px]">
                  <Image
                    src={product.images[currentImageIndex] || '/images/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Image Navigation */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#111827]" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-[#111827]" />
                    </button>

                    {/* Image Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {product.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentImageIndex
                              ? 'bg-[#111827]'
                              : 'bg-white/70 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="px-3 py-1 bg-[#111827] text-white text-xs font-bold tracking-wider rounded-lg">
                      NUEVO
                    </span>
                  )}
                  {product.isRestock && (
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold tracking-wider rounded-lg">
                      RESTOCK
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold tracking-wider rounded-lg">
                      TOP
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 md:p-8 flex flex-col">
                {/* Category */}
                {product.category && (
                  <span className="text-xs font-medium tracking-wider uppercase text-[#6B7280] mb-2">
                    {product.category}
                  </span>
                )}

                {/* Name */}
                <h2 className="text-xl md:text-2xl font-bold text-[#111827] mb-4 md:mb-6">
                  {product.name}
                </h2>

                {/* Size Selector */}
                <div className="mb-5 md:mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-[#111827]">Talla</span>
                    {!selectedSize && (
                      <span className="text-xs text-red-500">Selecciona una talla</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] h-10 md:h-12 px-3.5 md:px-4 rounded-xl text-sm font-semibold transition-all ${
                          selectedSize === size
                            ? 'bg-[#111827] text-white'
                            : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] dark:bg-white/[0.07] dark:hover:bg-white/[0.12]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Footer: price on the left, Ver + Agregar on the right (same buttons as the product cards) */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E5E7EB] dark:border-white/10">
                  <div className="min-w-0">
                    <p className="text-lg md:text-2xl font-bold tabular-nums text-[#111827]">{formatPrice(product.price)}</p>
                    {hasDiscount && (
                      <p className="text-xs md:text-sm tabular-nums text-[#9CA3AF] line-through">{formatPrice(product.compareAtPrice!)}</p>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <Link
                      href={`/producto/${product.slug}`}
                      onClick={closeQuickView}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-[#111827] transition-colors hover:bg-[#F3F4F6] dark:border-white/15 dark:bg-white/[0.06] dark:hover:bg-white/[0.12]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ver
                    </Link>
                    <button
                      onClick={handleAddToCart}
                      disabled={isAdding || product.isSoldOut}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors ${
                        product.isSoldOut
                          ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                          : 'bg-[#111827] text-white hover:bg-[#1F2937] active:scale-[0.97]'
                      }`}
                    >
                      {isAdding ? (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                      ) : (
                        <ShoppingBag className="h-3.5 w-3.5" />
                      )}
                      {product.isSoldOut ? 'Agotado' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
