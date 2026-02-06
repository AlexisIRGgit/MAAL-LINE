// ============================================
// MAAL LINE - TYPE DEFINITIONS
// ============================================

// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  currency: 'MXN'
  images: string[]
  category: ProductCategory
  categorySlug: string
  sizes: ProductSize[]
  availableSizes: string[]
  features: string[]
  care: string[]
  sku: string

  // Status flags
  isNew: boolean
  isRestock: boolean
  isBestSeller: boolean
  isSoldOut: boolean

  // Timestamps
  createdAt: Date
  updatedAt: Date
  dropDate?: Date
}

export interface ProductSize {
  value: SizeValue
  available: boolean
  stock: number
}

export type SizeValue = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL'

export type ProductCategory =
  | 'Hoodies'
  | 'Tees'
  | 'Bottoms'
  | 'Accesorios'
  | 'Outerwear'

export type ProductBadge =
  | 'new'
  | 'restock'
  | 'bestseller'
  | 'sale'
  | 'limited'
  | 'soldout'

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  productId: string
  product: Product
  size: SizeValue
  quantity: number
  addedAt: Date
}

export interface Cart {
  items: CartItem[]
  itemCount: number
  subtotal: number
  createdAt: Date
  updatedAt: Date
}

export interface CartStore {
  items: CartItem[]
  itemCount: number
  subtotal: number
  isOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'addedAt' | 'product'>) => void
  removeItem: (productId: string, size: SizeValue) => void
  updateQuantity: (productId: string, size: SizeValue, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

// ============================================
// ORDER TYPES
// ============================================

export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  customer: Customer
  shippingAddress: Address
  billingAddress: Address
  shippingMethod: ShippingMethod
  paymentMethod: PaymentMethod
  subtotal: number
  shippingCost: number
  tax: number
  discount: number
  total: number
  status: OrderStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  size: SizeValue
  quantity: number
  unitPrice: number
  totalPrice: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
}

export interface PaymentMethod {
  type: 'card' | 'paypal' | 'oxxo' | 'spei'
  last4?: string
  brand?: string
}

// ============================================
// CUSTOMER TYPES
// ============================================

export interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  acceptsMarketing: boolean
  createdAt: Date
}

export interface Address {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

// ============================================
// FILTER TYPES
// ============================================

export interface ProductFilters {
  categories: ProductCategory[]
  sizes: SizeValue[]
  availability: 'all' | 'available' | 'soldout'
  priceRange: {
    min: number
    max: number
  }
  sort: SortOption
}

export type SortOption =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'best-selling'
  | 'alphabetical'

export interface FilterStore {
  filters: ProductFilters
  activeFilterCount: number

  // Actions
  setCategory: (category: ProductCategory) => void
  toggleCategory: (category: ProductCategory) => void
  toggleSize: (size: SizeValue) => void
  setAvailability: (availability: ProductFilters['availability']) => void
  setPriceRange: (range: ProductFilters['priceRange']) => void
  setSort: (sort: SortOption) => void
  clearAllFilters: () => void
  resetFilters: () => void
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface ProductQueryParams {
  category?: ProductCategory
  categories?: ProductCategory[]
  sizes?: SizeValue[]
  availability?: 'all' | 'available' | 'soldout'
  minPrice?: number
  maxPrice?: number
  sort?: SortOption
  search?: string
  page?: number
  limit?: number
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AnalyticsItem {
  item_id: string
  item_name: string
  item_category: string
  item_variant?: string
  price: number
  quantity: number
}

export interface ViewItemEvent {
  currency: string
  value: number
  items: AnalyticsItem[]
}

export interface AddToCartEvent {
  currency: string
  value: number
  items: AnalyticsItem[]
}

export interface BeginCheckoutEvent {
  currency: string
  value: number
  coupon?: string
  items: AnalyticsItem[]
}

export interface PurchaseEvent {
  transaction_id: string
  value: number
  tax: number
  shipping: number
  currency: string
  coupon?: string
  items: AnalyticsItem[]
}

// ============================================
// UI TYPES
// ============================================

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export interface Modal {
  isOpen: boolean
  content: React.ReactNode | null
}

export interface Breadcrumb {
  label: string
  href?: string
}

export interface NavLink {
  href: string
  label: string
  highlight?: boolean
  badge?: string
}

// ============================================
// LOOKBOOK TYPES
// ============================================

export interface LookbookImage {
  id: string
  src: string
  alt: string
  products: string[] // Product slugs
  span?: string // Grid span class
  aspect?: string // Aspect ratio class
}

export interface LookbookCollection {
  id: string
  title: string
  season: string
  year: number
  description: string
  heroImage: string
  images: LookbookImage[]
}

// ============================================
// NEWSLETTER TYPES
// ============================================

export interface NewsletterSubscription {
  email: string
  source: 'footer' | 'popup' | 'checkout'
  acceptsMarketing: boolean
  subscribedAt: Date
}

// ============================================
// UTILITY TYPES
// ============================================

export type WithClassName<T = {}> = T & {
  className?: string
}

export type WithChildren<T = {}> = T & {
  children: React.ReactNode
}

export type Nullable<T> = T | null

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
