// Force dynamic rendering - database queries require runtime connection
export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getProductBySlug, getRelatedProducts } from '@/lib/queries/products'
import { transformProductForDetail, transformProductsForCards } from '@/lib/transformers/product'
import { isMercaditoProduct, productPath } from '@/lib/brand'
import { ProductPageClient } from '@/app/producto/[slug]/product-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return { title: 'Producto no encontrado | El Mercadito by MAAL' }
  }

  return {
    title: `${product.name} | El Mercadito by MAAL`,
    description: product.shortDescription || product.description || `Compra ${product.name} en El Mercadito by MAAL`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description || undefined,
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  }
}

export default async function MercaditoProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product || product.status !== 'active' || product.deletedAt) {
    notFound()
  }

  if (!isMercaditoProduct(product.tags)) redirect(productPath(slug, 'maal'))

  const relatedRaw = await getRelatedProducts(product.id, product.categoryId, 4, 'mercadito')

  return <ProductPageClient product={transformProductForDetail(product)} relatedProducts={transformProductsForCards(relatedRaw)} />
}
