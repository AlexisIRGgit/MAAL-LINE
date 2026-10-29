import type { Metadata } from 'next'
import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { WaitlistForm } from '@/components/drop/waitlist-form'
import { ChapterCards } from '@/components/drop/chapter-cards'
import { DotGrid } from '@/components/ui/dot-grid'
import { InViewTitle } from '@/components/ui/in-view-title'
import { TextReveal } from '@/components/ui/text-reveal'

export const metadata: Metadata = {
  title: 'Drop 001 · Próximamente | MAAL LINE',
  description: 'La primera colección de ropa de MAAL LINE viene en camino. Únete a la lista de espera y compra antes que nadie.',
}

export default function DropPage() {
  return (
    <>
      <PromoBar />
      <Navbar />

      <main className="min-h-screen bg-[#F7F7F8] text-[#111827] dark:bg-[#0B0B0D] dark:text-white">
        <section className="relative overflow-hidden">
          <DotGrid adaptive />
          {/* Soft glow behind the title (silver in dark mode) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[680px] max-w-full -translate-x-1/2 rounded-full bg-white blur-3xl dark:bg-white/[0.06]"
          />
          <div className="relative container mx-auto px-4 py-24 md:py-36 text-center">
            <span className="inline-block rounded-full border border-black/10 bg-white px-5 py-2 text-xs font-bold tracking-[0.24em] text-[#374151] shadow-sm dark:border-white/20 dark:bg-white/10 dark:text-white/80 dark:shadow-none">
              CAPÍTULO 02 · PRÓXIMAMENTE
            </span>
            <InViewTitle as="h1" text="DROP 001" className="mt-8 font-body font-bold uppercase tracking-[0.04em] text-6xl leading-none text-[#111827] dark:text-white md:text-8xl" />
            <TextReveal
              as="p"
              whileInView
              stagger={0.035}
              delay={0.25}
              text="Entrena primero. Viste después. Nuestra primera colección de ropa viene en camino, en edición limitada. Los de la lista compran antes que nadie."
              className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-[#6B7280] dark:text-white/60"
            />
            <div id="lista" className="mt-12 scroll-mt-32">
              <WaitlistForm source="drop" adaptive />
            </div>
          </div>
        </section>

        <section className="border-t border-black/[0.06] dark:border-white/10">
          <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
            <ChapterCards />
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
