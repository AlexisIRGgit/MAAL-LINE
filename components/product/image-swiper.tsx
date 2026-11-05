'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

interface ImageSwiperProps {
  images: string[]
  alt: string
  /** The image showing; arrows, dots and thumbnails change it from outside */
  index: number
  onIndexChange: (index: number) => void
  sizes: string
  /** Makes each image a link, so a tap opens this page */
  hrefFor?: (index: number) => string
  onNavigate?: () => void
}

/** Product images side by side in a native scroll-snap row: they follow the finger and leave vertical page scroll alone */
export function ImageSwiper({ images, alt, index, onIndexChange, sizes, hrefFor, onNavigate }: ImageSwiperProps) {
  const reduced = useReducedMotion()
  const rowRef = useRef<HTMLDivElement>(null)
  /** The index this row already knows about, so a swipe it reported doesn't scroll it again */
  const knownIndex = useRef(index)
  /** While arrows scroll across several images, the ones passed along the way aren't selections */
  const scrollTarget = useRef<number | null>(null)
  const slides = images.length > 0 ? images : ['/images/placeholder.png']

  // Opens on the requested image without showing the first one or animating
  useIsomorphicLayoutEffect(() => {
    const row = rowRef.current
    if (row) row.scrollLeft = knownIndex.current * row.clientWidth
  }, [])

  useEffect(() => {
    const row = rowRef.current
    if (!row || index === knownIndex.current) return
    knownIndex.current = index
    scrollTarget.current = index
    row.scrollTo({ left: index * row.clientWidth, behavior: reduced ? 'auto' : 'smooth' })
  }, [index, reduced])

  const handleScroll = () => {
    const row = rowRef.current
    if (!row || row.clientWidth === 0) return
    const current = Math.round(row.scrollLeft / row.clientWidth)
    if (scrollTarget.current !== null) {
      if (current === scrollTarget.current) scrollTarget.current = null
      return
    }
    if (current !== knownIndex.current) {
      knownIndex.current = current
      onIndexChange(current)
    }
  }

  // The person took over from an arrow's scroll
  const releaseTarget = () => {
    scrollTarget.current = null
  }

  return (
    <div
      ref={rowRef}
      onScroll={handleScroll}
      onPointerDown={releaseTarget}
      onTouchStart={releaseTarget}
      onWheel={releaseTarget}
      className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scrollbar-hide"
    >
      {slides.map((src, i) => {
        const image = (
          <Image
            src={src}
            alt={i === 0 ? alt : `${alt} - Vista ${i + 1}`}
            fill
            sizes={sizes}
            priority={i === 0}
            draggable={false}
            className="select-none object-cover"
          />
        )
        return (
          <div key={`${src}-${i}`} className="relative h-full w-full flex-none snap-center [scroll-snap-stop:always]">
            {hrefFor ? (
              <Link
                href={hrefFor(i)}
                onClick={onNavigate}
                draggable={false}
                tabIndex={i === index ? 0 : -1}
                aria-label={`Ver ${alt}`}
                className="absolute inset-0 block"
              >
                {image}
              </Link>
            ) : (
              image
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Inline colors: the dark and Mercadito palettes remap white and black classes */
export function ImageDots({
  count,
  index,
  onSelect,
  className,
}: {
  count: number
  index: number
  onSelect: (index: number) => void
  className?: string
}) {
  return (
    <div
      className={cn('flex gap-1.5 rounded-full px-2 py-1.5 backdrop-blur-sm', className)}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Ver imagen ${i + 1}`}
          aria-current={i === index ? 'true' : undefined}
          className="h-1.5 w-1.5 rounded-full transition-colors"
          style={{ backgroundColor: i === index ? '#fff' : 'rgba(255, 255, 255, 0.45)' }}
        />
      ))}
    </div>
  )
}
