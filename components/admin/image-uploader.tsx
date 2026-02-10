'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, X, GripVertical, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ProductImage {
  url: string
  altText?: string
}

interface ImageUploaderProps {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleAddUrl = () => {
    if (!urlInput.trim()) return

    // Basic URL validation
    try {
      new URL(urlInput)
    } catch {
      // If not a valid URL, check if it's a relative path
      if (!urlInput.startsWith('/')) {
        alert('Por favor ingresa una URL válida o una ruta relativa (ej: /images/producto.png)')
        return
      }
    }

    onChange([...images, { url: urlInput.trim(), altText: '' }])
    setUrlInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddUrl()
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    onChange(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="URL de imagen o ruta: /images/producto.png"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      <p className="text-xs text-[#6B7280]">
        Usa imágenes de /images/ o URLs externas (Imgur, Cloudinary, etc.)
      </p>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'relative aspect-square bg-[#F3F4F6] rounded-xl overflow-hidden group',
                'border border-[#E5E7EB]',
                draggedIndex === index && 'opacity-50'
              )}
            >
              <Image
                src={image.url}
                alt={image.altText || `Imagen ${index + 1}`}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/placeholder.png'
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="p-1.5 bg-white rounded text-[#6B7280] hover:text-[#111827] cursor-grab"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 bg-red-50 rounded text-red-600 hover:bg-red-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#111827] text-white text-[10px] font-bold rounded">
                  PRINCIPAL
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-[#9CA3AF]">
          Arrastra para reordenar. La primera imagen será la principal.
        </p>
      )}
    </div>
  )
}
