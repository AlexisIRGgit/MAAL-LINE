'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

const EASE_ENTER = [0.16, 1, 0.3, 1] as const

const BAGS = [
  {
    src: '/images/packaging/bolsa-zip.webp',
    alt: 'Bolsa con cierre negro mate con el logo de MAAL',
    width: 497,
    height: 667,
    rotate: -8,
    className: 'left-0 top-[9%] w-[50%]',
    delay: 0.08,
  },
  {
    src: '/images/packaging/bolsa-doypack.webp',
    alt: 'Bolsa resellable negro mate con el logo de MAAL',
    width: 604,
    height: 905,
    rotate: 6,
    className: 'right-0 top-[6%] w-[50%]',
    delay: 0,
  },
]

/** The two premium bags overlapping on a spotlight, which keeps black bags visible on the dark theme */
export function PackagingBags() {
  const reduced = useReducedMotion()

  return (
    <div className="relative mx-auto aspect-[10/9] w-full max-w-[600px]">
      <div
        aria-hidden
        className="absolute -inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgba(17,24,39,0.10),transparent)] dark:bg-[radial-gradient(closest-side,rgba(255,255,255,0.2),transparent)]"
      />
      <div
        aria-hidden
        className="absolute bottom-[3%] left-1/2 h-[7%] w-[72%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-2xl dark:bg-black/70"
      />
      {BAGS.map((bag) => (
        <motion.div
          key={bag.src}
          className={`absolute drop-shadow-[0_24px_32px_rgba(0,0,0,0.45)] dark:drop-shadow-[0_0_26px_rgba(255,255,255,0.16)] ${bag.className}`}
          // Only movement is animated, so the bags still show if scripts are slow
          initial={reduced ? { rotate: bag.rotate } : { rotate: 0, y: 48 }}
          whileInView={{ rotate: bag.rotate, y: 0 }}
          whileHover={reduced ? undefined : { y: -10 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: bag.delay, ease: EASE_ENTER }}
        >
          <Image
            src={bag.src}
            alt={bag.alt}
            width={bag.width}
            height={bag.height}
            sizes="(max-width: 640px) 50vw, 300px"
            className="h-auto w-full"
          />
        </motion.div>
      ))}
    </div>
  )
}
