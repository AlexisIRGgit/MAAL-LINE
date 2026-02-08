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
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-4">
            <h3 className="text-sm font-bold text-[#E8E4D9] mb-4">Información básica</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-[#E8E4D9] mb-1">
                  Nombre del producto *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-sm text-[#E8E4D9] placeholder-[#666666] focus:outline-none focus:border-[#C9A962] transition-colors"
                  placeholder="Tee MAAL Tribal Wings"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-xs font-medium text-[#E8E4D9] mb-1">
                  Slug (URL) *
                </label>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-sm text-[#E8E4D9] placeholder-[#666666] focus:outline-none focus:border-[#C9A962] transition-colors"
                  placeholder="tee-maal-tribal-wings"
                />
              </div>

              <div>
                <label htmlFor="shortDescription" className="block text-xs font-medium text-[#E8E4D9] mb-1">
                  Descripción corta
                </label>
                <input
                  id="shortDescription"
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  maxLength={500}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-sm text-[#E8E4D9] placeholder-[#666666] focus:outline-none focus:border-[#C9A962] transition-colors"
                  placeholder="Descripción breve para vista previa"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-medium text-[#E8E4D9] mb-1">
                  Descripción completa
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-sm text-[#E8E4D9] placeholder-[#666666] focus:outline-none focus:border-[#C9A962] transition-colors resize-none"
                  placeholder="Descripción detallada del producto..."
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-4">
            <h3 className="text-sm font-bold text-[#E8E4D9] mb-4">Imágenes</h3>
            <ImageUploader
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
            />
          </div>

          {/* Variants */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-4">
            <h3 className="text-sm font-bold text-[#E8E4D9] mb-4">Variantes (Tallas/Stock)</h3>
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
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-4">
            <h3 className="text-sm font-bold text-[#E8E4D9] mb-4">Estado</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-xs font-medium text-[#E8E4D9] mb-1">
                  Estado del producto
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductFormData['status'] })}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-sm text-[#E8E4D9] focus:outline-none focus:border-[#C9A962] transition-colors"
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-[#C9A962]"
                />
                <span className="text-xs text-[#E8E4D9]">Producto destacado</span>
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-4">
            <h3 className="text-sm font-bold text-[#E8E4D9] mb-4">Precios</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="price" className="block text-xs font-medium text-[#E8E4D9] mb-1">
                  Precio *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] text-sm">$</span>
                  <input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                    min={0}
                    step={0.01}
                    className="w-full pl-8 pr-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-sm text-[#E8E4D9] placeholder-[#666666] focus:outline-none focus:border-[#C9A962] transition-colors"
                    placeholder="699"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="compareAtPrice" className="block text-xs font-medium text-[#E8E4D9] mb-1">
                  Precio anterior (tachado)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] text-sm">$</span>
                  <input
                    id="compareAtPrice"
                    type="number"
                    value={formData.compareAtPrice ?? ''}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value ? parseFloat(e.target.value) : null })}
                    min={0}
                    step={0.01}
                    className="w-full pl-8 pr-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-sm text-[#E8E4D9] placeholder-[#666666] focus:outline-none focus:border-[#C9A962] transition-colors"
                    placeholder="899"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-[#111111] border border-[#222222] rounded-lg p-4">
            <h3 className="text-sm font-bold text-[#E8E4D9] mb-4">Organización</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="categoryId" className="block text-xs font-medium text-[#E8E4D9] mb-1">
                  Categoría
                </label>
                <select
                  id="categoryId"
                  value={formData.categoryId ?? ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || null })}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-sm text-[#E8E4D9] focus:outline-none focus:border-[#C9A962] transition-colors"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-xs font-medium text-[#E8E4D9] mb-1">
                  Etiquetas
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-sm text-[#E8E4D9] placeholder-[#666666] focus:outline-none focus:border-[#C9A962] transition-colors"
                  placeholder="new, bestseller, restock"
                />
                <p className="mt-1 text-[10px] text-[#666666]">Separadas por comas. Usa &quot;new&quot;, &quot;bestseller&quot;, &quot;restock&quot; para badges.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[#222222]">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-[#E8E4D9] border border-[#333333] rounded-lg hover:bg-[#222222] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-[#C9A962] text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[#E8E4D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
