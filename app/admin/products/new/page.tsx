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
          className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Nuevo Producto</h1>
          <p className="text-sm text-[#6B7280]">Crea un nuevo producto en tu tienda</p>
        </div>
      </div>

      {/* Form */}
      <ProductForm categories={categories} mode="create" />
    </div>
  )
}
