// Force dynamic rendering - database queries require runtime connection
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProductForm } from '@/components/admin/product-form'
import { getCategoriesForSelect } from '@/lib/queries/categories'

export default async function NewProductPage() {
  const categories = await getCategoriesForSelect()

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
          <h1 className="text-lg font-bold text-[#E8E4D9]">Nuevo Producto</h1>
          <p className="text-xs text-[#888888]">Crea un nuevo producto en tu tienda</p>
        </div>
      </div>

      {/* Form */}
      <ProductForm categories={categories} mode="create" />
    </div>
  )
}
