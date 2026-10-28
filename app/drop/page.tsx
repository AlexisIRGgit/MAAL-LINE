import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { WaitlistForm } from '@/components/drop/waitlist-form'

export const metadata: Metadata = {
  title: 'Drop 001 · Próximamente | MAAL LINE',
  description: 'La primera colección de ropa de MAAL LINE viene en camino. Únete a la lista de espera y compra antes que nadie.',
}

const CHAPTERS = [
  {
    number: '01',
    title: 'Equipo',
    status: 'Disponible',
    text: 'Lifting straps y chalecos de running con stock propio en Guadalajara. Aquí empieza MAAL.',
    href: '/coleccion',
    cta: 'Ver equipo',
  },
  {
    number: '02',
    title: 'Drop 001',
    status: 'Próximamente',
    text: 'Nuestra primera colección de ropa. Edición limitada, misma estética oscura e industrial.',
  },
]

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
            <div className="mt-12">
              <WaitlistForm source="drop" />
            </div>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="container mx-auto grid max-w-4xl gap-4 px-4 py-16 md:grid-cols-2 md:py-24">
            {CHAPTERS.map((chapter) => (
              <div key={chapter.number} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-gothic text-4xl text-white/90">{chapter.number}</span>
                  <span
                    className={
                      chapter.href
                        ? 'rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-emerald-300'
                        : 'rounded-full bg-[#FF3D00]/15 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-[#FF7A4D]'
                    }
                  >
                    {chapter.status.toUpperCase()}
                  </span>
                </div>
                <p className="mt-6 text-xl font-bold tracking-wide text-white">{chapter.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{chapter.text}</p>
                {chapter.href && (
                  <Link
                    href={chapter.href}
                    className="mt-6 inline-flex rounded-xl border border-white/20 px-5 py-2.5 text-xs font-bold tracking-[0.15em] text-white transition-colors hover:bg-white/10"
                  >
                    {chapter.cta?.toUpperCase()}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
