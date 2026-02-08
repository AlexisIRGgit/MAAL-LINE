import { prisma } from '@/lib/db'
import { ProductStatus } from '@prisma/client'

// Base include for product queries - includes images and variants
const productInclude = {
  images: {
    orderBy: { sortOrder: 'asc' as const },
  },
  variants: {
    where: { isActive: true },
  },
  category: true,
} as const

/**
 * Get new arrivals for homepage (most recently published products)
 */
export async function getNewArrivals(limit = 4) {
  return prisma.product.findMany({
    where: {
      status: ProductStatus.active,
      deletedAt: null,
    },
    include: productInclude,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  })
}

/**
 * Get best sellers for homepage (products with 'bestseller' tag)
 */
export async function getBestSellers(limit = 4) {
  return prisma.product.findMany({
    where: {
      status: ProductStatus.active,
      deletedAt: null,
      tags: { has: 'bestseller' },
    },
    include: productInclude,
    take: limit,
  })
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: {
      status: ProductStatus.active,
      deletedAt: null,
      isFeatured: true,
    },
    include: productInclude,
    take: limit,
  })
}

/**
 * Get all active products for the store
 */
export async function getAllProducts(page = 1, limit = 12) {
  const where = {
    status: ProductStatus.active,
    deletedAt: null,
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get product by slug for product detail page
 */
export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      ...productInclude,
      collectionProducts: {
        include: {
          collection: true,
        },
      },
    },
  })
}

/**
 * Get products by category slug
 */
export async function getProductsByCategory(categorySlug: string, page = 1, limit = 12) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  })

  if (!category) return { products: [], total: 0, category: null, page, totalPages: 0 }

  const where = {
    categoryId: category.id,
    status: ProductStatus.active,
    deletedAt: null,
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    total,
    category,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get products by collection slug
 */
export async function getProductsByCollection(collectionSlug: string, page = 1, limit = 12) {
  const collection = await prisma.collection.findUnique({
    where: { slug: collectionSlug },
  })

  if (!collection) return { products: [], total: 0, collection: null, page, totalPages: 0 }

  const collectionProducts = await prisma.collectionProduct.findMany({
    where: { collectionId: collection.id },
    include: {
      product: {
        include: productInclude,
      },
    },
    orderBy: { sortOrder: 'asc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  const products = collectionProducts
    .map(cp => cp.product)
    .filter(p => p.status === ProductStatus.active && !p.deletedAt)

  const total = await prisma.collectionProduct.count({
    where: { collectionId: collection.id },
  })

  return {
    products,
    total,
    collection,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Search products by name or description
 */
export async function searchProducts(query: string, page = 1, limit = 12) {
  const where = {
    status: ProductStatus.active,
    deletedAt: null,
    OR: [
      { name: { contains: query, mode: 'insensitive' as const } },
      { description: { contains: query, mode: 'insensitive' as const } },
      { tags: { has: query.toLowerCase() } },
    ],
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get related products (same category, excluding current product)
 */
export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4) {
  if (!categoryId) return []

  return prisma.product.findMany({
    where: {
      categoryId,
      status: ProductStatus.active,
      deletedAt: null,
      id: { not: productId },
    },
    include: productInclude,
    take: limit,
    orderBy: { publishedAt: 'desc' },
  })
}

// ============================================
// ADMIN QUERIES (include drafts and archived)
// ============================================

/**
 * Get all products for admin (includes drafts and archived)
 */
export async function getAdminProducts(
  page = 1,
  limit = 20,
  status?: ProductStatus,
  search?: string
) {
  const where = {
    deletedAt: null,
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { where: { isActive: true } },
        category: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Get single product for admin editing
 */
export async function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      category: true,
    },
  })
}
