'use client'

import { useState } from 'react'
import { Plus, Trash2, Package } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ProductVariant {
  sku: string
  size?: string
  color?: string
  colorHex?: string
  stockQuantity: number
  priceAdjustment: number
}

interface VariantManagerProps {
  variants: ProductVariant[]
  onChange: (variants: ProductVariant[]) => void
  productSlug: string
}

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

export function VariantManager({ variants, onChange, productSlug }: VariantManagerProps) {
  const [quickAddSizes, setQuickAddSizes] = useState<string[]>([])

  const generateSKU = (size: string) => {
    const slug = productSlug.toUpperCase().slice(0, 10).replace(/-/g, '')
    return `${slug}-${size}-${Date.now().toString(36).toUpperCase()}`
  }

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      sku: generateSKU('NEW'),
      size: '',
      color: '',
      colorHex: '',
      stockQuantity: 0,
      priceAdjustment: 0,
    }
    onChange([...variants, newVariant])
  }

  const handleRemoveVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index)
    onChange(newVariants)
  }

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    }
    onChange(newVariants)
  }

  const handleQuickAddToggle = (size: string) => {
    if (quickAddSizes.includes(size)) {
      setQuickAddSizes(quickAddSizes.filter((s) => s !== size))
    } else {
      setQuickAddSizes([...quickAddSizes, size])
    }
  }

  const handleQuickAdd = () => {
    if (quickAddSizes.length === 0) return

    const newVariants: ProductVariant[] = quickAddSizes.map((size) => ({
      sku: generateSKU(size),
      size,
      color: '',
      colorHex: '',
      stockQuantity: 0,
      priceAdjustment: 0,
    }))

    // Filter out sizes that already exist
    const existingSizes = new Set(variants.map((v) => v.size))
    const filteredNewVariants = newVariants.filter((v) => !existingSizes.has(v.size))

    if (filteredNewVariants.length > 0) {
      onChange([...variants, ...filteredNewVariants])
    }

    setQuickAddSizes([])
  }

  const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0)

  return (
    <div className="space-y-4">
      {/* Quick Add Sizes */}
      <div className="space-y-2">
        <p className="text-xs text-[#E8E4D9]/60">Agregar tallas rápidamente:</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SIZES.map((size) => {
            const exists = variants.some((v) => v.size === size)
            const selected = quickAddSizes.includes(size)

            return (
              <button
                key={size}
                type="button"
                disabled={exists}
                onClick={() => handleQuickAddToggle(size)}
                className={cn(
                  'px-3 py-1 text-xs font-bold border rounded transition-colors',
                  exists
                    ? 'border-[#222222] text-[#666666] cursor-not-allowed'
                    : selected
                      ? 'border-[#C9A962] bg-[#C9A962] text-[#0A0A0A]'
                      : 'border-[#333333] text-[#E8E4D9] hover:border-[#C9A962]'
                )}
              >
                {size}
              </button>
            )
          })}
          {quickAddSizes.length > 0 && (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="px-3 py-1 text-xs font-bold bg-[#C9A962] text-[#0A0A0A] rounded hover:bg-[#E8E4D9] transition-colors"
            >
              Agregar ({quickAddSizes.length})
            </button>
          )}
        </div>
      </div>

      {/* Variants List */}
      {variants.length > 0 ? (
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-xs text-[#E8E4D9]/60 px-1">
            <div className="col-span-3">SKU</div>
            <div className="col-span-2">Talla</div>
            <div className="col-span-2">Color</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-2">Ajuste $</div>
            <div className="col-span-1"></div>
          </div>

          {/* Rows */}
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-3">
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#0A0A0A] border border-[#333333] rounded text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
                  placeholder="SKU"
                />
              </div>
              <div className="col-span-2">
                <select
                  value={variant.size || ''}
                  onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#0A0A0A] border border-[#333333] rounded text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
                >
                  <option value="">-</option>
                  {COMMON_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={variant.color || ''}
                  onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#0A0A0A] border border-[#333333] rounded text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
                  placeholder="Negro"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={variant.stockQuantity}
                  onChange={(e) => handleVariantChange(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-2 py-1.5 bg-[#0A0A0A] border border-[#333333] rounded text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={variant.priceAdjustment}
                  onChange={(e) => handleVariantChange(index, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                  step={0.01}
                  className="w-full px-2 py-1.5 bg-[#0A0A0A] border border-[#333333] rounded text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(index)}
                  className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[#E8E4D9]/40">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay variantes</p>
          <p className="text-xs">Agrega tallas para gestionar el inventario</p>
        </div>
      )}

      {/* Add Variant Button */}
      <button
        type="button"
        onClick={handleAddVariant}
        className="w-full py-2 border border-dashed border-[#333333] rounded-lg text-xs text-[#E8E4D9]/60 hover:border-[#C9A962] hover:text-[#C9A962] transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Agregar variante manualmente
      </button>

      {/* Total Stock */}
      {variants.length > 0 && (
        <div className="flex justify-between items-center pt-3 border-t border-[#222222]">
          <span className="text-xs text-[#E8E4D9]/60">Stock total:</span>
          <span className={cn(
            'text-sm font-bold',
            totalStock === 0 ? 'text-red-400' : totalStock <= 10 ? 'text-yellow-400' : 'text-green-400'
          )}>
            {totalStock} unidades
          </span>
        </div>
      )}
    </div>
  )
}
