import { create } from 'zustand'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import type { ProductCategory, SizeValue, SortOption, ProductFilters } from '@/types'

// ============================================
// DEFAULT FILTERS
// ============================================

const DEFAULT_FILTERS: ProductFilters = {
  categories: [],
  sizes: [],
  availability: 'all',
  priceRange: { min: 0, max: 10000 },
  sort: 'newest',
}

// ============================================
// STORE
// ============================================

interface FilterState {
  filters: ProductFilters
}

interface FilterActions {
  setCategory: (category: ProductCategory) => void
  toggleCategory: (category: ProductCategory) => void
  toggleSize: (size: SizeValue) => void
  setAvailability: (availability: ProductFilters['availability']) => void
  setPriceRange: (range: ProductFilters['priceRange']) => void
  setSort: (sort: SortOption) => void
  setFilters: (filters: Partial<ProductFilters>) => void
  clearAllFilters: () => void
  resetFilters: () => void
}

interface FilterComputed {
  activeFilterCount: number
  hasActiveFilters: boolean
}

type FilterStore = FilterState & FilterActions & FilterComputed

export const useFilterStore = create<FilterStore>((set, get) => ({
  // ============================================
  // STATE
  // ============================================
  filters: DEFAULT_FILTERS,

  // ============================================
  // COMPUTED
  // ============================================
  get activeFilterCount() {
    const { filters } = get()
    let count = 0
    if (filters.categories.length > 0) count += filters.categories.length
    if (filters.sizes.length > 0) count += filters.sizes.length
    if (filters.availability !== 'all') count += 1
    if (
      filters.priceRange.min !== DEFAULT_FILTERS.priceRange.min ||
      filters.priceRange.max !== DEFAULT_FILTERS.priceRange.max
    ) {
      count += 1
    }
    return count
  },

  get hasActiveFilters() {
    return get().activeFilterCount > 0
  },

  // ============================================
  // ACTIONS
  // ============================================
  setCategory: (category: ProductCategory) => {
    set((state) => ({
      filters: {
        ...state.filters,
        categories: [category],
      },
    }))
  },

  toggleCategory: (category: ProductCategory) => {
    set((state) => {
      const { categories } = state.filters
      const newCategories = categories.includes(category)
        ? categories.filter((c) => c !== category)
        : [...categories, category]

      return {
        filters: {
          ...state.filters,
          categories: newCategories,
        },
      }
    })
  },

  toggleSize: (size: SizeValue) => {
    set((state) => {
      const { sizes } = state.filters
      const newSizes = sizes.includes(size)
        ? sizes.filter((s) => s !== size)
        : [...sizes, size]

      return {
        filters: {
          ...state.filters,
          sizes: newSizes,
        },
      }
    })
  },

  setAvailability: (availability: ProductFilters['availability']) => {
    set((state) => ({
      filters: {
        ...state.filters,
        availability,
      },
    }))
  },

  setPriceRange: (priceRange: ProductFilters['priceRange']) => {
    set((state) => ({
      filters: {
        ...state.filters,
        priceRange,
      },
    }))
  },

  setSort: (sort: SortOption) => {
    set((state) => ({
      filters: {
        ...state.filters,
        sort,
      },
    }))
  },

  setFilters: (newFilters: Partial<ProductFilters>) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }))
  },

  clearAllFilters: () => {
    set({
      filters: {
        ...DEFAULT_FILTERS,
        sort: get().filters.sort, // Keep sort preference
      },
    })
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS })
  },
}))

// ============================================
// URL SYNC HOOK
// ============================================

/**
 * Hook to sync filter state with URL search params
 * Use this in the collection page to enable shareable filtered URLs
 */
export function useFilterUrlSync() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { filters, setFilters } = useFilterStore()

  // Parse URL params on mount
  useEffect(() => {
    const sizes = searchParams.get('sizes')?.split(',') as SizeValue[] | undefined
    const categories = searchParams.get('categories')?.split(',') as ProductCategory[] | undefined
    const availability = searchParams.get('availability') as ProductFilters['availability'] | undefined
    const sort = searchParams.get('sort') as SortOption | undefined
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    setFilters({
      ...(sizes && { sizes }),
      ...(categories && { categories }),
      ...(availability && { availability }),
      ...(sort && { sort }),
      ...(minPrice && maxPrice && {
        priceRange: { min: Number(minPrice), max: Number(maxPrice) },
      }),
    })
  }, []) // Only on mount

  // Update URL when filters change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams()

    if (filters.sizes.length > 0) {
      params.set('sizes', filters.sizes.join(','))
    }
    if (filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','))
    }
    if (filters.availability !== 'all') {
      params.set('availability', filters.availability)
    }
    if (filters.sort !== 'newest') {
      params.set('sort', filters.sort)
    }
    if (
      filters.priceRange.min !== DEFAULT_FILTERS.priceRange.min ||
      filters.priceRange.max !== DEFAULT_FILTERS.priceRange.max
    ) {
      params.set('minPrice', String(filters.priceRange.min))
      params.set('maxPrice', String(filters.priceRange.max))
    }

    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
  }, [filters, pathname, router])

  return { updateUrl }
}

// ============================================
// SELECTORS
// ============================================

export const selectFilters = (state: FilterStore) => state.filters
export const selectActiveFilterCount = (state: FilterStore) => state.activeFilterCount
export const selectHasActiveFilters = (state: FilterStore) => state.hasActiveFilters
