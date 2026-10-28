'use client'
// uiarc.dev/components/skeleton, adapted to framer-motion and Tailwind

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

const DURATION = { instant: 0.12, fast: 0.16, standard: 0.24 }
const EASE_ENTER = [0.16, 1, 0.3, 1] as const
const EASE_STANDARD = [0.22, 1, 0.36, 1] as const
/** Panels and height changes: critically damped, never overshoots */
const SPRING_SMOOTH = { type: 'spring', visualDuration: 0.4, bounce: 0 } as const

export interface SkeletonProps {
  label?: string
  lines?: number
  avatar?: boolean
  className?: string
  /** Content to reveal once loading finishes. With children, the placeholder crossfades into them. */
  children?: ReactNode
  /** Keeps the placeholder visible while true. Only used together with children. */
  loading?: boolean
}

// Each block pulses a beat after the one above it (skeleton-pulse in globals.css), so the wait reads as one calm wave
const BLOCK = 'block flex-none rounded-lg bg-[#E5E7EB] dark:bg-white/[0.08] skeleton-pulse'

/**
 * Follows its content height. After `busy` flips, the height springs from the old size to the new one and
 * then returns to auto, so passive reflows (a resize, a font swap) follow instantly. It clips only while moving.
 */
function HeightFrame({ className, busy, reduce, children }: { className?: string; busy: boolean; reduce: boolean | null; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const height = useMotionValue<number | 'auto'>('auto')
  const changedAt = useRef(0)
  useLayoutEffect(() => {
    changedAt.current = performance.now()
  }, [busy])
  useEffect(() => {
    const node = content.current
    if (!node || typeof ResizeObserver === 'undefined') return
    let last: number | undefined
    let controls: AnimationPlaybackControls | undefined
    const settle = () => {
      height.jump('auto')
      if (frame.current) Object.assign(frame.current.style, { overflow: '', height: 'auto' })
    }
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const next = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight
      const current = height.get()
      const from = typeof current === 'number' ? current : last
      last = next
      controls?.stop()
      if (reduce || from === undefined || from === next || performance.now() - changedAt.current > 120) return settle()
      // Pin the old height before this frame paints, then spring to the new one
      if (frame.current) Object.assign(frame.current.style, { overflow: 'hidden', height: `${from}px` })
      controls = animate(height, [from, next], { ...SPRING_SMOOTH, onComplete: settle })
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
      controls?.stop()
    }
  }, [height, reduce])
  return (
    <motion.div ref={frame} className={className} aria-busy={busy} style={{ height }}>
      <div ref={content} className="relative flow-root">
        {children}
      </div>
    </motion.div>
  )
}

export function Skeleton({ label = 'Cargando contenido', lines = 3, avatar = false, className, children, loading = true }: SkeletonProps) {
  const reduce = useReducedMotion()
  const count = Math.min(Math.max(Math.floor(lines), 1), 6)
  const placeholder = (extra?: string) => (
    <div className={cn('flex w-full min-w-0 items-start gap-4', extra)} role="status" aria-label={label} aria-busy="true">
      {avatar && <span className={cn(BLOCK, 'h-10 w-10 rounded-full')} aria-hidden="true" />}
      <span className="grid flex-1 gap-3 pt-1" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={cn(
              BLOCK,
              'h-3 w-full',
              index === 0 && 'h-4 w-[48%]',
              index === count - 1 && count > 1 && 'w-[72%]'
            )}
            style={{ '--index': index + (avatar ? 1 : 0) } as CSSProperties}
          />
        ))}
      </span>
    </div>
  )
  if (children === undefined) return placeholder(className)
  return (
    <HeightFrame className={className} busy={loading} reduce={reduce}>
      <AnimatePresence mode="popLayout" initial={false}>
        {loading ? (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? DURATION.instant : DURATION.fast, ease: EASE_STANDARD }}
            exit={{ opacity: 0, transition: { duration: reduce ? DURATION.instant : DURATION.fast } }}
          >
            {placeholder()}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reduce ? DURATION.instant : DURATION.fast } }}
            transition={{ duration: reduce ? DURATION.instant : DURATION.standard, ease: EASE_ENTER }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </HeightFrame>
  )
}

/** A single pulsing block for custom skeleton layouts (cards, rows, tiles) */
export function SkeletonBlock({ className, index = 0 }: { className?: string; index?: number }) {
  return <span aria-hidden="true" className={cn(BLOCK, className)} style={{ '--index': index } as CSSProperties} />
}

export default Skeleton

/** Rows shaped like the swipeable card lists (tile, two lines, value on the right) */
export function ListRowsSkeleton({ rows = 5, label = 'Cargando' }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} aria-busy="true" className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm"
        >
          <SkeletonBlock index={row} className="h-10 w-10 rounded-xl" />
          <div className="grid flex-1 gap-2">
            <SkeletonBlock index={row} className="h-3.5 w-[42%]" />
            <SkeletonBlock index={row + 1} className="h-3 w-[64%]" />
          </div>
          <SkeletonBlock index={row + 1} className="h-3.5 w-14" />
        </div>
      ))}
    </div>
  )
}
