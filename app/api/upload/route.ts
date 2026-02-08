import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'

// POST /api/upload - Upload image file
// NOTE: This endpoint requires cloud storage configuration for production
// Options: Vercel Blob, Cloudinary, AWS S3, Uploadthing
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // For now, return an error indicating cloud storage needs to be configured
    // In production, you would upload to Vercel Blob, Cloudinary, S3, etc.
    return NextResponse.json(
      {
        error: 'Image upload requires cloud storage configuration. For now, use external image URLs.',
        suggestion: 'You can use images from /images/ folder or external URLs like Imgur, Cloudinary, etc.'
      },
      { status: 501 }
    )

  } catch (error) {
    return handleAuthError(error)
  }
}
