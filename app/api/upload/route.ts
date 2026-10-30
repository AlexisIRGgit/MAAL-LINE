import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

/**
 * Client uploads for product images (Vercel Blob). Images used to be saved as base64 inside the
 * database, which made every order and product query carry megabytes. Needs BLOB_READ_WRITE_TOKEN.
 */
export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Falta conectar el almacenamiento de archivos (Vercel Blob) para subir imágenes.' },
      { status: 503 }
    )
  }

  const body = (await request.json()) as HandleUploadBody
  try {
    const result = await handleUpload({
      body,
      request,
      // The completion callback comes from Vercel without cookies, so authorization happens here
      onBeforeGenerateToken: async () => {
        await requirePermission('products:edit')
        return {
          allowedContentTypes: IMAGE_TYPES,
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // The form saves the returned URL on the product; nothing to do here
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && ['Unauthorized', 'Forbidden', 'Permission denied'].includes(error.message)) {
      return handleAuthError(error)
    }
    console.error('Image upload failed:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo subir la imagen' }, { status: 400 })
  }
}
