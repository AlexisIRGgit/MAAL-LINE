import type { Metadata } from 'next'
import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { WaitlistForm } from '@/components/drop/waitlist-form'
import { ChapterCards } from '@/components/drop/chapter-cards'

export const metadata: Metadata = {
  title: 'Drop 001 · Próximamente | MAAL LINE',
  description: 'La primera colección de ropa de MAAL LINE viene en camino. Únete a la lista de espera y compra antes que nadie.',
}

export default function DropPage() {
  return (
    <>
      <PromoBar />
      <Navbar />

      <main className="min-h-screen bg-[#0B0B0D] text-white">
        <section className="relative overflow-hidden">
          {/* Silver glow behind the title */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[680px] max-w-full -translate-x-1/2 rounded-full bg-white/[0.06] blur-3xl"
          />
          <div className="relative container mx-auto px-4 py-24 md:py-36 text-center">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-bold tracking-[0.24em] text-white/80">
              CAPÍTULO 02 · PRÓXIMAMENTE
            </span>
            <h1 className="mt-8 font-gothic text-7xl leading-none text-white md:text-9xl">DROP 001</h1>
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/60">
              Entrena primero. Viste después. Nuestra primera colección de ropa viene en camino, en edición limitada. Los
              de la lista compran antes que nadie.
            </p>
            <div id="lista" className="mt-12 scroll-mt-32">
              <WaitlistForm source="drop" />
            </div>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
            <ChapterCards />
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
