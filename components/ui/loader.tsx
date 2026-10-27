'use client'
// beui.dev/components/motion/loader (dots variant)

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const

export interface LoaderProps {
  /** Base square size in px. Everything scales from this. */
  size?: number
  /** Seconds per animation cycle. */
  speed?: number
  /** Accessible label announced to screen readers. */
  label?: string
  className?: string
}

/** Three bouncing dots. Color comes from `currentColor`, so set it with a text-* class. */
export function Loader({ size = 32, speed = 1, label = 'Cargando', className }: LoaderProps) {
  const reduce = useReducedMotion() ?? false
  const dot = size * 0.24

  return (
    <span role="status" aria-label={label} className={cn('inline-flex items-center justify-center', className)}>
      <span className="flex items-center" style={{ gap: size * 0.14 }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="rounded-full bg-current"
            style={{ width: dot, height: dot }}
            animate={reduce ? { opacity: [0.4, 1, 0.4] } : { y: [0, -size * 0.3, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: speed, ease: EASE_IN_OUT, repeat: Infinity, delay: i * speed * 0.16 }}
          />
        ))}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  )
}
