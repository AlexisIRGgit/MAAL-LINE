import { prisma } from '@/lib/db'

/**
 * Get all active collections
 */
export async function getActiveCollections() {
  return prisma.collection.findMany({
    where: {
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get featured collections for homepage
 */
export async function getFeaturedCollections(limit = 4) {
  return prisma.collection.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get collection by slug with product count
 */
export async function getCollectionBySlug(slug: string) {
  return prisma.collection.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { collectionProducts: true },
      },
    },
  })
}

/**
 * Get collection by ID
 */
export async function getCollectionById(id: string) {
  return prisma.collection.findUnique({
    where: { id },
    include: {
      collectionProducts: {
        include: {
          product: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
}

/**
 * Get all collections for admin
 */
export async function getAllCollections() {
  return prisma.collection.findMany({
    include: {
      _count: {
        select: { collectionProducts: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get collections for dropdown/select
 */
export async function getCollectionsForSelect() {
  return prisma.collection.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
    },
    orderBy: { name: 'asc' },
  })
}
