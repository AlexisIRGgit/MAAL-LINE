'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { useCheckoutModalStore } from '@/lib/store/checkout-modal-store'
import { toast } from '@/lib/toast'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, addItem } = useCartStore()
  const { openCheckoutModal } = useCheckoutModalStore()

  // Calculate values directly from items for proper reactivity
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  const handleRemoveItem = (productId: string, size: string) => {
    const item = items.find(i => i.productId === productId && i.size === size)
    if (!item) return

    removeItem(productId, size)
    toast.action(
      'Producto eliminado',
      'Deshacer',
      () => {
        // Restore item
        addItem({
          id: item.product.id,
          slug: item.product.slug,
          name: item.product.name,
          price: item.product.price,
          compareAtPrice: item.product.compareAtPrice,
          images: [item.product.image],
          category: undefined,
          variants: [],
          sizes: [size],
          isNew: false,
          isBestSeller: false,
          isRestock: false,
          isSoldOut: false,
        }, size, item.quantity)
        toast.success('Producto restaurado')
      }
    )
  }

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal Container - Centered with Flexbox */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg max-h-[85vh] bg-white rounded-2xl flex flex-col shadow-2xl overflow-hidden pointer-events-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#111827]" />
                <h2 className="text-lg font-bold text-[#111827] tracking-wide">
                  CARRITO
                </h2>
                {itemCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-[#111827] text-white text-xs font-bold rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <ShoppingBag className="w-16 h-16 text-[#E5E7EB] mb-4" />
                  <p className="text-[#374151] font-medium mb-2">
                    Tu carrito está vacío
                  </p>
                  <p className="text-[#9CA3AF] text-sm mb-6">
                    Agrega productos para comenzar
                  </p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2.5 border border-[#E5E7EB] text-[#374151] text-sm font-bold tracking-wider rounded-xl hover:bg-[#F3F4F6] transition-colors"
                  >
                    SEGUIR COMPRANDO
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="p-4 flex gap-4"
                    >
                      {/* Product Image */}
                      <Link
                        href={`/producto/${item.product.slug}`}
                        onClick={closeCart}
                        className="relative w-20 h-24 bg-[#F3F4F6] flex-shrink-0 overflow-hidden rounded-xl"
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
                          className="text-sm font-bold text-[#111827] hover:text-[#374151] transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-[#6B7280] mt-1">
                          Talla: {item.size}
                        </p>
                        <p className="text-sm font-bold text-[#111827] mt-2">
                          {formatPrice(item.product.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-[#E5E7EB] rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-[#111827] text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.productId, item.size)}
                            className="p-2 text-[#9CA3AF] hover:text-red-500 transition-colors"
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
              <div className="border-t border-[#E5E7EB] p-4 space-y-4 bg-[#F9FAFB]">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span className="text-lg font-bold text-[#111827]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  Envío calculado en el checkout
                </p>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    closeCart()
                    openCheckoutModal()
                  }}
                  className="block w-full py-3.5 bg-[#111827] text-white text-center font-bold tracking-wider rounded-xl hover:bg-[#374151] transition-colors"
                >
                  FINALIZAR COMPRA
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="w-full py-3 border border-[#E5E7EB] text-[#374151] text-sm font-bold tracking-wider rounded-xl hover:bg-white transition-colors"
                >
                  SEGUIR COMPRANDO
                </button>
              </div>
            )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
