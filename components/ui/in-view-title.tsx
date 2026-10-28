'use client'
// uiarc.dev/components/in-view-title ("word" variant), adapted to framer-motion

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { motion, useInView, useReducedMotion, type Transition } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

const EASE_ENTER = [0.16, 1, 0.3, 1] as const
const EASE_STANDARD = [0.22, 1, 0.36, 1] as const
const EXIT_DURATION = 0.18
const WORD_STAGGER = 0.04

const subscribeHydration = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false
/** Matches the stylesheet fallback delay: if scripts arrive later, the title is already shown and stays put */
const FALLBACK_MS = 2400
const lateBoot = typeof window !== 'undefined' && performance.now() > FALLBACK_MS

/** Transform settles longest and opacity leads, so the text is readable before it has fully arrived */
function reveal(instant: boolean, visible: boolean, delay: number, settle = 0.8): Transition {
  if (instant) return { duration: 0 }
  if (!visible) return { duration: EXIT_DURATION, ease: EASE_STANDARD }
  return {
    y: { duration: settle, delay, ease: EASE_ENTER },
    opacity: { duration: settle * 0.56, delay, ease: EASE_STANDARD },
  }
}

/**
 * A title whose words each rise out of their own clip once it scrolls into view. Titles already above the
 * viewport show immediately, and server-rendered titles appear on their own if scripts are slow.
 */
export function InViewTitle({
  text,
  as: Tag = 'h2',
  className,
  id,
  once = true,
}: {
  text: string
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  id?: string
  once?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, amount: 0.45 })
  const [passed, setPassed] = useState(false)
  useEffect(() => {
    if (inView || passed) return
    const revealPassedTitle = () => {
      if (ref.current && ref.current.getBoundingClientRect().top < 0) setPassed(true)
    }
    revealPassedTitle()
    window.addEventListener('scroll', revealPassedTitle, { passive: true })
    return () => window.removeEventListener('scroll', revealPassedTitle)
  }, [inView, passed])
  const prefersReduced = useReducedMotion()
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot)
  const [serverRendered] = useState(!hydrated)
  const reduced = hydrated && prefersReduced
  const late = hydrated && serverRendered && lateBoot
  const visible = reduced || late || inView || passed
  const instant = Boolean(reduced || late)
  const words = text.split(' ').filter(Boolean)
  const step = Math.min(WORD_STAGGER * 1.5, 0.4 / Math.max(words.length, 1))

  return (
    <div ref={ref} className={cn('min-w-0', !hydrated && 'in-view-title-pending')}>
      {/* Classes go on the heading itself so global h1/h2 styles don't override them */}
      <Tag id={id} aria-label={text} className={className}>
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            {/* The clip hides the rise; padding with matching negative margins leaves room for descenders */}
            <span aria-hidden="true" className="inline-block overflow-hidden align-top px-[.14em] pt-[.08em] pb-[.2em] -mx-[.14em] -mt-[.08em] -mb-[.2em]">
              <motion.span
                className="in-view-title-part inline-block"
                initial={false}
                animate={visible ? { y: '0em', opacity: 1 } : { y: '0.9em', opacity: 0 }}
                transition={reveal(instant, visible, index * step)}
              >
                {word}
              </motion.span>
            </span>
            {index < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </Tag>
    </div>
  )
}

export default InViewTitle
