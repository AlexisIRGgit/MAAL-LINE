import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

// GET - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
            variants: {
              where: { isActive: true },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format the response
    const products = wishlistItems.map((item) => ({
      wishlistId: item.id,
      addedAt: item.createdAt.toISOString(),
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        description: item.product.description,
        price: parseFloat(item.product.price.toString()),
        compareAtPrice: item.product.compareAtPrice
          ? parseFloat(item.product.compareAtPrice.toString())
          : null,
        image: item.product.images[0]?.url || null,
        category: item.product.category,
        isActive: item.product.status === 'active',
        variants: item.product.variants.map((v) => ({
          id: v.id,
          name: v.size || v.color || 'Default',
          stock: v.stockQuantity,
        })),
        inStock: item.product.variants.some((v) => v.stockQuantity > 0),
      },
    }))

    return NextResponse.json({
      items: products,
      count: products.length,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// POST - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.user.id

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del producto' },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'El producto ya está en tu lista de deseos' },
        { status: 400 }
      )
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Producto agregado a la lista de deseos',
      wishlistId: wishlistItem.id,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
