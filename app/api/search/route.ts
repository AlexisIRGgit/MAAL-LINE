import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] })
  }

  const products = await prisma.product.findMany({
    where: {
      status: 'active',
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query.toLowerCase() } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      images: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
        select: { url: true, altText: true },
      },
      category: {
        select: { name: true },
      },
    },
    take: 6,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ products })
}
