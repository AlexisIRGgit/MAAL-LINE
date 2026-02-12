import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, handleAuthError } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

// GET - Check if product is in wishlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await requireAuth()
    const userId = session.user.id
    const { productId } = await params

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    return NextResponse.json({
      inWishlist: !!wishlistItem,
      wishlistId: wishlistItem?.id || null,
    })
  } catch (error) {
    return handleAuthError(error)
  }
}

// DELETE - Remove product from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await requireAuth()
    const userId = session.user.id
    const { productId } = await params

    // Check if exists
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (!wishlistItem) {
      return NextResponse.json(
        { error: 'El producto no está en tu lista de deseos' },
        { status: 404 }
      )
    }

    // Delete from wishlist
    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado de la lista de deseos',
    })
  } catch (error) {
    return handleAuthError(error)
  }
}
