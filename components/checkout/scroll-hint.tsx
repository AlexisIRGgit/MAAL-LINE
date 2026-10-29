'use client'

import { useEffect, useState, type RefObject } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

// Font Awesome's "jello": a wobble that settles, then a pause before the next one
const JELLO = [0, -12.5, 6.25, -3.125, 1.5625, -0.78125, 0.390625, -0.1953125, 0]

/**
 * Small arrow at the bottom of a scroll area while there is more content below.
 * Tapping it scrolls down; it fades out once the end is reached.
 */
export function ScrollHint({ target }: { target: RefObject<HTMLElement> }) {
  const [more, setMore] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = target.current
    if (!el) return
    const check = () => setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 24)
    check()
    el.addEventListener('scroll', check, { passive: true })
    // Content changes size when steps switch, items are removed or a coupon row appears
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null
    observer?.observe(el)
    Array.from(el.children).forEach((child) => observer?.observe(child))
    const mutations = new MutationObserver(() => {
      check()
      Array.from(el.children).forEach((child) => observer?.observe(child))
    })
    mutations.observe(el, { childList: true, subtree: true })
    return () => {
      el.removeEventListener('scroll', check)
      observer?.disconnect()
      mutations.disconnect()
    }
  }, [target])

  return (
    <AnimatePresence>
      {more && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-16 items-end justify-center bg-gradient-to-t from-white via-white/70 to-transparent pb-2 dark:from-[#16181D] dark:via-[#16181D]/70"
        >
          <button
            type="button"
            aria-label="Ver más abajo"
            onClick={() => target.current?.scrollBy({ top: target.current.clientHeight * 0.7, behavior: 'smooth' })}
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] shadow-[0_6px_16px_-8px_rgba(17,24,39,0.35)] dark:border-white/10 dark:bg-[#22252C] dark:text-white"
          >
            <motion.span
              className="grid place-items-center"
              animate={reduce ? undefined : { skewX: JELLO, skewY: JELLO }}
              transition={{ duration: 0.9, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.9 }}
            >
              <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
            </motion.span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
