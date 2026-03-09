import { create } from 'zustand'

export interface QuickViewProduct {
  id: string
  slug: string
  name: string
  price: number
  compareAtPrice?: number
  images: string[]
  sizes: string[]
  category?: string
  description?: string
  isNew?: boolean
  isBestSeller?: boolean
  isRestock?: boolean
  isSoldOut?: boolean
}

interface QuickViewState {
  isOpen: boolean
  product: QuickViewProduct | null
}

interface QuickViewActions {
  openQuickView: (product: QuickViewProduct) => void
  closeQuickView: () => void
}

type QuickViewStore = QuickViewState & QuickViewActions

export const useQuickViewStore = create<QuickViewStore>((set) => ({
  isOpen: false,
  product: null,

  openQuickView: (product) => {
    set({ isOpen: true, product })
  },

  closeQuickView: () => {
    set({ isOpen: false, product: null })
  },
}))
