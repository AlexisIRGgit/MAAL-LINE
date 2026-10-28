'use client'

import { useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { Film, Loader2, Trash2, Upload } from 'lucide-react'
import { toast } from '@/lib/toast'

const ACCEPT = 'video/mp4,video/webm,video/quicktime'
const MAX_MB = 200

/** Uploads one product video straight to Vercel Blob (signed by /api/upload/video) and returns its URL */
export function VideoUploader({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)

  const pick = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`El video pesa más de ${MAX_MB} MB`)
      return
    }
    setProgress(0)
    try {
      const blob = await upload(`productos/videos/${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/video',
        contentType: file.type,
        multipart: file.size > 20 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      })
      onChange(blob.url)
      toast.success('Video subido', 'Guarda el producto para publicarlo', 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo subir el video')
    } finally {
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-black">
          <video src={value} controls playsInline preload="metadata" className="aspect-video w-full object-contain" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={progress !== null}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E5E7EB] px-6 py-10 text-center transition-colors hover:border-[#111827] disabled:opacity-60"
        >
          {progress !== null ? <Loader2 className="h-6 w-6 animate-spin text-[#6B7280]" /> : <Film className="h-6 w-6 text-[#9CA3AF]" />}
          <span className="text-sm font-medium text-[#111827]">
            {progress !== null ? `Subiendo… ${progress}%` : 'Subir video del producto'}
          </span>
          <span className="text-xs text-[#9CA3AF]">MP4, WebM o MOV · hasta {MAX_MB} MB · opcional</span>
        </button>
      )}

      {progress !== null && (
        <div className="h-1.5 overflow-hidden rounded-full bg-[#F3F4F6]">
          <div className="h-full rounded-full bg-[#111827] transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      )}

      {value && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={progress !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
          >
            <Upload className="h-3.5 w-3.5" />
            Reemplazar
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Quitar video
          </button>
        </div>
      )}

      <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  )
}
