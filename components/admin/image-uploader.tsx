'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Plus, X, GripVertical, Link as LinkIcon, Upload, ImageIcon, Loader2 } from 'lucide-react'
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
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Validate file
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten imágenes JPG, PNG, WebP o GIF'
    }
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return 'La imagen no puede superar 5MB'
    }
    return null
  }

  // Handle file upload
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setUploadError(null)
    setIsUploading(true)

    const fileArray = Array.from(files)
    const newImages: ProductImage[] = []

    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        setUploadError(error)
        continue
      }

      try {
        const base64 = await fileToBase64(file)
        newImages.push({ url: base64, altText: file.name })
      } catch {
        setUploadError('Error al procesar la imagen')
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages])
    }

    setIsUploading(false)
  }, [images, onChange])

  // Handle URL add
  const handleAddUrl = () => {
    if (!urlInput.trim()) return
    setUploadError(null)

    // Basic URL validation
    try {
      new URL(urlInput)
    } catch {
      // If not a valid URL, check if it's a relative path
      if (!urlInput.startsWith('/')) {
        setUploadError('Ingresa una URL válida o ruta relativa (ej: /images/producto.png)')
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

  // Drag & drop for reordering
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

  // Drag & drop for files
  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingFile(true)
    }
  }

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleFileDragOver}
        onDragLeave={handleFileDragLeave}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
          isDraggingFile
            ? 'border-[#111827] bg-[#F3F4F6]'
            : 'border-[#E5E7EB] hover:border-[#9CA3AF] hover:bg-[#F9FAFB]'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#6B7280] animate-spin" />
            <p className="text-sm text-[#6B7280]">Procesando imágenes...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              'p-3 rounded-full transition-colors',
              isDraggingFile ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
            )}>
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#111827]">
                {isDraggingFile ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                JPG, PNG, WebP o GIF • Máximo 5MB por imagen
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {uploadError}
        </div>
      )}

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="O pega una URL: https://ejemplo.com/imagen.jpg"
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

      {/* Image Grid */}
      {images.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div
                key={`${image.url.slice(0, 50)}-${index}`}
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
                {image.url.startsWith('data:') ? (
                  // Base64 image
                  <img
                    src={image.url}
                    alt={image.altText || `Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // URL image
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
                )}

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

                {/* Base64 indicator */}
                {image.url.startsWith('data:') && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-blue-500 text-white text-[8px] font-bold rounded">
                    LOCAL
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-[#9CA3AF]">
            Arrastra para reordenar. La primera imagen será la principal.
          </p>
        </>
      ) : (
        <div className="text-center py-6 text-[#9CA3AF]">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay imágenes agregadas</p>
        </div>
      )}
    </div>
  )
}
