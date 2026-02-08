import { prisma } from '@/lib/db'

/**
 * Get all active top-level categories (for navigation/homepage)
 */
export async function getActiveCategories() {
  return prisma.category.findMany({
    where: {
      isActive: true,
      parentId: null, // Top-level categories only
    },
    orderBy: { sortOrder: 'asc' },
  })
}

/**
 * Get all categories including children (for admin)
 */
export async function getAllCategories() {
  return prisma.category.findMany({
    where: {
      parentId: null,
    },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })
}

/**
 * Get category by slug with children
 */
export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      parent: true,
    },
  })
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
      parent: true,
    },
  })
}

/**
 * Get categories for dropdown/select (simple list)
 */
export async function getCategoriesForSelect() {
  return prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
    orderBy: { sortOrder: 'asc' },
  })
}
