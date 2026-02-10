'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { ImageUploader } from './image-uploader'
import { VariantManager } from './variant-manager'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductImage {
  url: string
  altText?: string
}

interface ProductVariant {
  sku: string
  size?: string
  color?: string
  colorHex?: string
  stockQuantity: number
  priceAdjustment: number
}

interface ProductFormData {
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  compareAtPrice: number | null
  categoryId: string | null
  tags: string[]
  status: 'draft' | 'active' | 'archived'
  isFeatured: boolean
  images: ProductImage[]
  variants: ProductVariant[]
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & { id?: string }
  categories: Category[]
  mode: 'create' | 'edit'
}

export function ProductForm({ initialData, categories, mode }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    price: initialData?.price || 0,
    compareAtPrice: initialData?.compareAtPrice || null,
    categoryId: initialData?.categoryId || null,
    tags: initialData?.tags || [],
    status: initialData?.status || 'draft',
    isFeatured: initialData?.isFeatured || false,
    images: initialData?.images || [],
    variants: initialData?.variants || [],
  })

  const [tagsInput, setTagsInput] = useState(formData.tags.join(', '))

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === 'create' && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.name, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Parse tags from input
      const tags = tagsInput
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0)

      const dataToSubmit = {
        ...formData,
        tags,
      }

      const url = mode === 'create'
        ? '/api/products'
        : `/api/products/${initialData?.id}`

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al guardar el producto')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#111827] mb-4">Información básica</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#374151] mb-2">
                  Nombre del producto *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                  placeholder="Tee MAAL Tribal Wings"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-[#374151] mb-2">
                  Slug (URL) *
                </label>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                  placeholder="tee-maal-tribal-wings"
                />
              </div>

              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-[#374151] mb-2">
                  Descripción corta
                </label>
                <input
                  id="shortDescription"
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  maxLength={500}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                  placeholder="Descripción breve para vista previa"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#374151] mb-2">
                  Descripción completa
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all resize-none"
                  placeholder="Descripción detallada del producto..."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#111827] mb-4">Imágenes</h3>
            <ImageUploader
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
            />
          </div>

          {/* Variants */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#111827] mb-4">Variantes (Tallas/Stock)</h3>
            <VariantManager
              variants={formData.variants}
              onChange={(variants) => setFormData({ ...formData, variants })}
              productSlug={formData.slug}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#111827] mb-4">Estado</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-[#374151] mb-2">
                  Estado del producto
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductFormData['status'] })}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827] focus:ring-offset-0"
                />
                <span className="text-sm text-[#374151]">Producto destacado</span>
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#111827] mb-4">Precios</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-[#374151] mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">$</span>
                  <input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                    min={0}
                    step={0.01}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                    placeholder="699"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="compareAtPrice" className="block text-sm font-medium text-[#374151] mb-2">
                  Precio anterior (tachado)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">$</span>
                  <input
                    id="compareAtPrice"
                    type="number"
                    value={formData.compareAtPrice ?? ''}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value ? parseFloat(e.target.value) : null })}
                    min={0}
                    step={0.01}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                    placeholder="899"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#111827] mb-4">Organización</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-[#374151] mb-2">
                  Categoría
                </label>
                <select
                  id="categoryId"
                  value={formData.categoryId ?? ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || null })}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-[#374151] mb-2">
                  Etiquetas
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                  placeholder="new, bestseller, restock"
                />
                <p className="mt-2 text-xs text-[#6B7280]">Separadas por comas. Usa &quot;new&quot;, &quot;bestseller&quot;, &quot;restock&quot; para badges.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-6 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-sm text-[#374151] border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
