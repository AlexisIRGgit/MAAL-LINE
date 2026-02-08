import type { Product, ProductImage, ProductVariant, Category } from '@prisma/client'

// Type for Product with relations from Prisma
export type ProductWithRelations = Product & {
  images: ProductImage[]
  variants: ProductVariant[]
  category?: Category | null
}

// Type expected by ProductCard component
export interface ProductCardData {
  id: string
  slug: string
  name: string
  price: number
  compareAtPrice?: number
  images: string[]
  sizes: string[]
  isNew?: boolean
  isBestSeller?: boolean
  isRestock?: boolean
  isSoldOut?: boolean
}

// Extended product data for product detail page
export interface ProductDetailData extends ProductCardData {
  description?: string
  shortDescription?: string
  category?: {
    id: string
    name: string
    slug: string
  }
  variants: {
    id: string
    sku: string
    size: string | null
    color: string | null
    colorHex: string | null
    stockQuantity: number
    priceAdjustment: number
  }[]
  tags: string[]
}

/**
 * Convert Prisma Decimal to number
 */
function decimalToNumber(decimal: unknown): number | undefined {
  if (decimal === null || decimal === undefined) return undefined
  return Number(decimal)
}

/**
 * Check if a product is "new" (published within last 14 days or has 'new' tag)
 */
function isProductNew(product: Product): boolean {
  if (product.tags?.includes('new')) return true
  if (product.publishedAt) {
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    return new Date(product.publishedAt) > fourteenDaysAgo
  }
  return false
}

/**
 * Transform Prisma Product to ProductCard format
 */
export function transformProductForCard(product: ProductWithRelations): ProductCardData {
  // Sort images: primary first, then by sortOrder
  const sortedImages = [...product.images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.sortOrder - b.sortOrder
  })

  // Get unique sizes from active variants with stock
  const availableSizes = product.variants
    .filter(v => v.isActive && v.size)
    .map(v => v.size as string)
  const uniqueSizes = Array.from(new Set(availableSizes))

  // Calculate total stock
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0)

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: decimalToNumber(product.price) ?? 0,
    compareAtPrice: decimalToNumber(product.compareAtPrice),
    images: sortedImages.length > 0
      ? sortedImages.map(img => img.url)
      : ['/images/placeholder.png'],
    sizes: uniqueSizes,
    isNew: isProductNew(product),
    isBestSeller: product.tags?.includes('bestseller') ?? false,
    isRestock: product.tags?.includes('restock') ?? false,
    isSoldOut: totalStock === 0,
  }
}

/**
 * Transform Prisma Product to ProductDetail format
 */
export function transformProductForDetail(product: ProductWithRelations): ProductDetailData {
  const cardData = transformProductForCard(product)

  return {
    ...cardData,
    description: product.description ?? undefined,
    shortDescription: product.shortDescription ?? undefined,
    category: product.category ? {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    } : undefined,
    variants: product.variants
      .filter(v => v.isActive)
      .map(v => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        colorHex: v.colorHex,
        stockQuantity: v.stockQuantity,
        priceAdjustment: decimalToNumber(v.priceAdjustment) ?? 0,
      })),
    tags: product.tags ?? [],
  }
}

/**
 * Transform array of products for ProductCard components
 */
export function transformProductsForCards(products: ProductWithRelations[]): ProductCardData[] {
  return products.map(transformProductForCard)
}
