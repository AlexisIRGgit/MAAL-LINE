'use client'

import { useEffect, useMemo, useState } from 'react'
import { blobatarUri } from 'blobatar/uri'
import { cn } from '@/lib/utils/cn'

/**
 * Profile photo, or a deterministic blobatar (blobatar.dev) when there is none or it
 * fails to load. Seed with something stable per person (email first) so everyone keeps
 * the same blob across the store, the account panel and the admin.
 */
export function UserAvatar({
  seed,
  name,
  avatarUrl,
  size,
  className,
}: {
  seed: string
  /** Used for the alt text */
  name?: string
  avatarUrl?: string | null
  /** Pixel size; omit to size it with className (e.g. "w-9 h-9") */
  size?: number
  className?: string
}) {
  const [photoFailed, setPhotoFailed] = useState(false)
  // A new photo gets a fresh chance to load
  useEffect(() => setPhotoFailed(false), [avatarUrl])
  const blob = useMemo(() => blobatarUri(seed.trim().toLowerCase() || 'maal', { background: 'circle' }), [seed])
  const showPhoto = !!avatarUrl && !photoFailed

  return (
    <span
      className={cn('relative inline-block flex-shrink-0 overflow-hidden rounded-full', className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <img
        src={showPhoto ? avatarUrl : blob}
        alt={name ?? ''}
        referrerPolicy="no-referrer"
        draggable={false}
        onError={showPhoto ? () => setPhotoFailed(true) : undefined}
        className="h-full w-full object-cover"
      />
    </span>
  )
}
