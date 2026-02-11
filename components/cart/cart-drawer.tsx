'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { cn } from '@/lib/utils/cn'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore()

  // Calculate values directly from items for proper reactivity
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [closeCart])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0A0A0A] z-50 flex flex-col border-l border-[#E8E4D9]/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E8E4D9]/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#E8E4D9]" />
                <h2 className="text-lg font-bold text-[#E8E4D9] tracking-wide">
                  CARRITO
                </h2>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#E8E4D9] text-[#0A0A0A] text-xs font-bold">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-[#E8E4D9]/70 hover:text-[#E8E4D9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <ShoppingBag className="w-16 h-16 text-[#E8E4D9]/20 mb-4" />
                  <p className="text-[#E8E4D9]/50 font-medium mb-2">
                    Tu carrito está vacío
                  </p>
                  <p className="text-[#E8E4D9]/30 text-sm mb-6">
                    Agrega productos para comenzar
                  </p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2 border border-[#E8E4D9]/30 text-[#E8E4D9] text-sm font-bold tracking-wider hover:bg-[#E8E4D9]/10 transition-colors"
                  >
                    SEGUIR COMPRANDO
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E8E4D9]/10">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="p-4 flex gap-4"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/producto/${item.product.slug}`}
                        onClick={closeCart}
                        className="relative w-20 h-24 bg-[#111111] flex-shrink-0 overflow-hidden"
                      >
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/producto/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-bold text-[#E8E4D9] hover:text-[#C9A962] transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-[#E8E4D9]/50 mt-1">
                          Talla: {item.size}
                        </p>
                        <p className="text-sm font-bold text-[#E8E4D9] mt-2">
                          {formatPrice(item.product.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-[#E8E4D9]/20">
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#E8E4D9]/70 hover:text-[#E8E4D9] hover:bg-[#E8E4D9]/10 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-[#E8E4D9] text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#E8E4D9]/70 hover:text-[#E8E4D9] hover:bg-[#E8E4D9]/10 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.size)}
                            className="p-2 text-[#E8E4D9]/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#E8E4D9]/10 p-4 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-[#E8E4D9]/70">Subtotal</span>
                  <span className="text-lg font-bold text-[#E8E4D9]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-[#E8E4D9]/40">
                  Envío calculado en el checkout
                </p>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full py-4 bg-[#E8E4D9] text-[#0A0A0A] text-center font-bold tracking-wider hover:bg-[#C9A962] transition-colors"
                >
                  FINALIZAR COMPRA
                </Link>

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="w-full py-3 border border-[#E8E4D9]/30 text-[#E8E4D9] text-sm font-bold tracking-wider hover:bg-[#E8E4D9]/10 transition-colors"
                >
                  SEGUIR COMPRANDO
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
