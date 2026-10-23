'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useDragControls, useReducedMotion, type PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { useModalA11y } from '@/hooks/use-modal-a11y'

// Motion follows beui's bottom sheet (beui.dev/components/motion/bottom-sheet)
const DRAWER_EASE = [0.32, 0.72, 0, 1] as const
const DRAWER_TRANSITION = { duration: 0.5, ease: DRAWER_EASE } as const
const DISMISS_OFFSET = 120
const DISMISS_VELOCITY = 600

export function BottomSheet({
  open,
  onClose,
  labelledBy,
  returnFocusRef,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  labelledBy?: string
  returnFocusRef?: React.RefObject<HTMLElement | null>
  className?: string
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useModalA11y({ open, panelRef, onClose, returnFocusRef })

  const handleDragEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.velocity.y > DISMISS_VELOCITY || info.offset.y > DISMISS_OFFSET) onClose()
  }

  if (!mounted) return null

  const transition = reduceMotion ? { duration: 0.18, ease: DRAWER_EASE } : DRAWER_TRANSITION

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
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="fixed inset-0 z-[400] cursor-default bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            key="sheet"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={transition}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.4 }}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed inset-x-0 bottom-0 z-[400] mx-auto flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-3xl border border-b-0 border-[#E5E7EB] bg-white shadow-xl outline-none',
              'dark:bg-[#22252D] dark:border-white/10 dark:shadow-[0_-24px_80px_-12px_rgba(0,0,0,0.8)]',
              className
            )}
          >
            {/* Only the handle starts a drag, so content can scroll freely */}
            <div
              onPointerDown={(event) => dragControls.start(event)}
              className="flex flex-shrink-0 justify-center py-3 cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <span aria-hidden className="h-1.5 w-10 rounded-full bg-[#D1D5DB] dark:bg-white/20" />
            </div>
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
