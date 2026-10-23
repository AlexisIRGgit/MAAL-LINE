'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Theme = 'light' | 'dark'

type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> }
}

/**
 * Theme state plus a toggle that reveals the new theme with a circle
 * growing from the element that triggered it (View Transitions API).
 */
export function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const reduceMotion = useReducedMotion() ?? false
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  const toggleTheme = useCallback(
    (origin?: HTMLElement | null) => {
      const next: Theme = resolvedTheme === 'dark' ? 'light' : 'dark'
      const root = document.documentElement
      const doc = document as DocumentWithViewTransition

      const applyTheme = () => {
        // Apply the class synchronously so the transition captures the new state;
        // next-themes then persists it and keeps its own state in sync
        root.classList.remove('light', 'dark')
        root.classList.add(next)
        root.style.colorScheme = next
        setTheme(next)
      }

      if (reduceMotion || !doc.startViewTransition) {
        applyTheme()
        return
      }

      const rect = origin?.getBoundingClientRect()
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
      const y = rect ? rect.top + rect.height / 2 : window.innerHeight
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

      root.style.setProperty('--theme-vt-x', `${x}px`)
      root.style.setProperty('--theme-vt-y', `${y}px`)
      root.style.setProperty('--theme-vt-r', `${radius}px`)
      root.dataset.themeVt = 'circle'

      const transition = doc.startViewTransition(applyTheme)
      transition.finished.finally(() => {
        delete root.dataset.themeVt
      })
    },
    [resolvedTheme, setTheme, reduceMotion]
  )

  return { isDark, mounted, toggleTheme }
}

export function ThemeToggleIcon({ isDark, className }: { isDark: boolean; className?: string }) {
  const reduceMotion = useReducedMotion()
  const Icon = isDark ? Sun : Moon

  return (
    <span className={cn('relative inline-flex items-center justify-center', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={isDark ? 'sun' : 'moon'}
          className="inline-flex"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: 'blur(2px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.25, filter: 'blur(2px)', transition: { duration: 0.16, ease: 'easeOut' } }}
          transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.6 }}
        >
          <Icon className={className} />
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function ThemeToggle({ className, iconClassName = 'w-5 h-5' }: { className?: string; iconClassName?: string }) {
  const { isDark, toggleTheme } = useThemeToggle()
  const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'

  return (
    <button
      type="button"
      onClick={(event) => toggleTheme(event.currentTarget)}
      aria-label={label}
      title={label}
      className={cn('flex items-center justify-center', className)}
    >
      <ThemeToggleIcon isDark={isDark} className={iconClassName} />
    </button>
  )
}
