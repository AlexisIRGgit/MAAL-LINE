import { NextRequest, NextResponse } from 'next/server'
import { getPublicStoreSettings } from '@/lib/public-store-settings'

export const dynamic = 'force-dynamic'

// GET - The uploaded store logo as an image (used as the site favicon)
export async function GET(request: NextRequest) {
  const { logo } = await getPublicStoreSettings()
  if (!logo) return new NextResponse(null, { status: 404 })

  const match = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(logo.dataUrl)
  if (!match) return new NextResponse(null, { status: 404 })

  // URLs carry ?v=<version>, so a matching version can be cached forever
  const versioned = request.nextUrl.searchParams.get('v') === logo.version
  return new NextResponse(Buffer.from(match[2], 'base64'), {
    headers: {
      'Content-Type': match[1],
      'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=60',
    },
  })
}
