import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { requirePermission, handleAuthError } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const MAX_VIDEO_BYTES = 200 * 1024 * 1024

/**
 * Client uploads for product videos (Vercel Blob). The browser sends the file straight to Blob, so large
 * videos skip the 4.5MB serverless body limit; this route only signs the upload. Needs BLOB_READ_WRITE_TOKEN.
 */
export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Falta conectar el almacenamiento de archivos (Vercel Blob) para subir videos.' },
      { status: 503 }
    )
  }

  const body = (await request.json()) as HandleUploadBody
  try {
    const result = await handleUpload({
      body,
      request,
      // Runs for the signed-in admin before the upload starts. The completion callback below comes
      // from Vercel's servers without cookies, so authorization must happen here.
      onBeforeGenerateToken: async () => {
        await requirePermission('products:edit')
        return {
          allowedContentTypes: VIDEO_TYPES,
          maximumSizeInBytes: MAX_VIDEO_BYTES,
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
    console.error('Video upload failed:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo subir el video' }, { status: 400 })
  }
}
