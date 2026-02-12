'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  ShoppingBag,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'

interface WishlistProduct {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compareAtPrice: number | null
  image: string | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  isActive: boolean
  variants: {
    id: string
    name: string
    stock: number
  }[]
  inStock: boolean
}

interface WishlistItem {
  wishlistId: string
  addedAt: string
  product: WishlistProduct
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function WishlistPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const addItem = useCartStore((state) => state.addItem)

  const fetchWishlist = useCallback(async () => {
    if (sessionStatus !== 'authenticated') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/wishlist')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }, [sessionStatus])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const handleRemove = async (productId: string) => {
    setRemoving(productId)
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setItems((prev) => prev.filter((item) => item.product.id !== productId))
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    } finally {
      setRemoving(null)
    }
  }

  const handleAddToCart = async (item: WishlistItem) => {
    if (!item.product.inStock || item.product.variants.length === 0) return

    setAddingToCart(item.product.id)
    try {
      // Get first available variant with stock
      const availableVariant = item.product.variants.find((v) => v.stock > 0)
      if (!availableVariant) return

      // Create a product object compatible with the cart store
      const productForCart = {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        compareAtPrice: item.product.compareAtPrice || undefined,
        images: item.product.image ? [item.product.image] : [],
      }

      addItem(productForCart as any, availableVariant.name, 1)

      // Optionally remove from wishlist after adding to cart
      await handleRemove(item.product.id)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart(null)
    }
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Not authenticated
  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
            <h2 className="text-xl font-bold text-[#111827] mb-2">Inicia sesion para ver tu lista de deseos</h2>
            <p className="text-[#6B7280] mb-6">
              Guarda tus productos favoritos para comprarlos despues
            </p>
            <Link
              href="/auth/login?redirect=/wishlist"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
            >
              Iniciar sesion
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Loading
  if (loading || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] pt-24 pb-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6B7280]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pt-24 pb-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 sm:px-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">Lista de Deseos</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            {items.length} {items.length === 1 ? 'producto guardado' : 'productos guardados'}
          </p>
        </motion.div>

        {/* Wishlist Items */}
        {items.length > 0 ? (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            <AnimatePresence>
              {items.map((item) => {
                const discount = item.product.compareAtPrice
                  ? Math.round(((item.product.compareAtPrice - item.product.price) / item.product.compareAtPrice) * 100)
                  : 0

                return (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] bg-[#F3F4F6]">
                      <Link href={`/producto/${item.product.slug}`}>
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-[#D1D5DB]" />
                          </div>
                        )}
                      </Link>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {discount > 0 && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                            -{discount}%
                          </span>
                        )}
                        {!item.product.inStock && (
                          <span className="px-2 py-1 bg-[#111827] text-white text-xs font-medium rounded-lg">
                            Agotado
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.product.id)}
                        disabled={removing === item.product.id}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {removing === item.product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <Link href={`/producto/${item.product.slug}`}>
                        <h3 className="font-semibold text-[#111827] hover:text-[#374151] transition-colors line-clamp-1">
                          {item.product.name}
                        </h3>
                      </Link>

                      {item.product.category && (
                        <p className="text-xs text-[#6B7280] mt-0.5">{item.product.category.name}</p>
                      )}

                      {/* Price */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-bold text-[#111827]">{formatPrice(item.product.price)}</span>
                        {item.product.compareAtPrice && (
                          <span className="text-sm text-[#9CA3AF] line-through">
                            {formatPrice(item.product.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      {/* Sizes */}
                      {item.product.variants.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-[#6B7280] mb-1.5">Tallas disponibles</p>
                          <div className="flex flex-wrap gap-1">
                            {item.product.variants.map((variant) => (
                              <span
                                key={variant.id}
                                className={`px-2 py-0.5 text-xs rounded-md ${
                                  variant.stock > 0
                                    ? 'bg-[#F3F4F6] text-[#374151]'
                                    : 'bg-[#F3F4F6] text-[#9CA3AF] line-through'
                                }`}
                              >
                                {variant.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/producto/${item.product.slug}`}
                          className="flex-1 px-3 py-2 bg-[#111827] text-white text-sm font-semibold rounded-xl text-center hover:bg-[#1F2937] transition-colors"
                        >
                          Ver producto
                        </Link>
                        {item.product.inStock && item.product.variants.length > 0 && (
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={addingToCart === item.product.id}
                            className="p-2 bg-[#F3F4F6] rounded-xl hover:bg-[#E5E7EB] transition-colors disabled:opacity-50"
                            title="Agregar al carrito"
                          >
                            {addingToCart === item.product.id ? (
                              <Loader2 className="w-5 h-5 animate-spin text-[#6B7280]" />
                            ) : (
                              <ShoppingCart className="w-5 h-5 text-[#374151]" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center">
            <Heart className="w-16 h-16 text-[#D1D5DB] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#111827] mb-2">Tu lista de deseos esta vacia</h2>
            <p className="text-[#6B7280] mb-6 max-w-md mx-auto">
              Explora nuestros productos y guarda tus favoritos para comprarlos despues
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Explorar productos
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
