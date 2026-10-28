'use client'

import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { HelpTabs } from '@/components/info/help-tabs'
import { Skeleton, SkeletonBlock } from '@/components/ui/skeleton'

type HelpMeta = { eyebrow: string; title: string; intro: string; updated?: string }

// Header copy per help page; it lives here so the header can cross-fade instead of remounting with the page
const HELP_META: Record<string, HelpMeta> = {
  '/envios': {
    eyebrow: 'Ayuda',
    title: 'Envíos y devoluciones',
    intro:
      'Todo nuestro equipo está en stock en Guadalajara, Jalisco, así que tu pedido sale rápido. Aquí encuentras los tiempos de entrega, los costos y cómo hacer un cambio o una devolución.',
  },
  '/faq': {
    eyebrow: 'Ayuda',
    title: 'Preguntas frecuentes',
    intro: 'Lo que más nos preguntan sobre pedidos, envíos, cuidado del equipo y devoluciones.',
  },
  '/terminos': {
    eyebrow: 'Legal',
    title: 'Términos y condiciones',
    intro: 'Al navegar o comprar en maalline.com aceptas estos términos. Te pedimos leerlos con atención.',
    updated: '28 de octubre de 2026',
  },
  '/privacidad': {
    eyebrow: 'Legal',
    title: 'Aviso de privacidad',
    intro:
      'Tu privacidad nos importa. Aquí te explicamos qué datos recabamos, para qué los usamos y cómo puedes ejercer tus derechos.',
    updated: '28 de octubre de 2026',
  },
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const

/**
 * Persistent frame for the help pages: header, tabs and the page body. Only the copy changes
 * between pages, swapping with a short blur-fade (like uiarc's empty states) instead of a full reload.
 */
export function HelpShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const meta = HELP_META[pathname] ?? HELP_META['/envios']

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8, filter: 'blur(6px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -6, filter: 'blur(6px)' },
      }

  return (
    <>
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              {...swap}
              transition={{ duration: 0.22, ease: EASE_OUT }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF3D00]">{meta.eyebrow}</p>
              <h1 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-[#111827]">{meta.title}</h1>
              <p className="mt-4 text-base md:text-lg leading-relaxed text-[#6B7280]">{meta.intro}</p>
              {meta.updated && <p className="mt-4 text-xs text-[#9CA3AF]">Última actualización: {meta.updated}</p>}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <div className="container mx-auto px-4 pt-12 md:pt-16 max-w-3xl">
        <div className="mb-10">
          <HelpTabs current={pathname} />
        </div>
        {/* Router children can't play an exit, so the new page only blurs in */}
        <motion.div
          key={pathname}
          initial={swap.initial}
          animate={swap.animate}
          transition={{ duration: 0.32, ease: EASE_OUT, delay: reduce ? 0 : 0.06 }}
          className="space-y-10"
        >
          {children}
        </motion.div>
      </div>
    </>
  )
}

/** Placeholder shown while a help page streams in (app/(ayuda)/loading.tsx) */
export function HelpContentSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton lines={4} label="Cargando página" />
      <div className="grid gap-2">
        {[0, 1, 2].map((row) => (
          <SkeletonBlock key={row} index={row + 4} className="h-[68px] w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton lines={3} />
      <Skeleton lines={5} />
    </div>
  )
}
