import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProductForm } from '@/components/admin/product-form'
import { getCategoriesForSelect } from '@/lib/queries/categories'
import { getAdminProductById } from '@/lib/queries/products'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getCategoriesForSelect(),
  ])

  if (!product) {
    notFound()
  }

  // Transform product data for the form
  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    categoryId: product.categoryId,
    tags: product.tags,
    status: product.status as 'draft' | 'active' | 'archived',
    isFeatured: product.isFeatured,
    images: product.images.map((img) => ({
      url: img.url,
      altText: img.altText || undefined,
    })),
    variants: product.variants.map((v) => ({
      sku: v.sku,
      size: v.size || undefined,
      color: v.color || undefined,
      colorHex: v.colorHex || undefined,
      stockQuantity: v.stockQuantity,
      priceAdjustment: Number(v.priceAdjustment),
    })),
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-1.5 hover:bg-[#222222] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-[#E8E4D9]" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-[#E8E4D9]">Editar Producto</h1>
          <p className="text-xs text-[#888888]">{product.name}</p>
        </div>
      </div>

      {/* Form */}
      <ProductForm initialData={initialData} categories={categories} mode="edit" />
    </div>
  )
}
