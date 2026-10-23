'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Home } from 'lucide-react'

const HALO_PERIOD = 2 // seconds per halo; two staggered halos give one every second

/** True while any modal dialog (side sheet, modals) is in the DOM. */
function useModalOpen() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const check = () => setOpen(!!document.querySelector('[aria-modal="true"]'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-modal'] })
    return () => observer.disconnect()
  }, [])

  return open
}

/** Mobile-only floating shortcut back to the store, with a soft pulsing halo. */
export function FloatingHomeButton() {
  const reduceMotion = useReducedMotion()
  const isModalOpen = useModalOpen()

  return (
    <AnimatePresence>
      {!isModalOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          className="lg:hidden fixed right-5 z-[200]"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}
        >
          {!reduceMotion &&
            [0, HALO_PERIOD / 2].map((delay) => (
              <motion.span
                key={delay}
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full bg-[#FF3D00]"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 1.6], opacity: [0.35, 0] }}
                transition={{ duration: HALO_PERIOD, delay, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
          <motion.div whileTap={reduceMotion ? undefined : { scale: 0.92 }}>
            <Link
              href="/"
              aria-label="Ir a la tienda"
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#FF3D00] text-white shadow-[0_8px_24px_-6px_rgba(255,61,0,0.55)] ring-1 ring-[#FF3D00]/40 ring-offset-2 ring-offset-[#F5F5F7] dark:ring-offset-[#0E0F13] outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Home className="w-6 h-6" />
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
