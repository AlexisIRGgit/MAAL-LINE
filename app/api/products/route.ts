import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { ProductStatus } from '@prisma/client'

// GET /api/products - List all products (admin)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as ProductStatus | null
    const search = searchParams.get('search') || undefined

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

    // Transform products for response
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      status: product.status,
      category: product.category?.name || null,
      categoryId: product.categoryId,
      image: product.images[0]?.url || null,
      inventory: product.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }))

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()

    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      compareAtPrice,
      categoryId,
      tags,
      status,
      isFeatured,
      images,
      variants,
    } = body

    // Validate required fields
    if (!name || !slug || price === undefined) {
      return NextResponse.json(
        { error: 'Name, slug, and price are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this slug already exists' },
        { status: 400 }
      )
    }

    // Create product with images and variants
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        price,
        compareAtPrice,
        categoryId,
        tags: tags || [],
        status: status || ProductStatus.draft,
        isFeatured: isFeatured || false,
        createdById: session.user.id,
        updatedById: session.user.id,
        publishedAt: status === ProductStatus.active ? new Date() : null,
        images: images?.length > 0 ? {
          create: images.map((img: { url: string; altText?: string }, index: number) => ({
            url: img.url,
            altText: img.altText,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        } : undefined,
        variants: variants?.length > 0 ? {
          create: variants.map((v: { sku: string; size?: string; color?: string; colorHex?: string; stockQuantity?: number; priceAdjustment?: number }) => ({
            sku: v.sku,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stockQuantity: v.stockQuantity || 0,
            priceAdjustment: v.priceAdjustment || 0,
            isActive: true,
          })),
        } : undefined,
      },
      include: {
        images: true,
        variants: true,
        category: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return handleAuthError(error)
  }
}
