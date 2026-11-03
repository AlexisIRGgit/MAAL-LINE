// Force dynamic rendering - database queries require runtime connection
export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getProductBySlug, getRelatedProducts } from '@/lib/queries/products'
import { transformProductForDetail, transformProductsForCards } from '@/lib/transformers/product'
import { isMercaditoProduct, productPath } from '@/lib/brand'
import { ProductPageClient } from './product-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Producto no encontrado | MAAL LINE',
    }
  }

  return {
    title: `${product.name} | MAAL LINE`,
    description: product.shortDescription || product.description || `Compra ${product.name} en MAAL LINE`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description || undefined,
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product || product.status !== 'active' || product.deletedAt) {
    notFound()
  }

  // Links from the cart, wishlist or old shares can point here; each store has its own product URL
  if (isMercaditoProduct(product.tags)) redirect(productPath(slug, 'mercadito'))

  // Get related products
  const relatedRaw = await getRelatedProducts(product.id, product.categoryId, 4)
  const relatedProducts = transformProductsForCards(relatedRaw)

  // Transform product for client component
  const productData = transformProductForDetail(product)

  return <ProductPageClient product={productData} relatedProducts={relatedProducts} />
}
