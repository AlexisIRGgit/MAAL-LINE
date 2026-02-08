import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { ProductStatus } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/products/[id] - Get single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    return handleAuthError(error)
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin()
    const { id } = await params
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if slug is taken by another product
    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Determine if we should update publishedAt
    const shouldPublish = status === ProductStatus.active && existingProduct.status !== ProductStatus.active
    const shouldUnpublish = status !== ProductStatus.active && existingProduct.status === ProductStatus.active

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
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
        updatedById: session.user.id,
        ...(shouldPublish && { publishedAt: new Date() }),
        ...(shouldUnpublish && { publishedAt: null }),
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
      },
    })

    // Handle images update if provided
    if (images !== undefined) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: id },
      })

      // Create new images
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: { url: string; altText?: string }, index: number) => ({
            productId: id,
            url: img.url,
            altText: img.altText,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        })
      }
    }

    // Handle variants update if provided
    if (variants !== undefined) {
      // Get existing variant IDs
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: id },
        select: { id: true, sku: true },
      })

      const existingSkus = new Set(existingVariants.map(v => v.sku))
      const newSkus = new Set(variants.map((v: { sku: string }) => v.sku))

      // Delete variants that are no longer in the list
      const skusToDelete = existingVariants.filter(v => !newSkus.has(v.sku)).map(v => v.id)
      if (skusToDelete.length > 0) {
        await prisma.productVariant.deleteMany({
          where: { id: { in: skusToDelete } },
        })
      }

      // Update or create variants
      for (const variant of variants as Array<{ sku: string; size?: string; color?: string; colorHex?: string; stockQuantity?: number; priceAdjustment?: number; isActive?: boolean }>) {
        if (existingSkus.has(variant.sku)) {
          // Update existing variant
          await prisma.productVariant.updateMany({
            where: { productId: id, sku: variant.sku },
            data: {
              size: variant.size,
              color: variant.color,
              colorHex: variant.colorHex,
              stockQuantity: variant.stockQuantity ?? 0,
              priceAdjustment: variant.priceAdjustment ?? 0,
              isActive: variant.isActive ?? true,
            },
          })
        } else {
          // Create new variant
          await prisma.productVariant.create({
            data: {
              productId: id,
              sku: variant.sku,
              size: variant.size,
              color: variant.color,
              colorHex: variant.colorHex,
              stockQuantity: variant.stockQuantity ?? 0,
              priceAdjustment: variant.priceAdjustment ?? 0,
              isActive: variant.isActive ?? true,
            },
          })
        }
      }
    }

    // Fetch updated product with all relations
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    return handleAuthError(error)
  }
}

// DELETE /api/products/[id] - Soft delete product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin()
    const { id } = await params

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting deletedAt
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: ProductStatus.archived,
        updatedById: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleAuthError(error)
  }
}
