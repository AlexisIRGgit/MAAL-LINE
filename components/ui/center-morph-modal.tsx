'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// The panel unfolds from the center by animating its clip-path. A tween (not a spring)
// keeps the rounded clip string from snapping at the end of the animation.
const FOLDED_CLIP = 'inset(48% 48% 48% 48% round 30px)'
const OPEN_CLIP = 'inset(0% 0% 0% 0% round 30px)'
const UNFOLD_TRANSITION = { duration: 0.43, ease: [0.2, 0, 0.2, 1] } as const
const EASE_OUT = [0.16, 1, 0.3, 1] as const

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function CenterMorphModal({
  open,
  onClose,
  labelledBy,
  returnFocusRef,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  /** id of the element that names the dialog */
  labelledBy?: string
  /** Element to refocus on close. Safari doesn't focus buttons on click, so activeElement isn't enough */
  returnFocusRef?: React.RefObject<HTMLElement | null>
  className?: string
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  // Callers usually pass an inline onClose; keep the latest without re-running the open effect
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => setMounted(true), [])

  // Focus the first focusable element, trap Tab, close on Escape, lock scroll,
  // and return focus to whatever opened the modal
  useEffect(() => {
    if (!open) return
    restoreFocusTo.current = returnFocusRef?.current ?? (document.activeElement as HTMLElement | null)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current
      const first = panel?.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? panel)?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      restoreFocusTo.current?.focus()
    }
  }, [open, returnFocusRef])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            key="backdrop"
            type="button"
            tabIndex={-1}
            aria-label="Cerrar"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: reduceMotion ? 0.1 : 0.28, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.1 : 0.2, ease: EASE_OUT } }}
            className="fixed inset-0 z-[400] cursor-default bg-white/10 dark:bg-black/30 backdrop-blur-sm"
          />
          <div key="wrapper" className="fixed inset-4 z-[400] flex items-center justify-center pointer-events-none">
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={labelledBy}
              tabIndex={-1}
              initial={reduceMotion ? { opacity: 0, clipPath: OPEN_CLIP } : { clipPath: FOLDED_CLIP }}
              animate={
                reduceMotion
                  ? { opacity: 1, clipPath: OPEN_CLIP, transition: { duration: 0.14 } }
                  : { clipPath: OPEN_CLIP, transition: UNFOLD_TRANSITION }
              }
              exit={
                reduceMotion
                  ? { opacity: 0, transition: { duration: 0.14 } }
                  : { clipPath: FOLDED_CLIP, transition: UNFOLD_TRANSITION }
              }
              className={cn(
                'relative w-full max-w-[28rem] max-h-full overflow-y-auto pointer-events-auto rounded-[30px] border border-[#E5E7EB] bg-white shadow-2xl outline-none',
                className
              )}
            >
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: reduceMotion ? { duration: 0.12 } : { duration: 0.2, delay: 0.16, ease: EASE_OUT },
                }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.88, transition: { duration: 0.1 } }}
                className="absolute right-4 top-4 z-10 h-9 w-9 flex items-center justify-center rounded-full text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
