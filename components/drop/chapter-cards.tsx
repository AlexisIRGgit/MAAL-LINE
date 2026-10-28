'use client'

import Link from 'next/link'
import { ArrowUpRight, Dumbbell, Lock, Sparkles, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { WalletDecor, trackSpotlight } from '@/components/account/wallet-surface'

type Chapter = {
  number: string
  title: string
  status: string
  live: boolean
  text: string
  icon: LucideIcon
  tags: string[]
  href: string
  cta: string
}

const CHAPTERS: Chapter[] = [
  {
    number: '01',
    title: 'Equipo',
    status: 'Disponible',
    live: true,
    text: 'Lifting straps y chalecos de running con stock propio en Guadalajara. Aquí empieza MAAL.',
    icon: Dumbbell,
    tags: ['Lifting straps', 'Chalecos'],
    href: '/coleccion',
    cta: 'Ver equipo',
  },
  {
    number: '02',
    title: 'Drop 001',
    status: 'Próximamente',
    live: false,
    text: 'Nuestra primera colección de ropa. Edición limitada, misma estética oscura e industrial.',
    icon: Sparkles,
    tags: ['Edición limitada', 'Ropa'],
    href: '#lista',
    cta: 'Unirme a la lista',
  },
]

// Always dark: the drop page is a dark-only surface in both themes (wallet card family, charcoal instead of slate)
const SURFACE =
  'relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1A1C22] via-[#16181D] to-[#0F1014] text-white ring-1 ring-white/[0.08] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)]'

/** "Capítulo 01 / 02" cards for the drop page, styled after the beui wallet card */
export function ChapterCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {CHAPTERS.map((chapter) => (
        <Link
          key={chapter.number}
          href={chapter.href}
          onMouseMove={trackSpotlight}
          className={cn(
            SURFACE,
            'group block p-6 md:p-7 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3D00]/60'
          )}
        >
          <WalletDecor />
          {/* Top sheen, like light catching the card edge */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="relative flex items-start justify-between gap-4">
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl border',
                chapter.live
                  ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300 shadow-[0_0_18px_-6px_rgba(16,185,129,0.6)]'
                  : 'border-[#FF3D00]/30 bg-[#FF3D00]/10 text-[#FF7A4D] shadow-[0_0_18px_-6px_rgba(255,61,0,0.6)]'
              )}
            >
              <chapter.icon className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-white/80 ring-1 ring-white/10">
              <span className="relative flex h-1.5 w-1.5">
                {chapter.live && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                )}
                <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', chapter.live ? 'bg-emerald-400' : 'bg-[#FF3D00]')} />
              </span>
              {chapter.status.toUpperCase()}
            </span>
          </div>

          <div className="relative mt-8">
            <p className="text-[10px] font-semibold tracking-[0.24em] text-white/40">CAPÍTULO</p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-gothic text-5xl leading-none text-white">{chapter.number}</span>
              <span className="text-xl font-bold tracking-wide text-white">{chapter.title}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/55">{chapter.text}</p>
          </div>

          <div className="relative mt-7 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-5">
            <div className="flex flex-wrap gap-1.5">
              {chapter.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/60 ring-1 ring-white/[0.08]">
                  {tag}
                </span>
              ))}
            </div>
            <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-xs font-bold tracking-[0.12em] text-white">
              {!chapter.live && <Lock className="h-3.5 w-3.5 text-white/50" />}
              {chapter.cta.toUpperCase()}
              <ArrowUpRight className="h-4 w-4 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
