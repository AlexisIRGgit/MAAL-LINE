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

    toast.success('Agregado al carrito', `${product.name} - Talla ${selectedSize}`)
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
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
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
              <div className="relative aspect-square md:aspect-auto md:h-full bg-[#F3F4F6]">
                {/* Main Image */}
                <div className="relative w-full h-full min-h-[300px] md:min-h-[500px]">
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
              <div className="p-6 md:p-8 flex flex-col">
                {/* Category */}
                {product.category && (
                  <span className="text-xs font-medium tracking-wider uppercase text-[#6B7280] mb-2">
                    {product.category}
                  </span>
                )}

                {/* Name */}
                <h2 className="text-2xl font-bold text-[#111827] mb-4">
                  {product.name}
                </h2>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-[#111827]">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-[#9CA3AF] line-through">
                      {formatPrice(product.compareAtPrice!)}
                    </span>
                  )}
                </div>

                {/* Size Selector */}
                <div className="mb-6">
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
                        className={`min-w-[48px] h-12 px-4 rounded-xl text-sm font-semibold transition-all ${
                          selectedSize === size
                            ? 'bg-[#111827] text-white'
                            : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || product.isSoldOut}
                    className={`w-full h-14 rounded-xl text-base font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                      product.isSoldOut
                        ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                        : 'bg-[#111827] text-white hover:bg-[#1F2937] active:scale-[0.98]'
                    }`}
                  >
                    {isAdding ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : product.isSoldOut ? (
                      'AGOTADO'
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        AGREGAR AL CARRITO
                      </>
                    )}
                  </button>

                  {/* View Full Product Link */}
                  <Link
                    href={`/producto/${product.slug}`}
                    onClick={closeQuickView}
                    className="w-full h-12 rounded-xl text-sm font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver producto completo
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
