/**
 * Downscales an image file in the browser and returns a data URI under `maxLength` chars.
 * Tries WebP (keeps transparency, small), falls back to PNG where the browser can't
 * encode WebP (older Safari), and keeps shrinking until it fits.
 */
export async function resizeImageToDataUrl(
  file: File,
  { maxSide = 512, maxLength = 400_000 }: { maxSide?: number; maxLength?: number } = {}
): Promise<string> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('No se pudo leer la imagen'))
      img.src = objectUrl
    })

    let side = Math.min(maxSide, Math.max(image.naturalWidth, image.naturalHeight))
    for (let attempt = 0; attempt < 6; attempt++) {
      const scale = side / Math.max(image.naturalWidth, image.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No se pudo procesar la imagen')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      let dataUrl = canvas.toDataURL('image/webp', 0.9)
      if (!dataUrl.startsWith('data:image/webp')) dataUrl = canvas.toDataURL('image/png')
      if (dataUrl.length <= maxLength) return dataUrl
      side = Math.round(side * 0.75)
    }
    throw new Error('La imagen es demasiado pesada')
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
