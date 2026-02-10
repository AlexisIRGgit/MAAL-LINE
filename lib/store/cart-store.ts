import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ProductCardData, ProductDetailData } from '@/lib/transformers/product'

// Cart item stored in state
export interface CartItem {
  productId: string
  product: {
    id: string
    slug: string
    name: string
    price: number
    compareAtPrice?: number
    image: string
  }
  size: string
  quantity: number
  addedAt: string // ISO string for serialization
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

interface CartActions {
  addItem: (product: ProductCardData | ProductDetailData, size: string, quantity?: number) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

interface CartComputed {
  itemCount: number
  subtotal: number
  getItem: (productId: string, size: string) => CartItem | undefined
}

type CartStore = CartState & CartActions & CartComputed

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // ============================================
      // STATE
      // ============================================
      items: [],
      isOpen: false,

      // ============================================
      // COMPUTED
      // ============================================
      get itemCount() {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },

      getItem: (productId: string, size: string) => {
        return get().items.find(
          (item) => item.productId === productId && item.size === size
        )
      },

      // ============================================
      // ACTIONS
      // ============================================
      addItem: (product: ProductCardData | ProductDetailData, size: string, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.productId === product.id && item.size === size
          )

          if (existingIndex > -1) {
            // Update existing item quantity
            const newItems = [...state.items]
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            }
            return { items: newItems, isOpen: true }
          }

          // Add new item
          const newItem: CartItem = {
            productId: product.id,
            product: {
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              image: product.images[0] || '/images/placeholder.png',
            },
            size,
            quantity,
            addedAt: new Date().toISOString(),
          }

          return { items: [...state.items, newItem], isOpen: true }
        })
      },

      removeItem: (productId: string, size: string) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.size === size)
          ),
        }))
      },

      updateQuantity: (productId: string, size: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },
    }),
    {
      name: 'maal-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
)

// ============================================
// SELECTORS (for optimized re-renders)
// ============================================

export const selectCartItems = (state: CartStore) => state.items
export const selectCartItemCount = (state: CartStore) => state.itemCount
export const selectCartSubtotal = (state: CartStore) => state.subtotal
export const selectCartIsOpen = (state: CartStore) => state.isOpen
