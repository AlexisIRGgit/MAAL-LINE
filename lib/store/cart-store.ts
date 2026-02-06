import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, Product, SizeValue } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

interface CartActions {
  addItem: (product: Product, size: SizeValue, quantity?: number) => void
  removeItem: (productId: string, size: SizeValue) => void
  updateQuantity: (productId: string, size: SizeValue, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

interface CartComputed {
  itemCount: number
  subtotal: number
  getItem: (productId: string, size: SizeValue) => CartItem | undefined
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

      getItem: (productId: string, size: SizeValue) => {
        return get().items.find(
          (item) => item.productId === productId && item.size === size
        )
      },

      // ============================================
      // ACTIONS
      // ============================================
      addItem: (product: Product, size: SizeValue, quantity = 1) => {
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
            product,
            size,
            quantity,
            addedAt: new Date(),
          }

          return { items: [...state.items, newItem], isOpen: true }
        })
      },

      removeItem: (productId: string, size: SizeValue) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.size === size)
          ),
        }))
      },

      updateQuantity: (productId: string, size: SizeValue, quantity: number) => {
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
