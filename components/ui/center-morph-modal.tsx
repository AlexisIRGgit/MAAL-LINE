'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useModalA11y } from '@/hooks/use-modal-a11y'

// The panel unfolds from the center by animating its clip-path. A tween (not a spring)
// keeps the rounded clip string from snapping at the end of the animation.
const FOLDED_CLIP = 'inset(48% 48% 48% 48% round 30px)'
const OPEN_CLIP = 'inset(0% 0% 0% 0% round 30px)'
const UNFOLD_TRANSITION = { duration: 0.43, ease: [0.2, 0, 0.2, 1] } as const
const EASE_OUT = [0.16, 1, 0.3, 1] as const

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useModalA11y({ open, panelRef, onClose, returnFocusRef })

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
            className="fixed inset-0 z-[400] cursor-default bg-black/20 dark:bg-black/60 backdrop-blur-sm"
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
                // Dark: a lifted slate so the panel separates clearly from the page behind it
                'dark:bg-[#22252D] dark:border-white/10 dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.8)]',
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
                className="absolute right-4 top-4 z-10 h-9 w-9 flex items-center justify-center rounded-full text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] dark:hover:bg-white/10 transition-colors"
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
