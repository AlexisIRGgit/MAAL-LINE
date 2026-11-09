'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ImageSwiper } from '@/components/product/image-swiper'

const SLIDES = [
  '/images/hero/hero-calle.webp',
  '/images/hero/hero-running.webp',
  '/images/hero/hero-gym.webp',
  '/images/hero/hero-corredor.webp',
]
const SLIDE_MS = 6000

/** Full-bleed photos that change by themselves and can be swiped; the hero copy sits on top without blocking the swipe */
export function HeroCarousel() {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)

  // Restarts on every change, so a swipe gets its full time on screen
  useEffect(() => {
    if (reduced) return
    const timer = setTimeout(() => {
      setIndex((current) => (document.hidden ? current : (current + 1) % SLIDES.length))
    }, SLIDE_MS)
    return () => clearTimeout(timer)
  }, [index, reduced])

  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#0A0A0A' }}>
      <ImageSwiper
        images={SLIDES}
        alt="MAAL Performance Gear"
        index={index}
        onIndexChange={setIndex}
        // On screens narrower than the 16:9 photos, cover scales them to the screen's height
        sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
        eager
      />

      {/* Keeps the copy readable over bright photos */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.15) 55%, transparent), linear-gradient(to right, rgba(0,0,0,0.6), transparent 65%)',
        }}
      />

      {/* Inline colors: the dark and Mercadito palettes remap white classes */}
      <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ver imagen ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
            className="flex h-8 w-10 items-center"
          >
            <span
              className="block h-0.5 w-full rounded-full transition-colors duration-300"
              style={{ backgroundColor: i === index ? '#fff' : 'rgba(255, 255, 255, 0.35)' }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
