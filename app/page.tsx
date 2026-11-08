// ISR - Revalidate every 5 minutes for fresh product data while caching
export const revalidate = 300

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { WaitlistForm } from '@/components/drop/waitlist-form'
import { DotGrid } from '@/components/ui/dot-grid'
import { InViewTitle } from '@/components/ui/in-view-title'
import { TextReveal } from '@/components/ui/text-reveal'
import { HeroCarousel } from '@/components/home/hero-carousel'
import { PackagingBags } from '@/components/home/packaging-bags'
import { getNewArrivals, getBestSellers } from '@/lib/queries/products'
import { getActiveCategories } from '@/lib/queries/categories'
import { transformProductsForCards } from '@/lib/transformers/product'

// What sets the brand apart, shown in the hero
const VALUE_PROPS = [
  ['Envío mismo día', 'Guadalajara'],
  ['2–5 días', 'Resto de México'],
  ['Stock propio', 'Calidad premium'],
]

export default async function HomePage() {
  // Fetch data from database
  const [newArrivalsRaw, bestSellersRaw, dbCategories] = await Promise.all([
    getNewArrivals(4),
    getBestSellers(4),
    getActiveCategories(),
  ])

  // Empty sections are hidden rather than filled with placeholder products
  const newArrivals = transformProductsForCards(newArrivalsRaw)
  const bestSellers = transformProductsForCards(bestSellersRaw)
  const heroImage = newArrivals[0]?.images[0] ?? '/images/LogoMAAL-blanco.png'

  const categories = dbCategories.map((cat, index) => ({
    slug: cat.slug,
    name: cat.name.toUpperCase(),
    image: cat.imageUrl || heroImage,
    large: index === 0,
    wide: index === 3,
  }))

  return (
    <>
      <PromoBar />
      <Navbar />

      <main className="overflow-hidden bg-[#F9FAFB]">
        {/* HERO - Photos always dark, so its colors stay fixed in every theme */}
        <section className="relative flex min-h-[calc(100svh-81px)] items-end">
          <HeroCarousel />

          {/* Doesn't catch touches, so the photo underneath can still be swiped */}
          <div className="container pointer-events-none relative z-10 mx-auto px-4 pb-14 pt-32 md:pb-16">
            <h1
              className="text-[clamp(1.75rem,8.6vw,4.5rem)] font-bold leading-[1.1] tracking-normal"
              style={{ color: '#fff' }}
            >
              <span className="block">MAAL</span>
              <span className="block">PERFORMANCE GEAR</span>
            </h1>

            <p className="mt-4 max-w-xl text-base md:text-xl" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Ropa urbana de alto rendimiento. Diseñada para entrenar, pensada para tu estilo.
            </p>

            <div className="pointer-events-auto mt-7 flex w-fit max-w-full flex-wrap gap-3">
              <Link
                href="/coleccion"
                className="inline-flex h-12 items-center gap-2 rounded-lg px-4 text-xs font-bold tracking-[0.08em] md:h-14 md:px-7 md:text-sm transition-opacity hover:opacity-85"
                style={{ backgroundColor: '#fff', color: '#0A0A0A' }}
              >
                COMPRAR AHORA
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/coleccion"
                className="inline-flex h-12 items-center rounded-lg border px-4 text-xs font-bold tracking-[0.08em] md:h-14 md:px-7 md:text-sm transition-colors hover:bg-[rgba(255,255,255,0.1)]"
                style={{ borderColor: 'rgba(255, 255, 255, 0.7)', color: '#fff' }}
              >
                VER COLECCIÓN
              </Link>
            </div>

            <ul className="mt-6 grid grid-cols-3 gap-2 md:flex md:w-fit md:gap-3">
              {VALUE_PROPS.map(([title, detail]) => (
                <li
                  key={title}
                  className="flex items-center gap-2 rounded-xl border px-2.5 py-2 text-[11px] font-medium leading-snug backdrop-blur-sm md:gap-3 md:px-4 md:py-2.5 md:text-sm"
                  style={{ backgroundColor: 'rgba(10, 14, 22, 0.6)', borderColor: 'rgba(255, 255, 255, 0.25)', color: '#fff' }}
                >
                  <Check className="hidden h-4 w-4 flex-shrink-0 sm:block" />
                  <span>
                    <span className="block">{title}<span className="hidden md:inline"> •</span></span>
                    <span className="block">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* MARQUEE */}
        <section className="py-4 bg-[#111827] overflow-hidden">
          <div className="marquee-container">
            <div className="marquee-content whitespace-nowrap">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="inline-flex items-center gap-8 mx-8">
                  <span className="text-white font-black text-sm tracking-[0.2em]">PERFORMANCE GEAR</span>
                  <span className="text-white/30">✦</span>
                  <span className="text-white font-black text-sm tracking-[0.2em]">LIFTING STRAPS</span>
                  <span className="text-white/30">✦</span>
                  <span className="text-white font-black text-sm tracking-[0.2em]">RUNNING VESTS</span>
                  <span className="text-white/30">✦</span>
                  <span className="text-white font-black text-sm tracking-[0.2em]">MAAL LINE</span>
                  <span className="text-white/30">✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* NEW ARRIVALS SECTION */}
        {newArrivals.length > 0 && (
        <section className="py-20 md:py-28 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="inline-block px-4 py-2 bg-[#111827] text-white text-[10px] font-bold tracking-[0.2em] rounded-full mb-4">
                  LO NUEVO
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-[#111827]">
                  NEW <span className="text-[#6B7280]">ARRIVALS</span>
                </h2>
              </div>
              <Link href="/coleccion" className="hidden md:block">
                <Button variant="outline" size="sm">
                  VER TODO →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>

            <div className="mt-10 md:hidden">
              <Link href="/coleccion">
                <Button variant="outline" fullWidth>
                  VER TODO EL EQUIPO
                </Button>
              </Link>
            </div>
          </div>
        </section>

        )}

        {/* CATEGORIES GRID - Rounded Cards */}
        {categories.length > 0 && (
        <section className="py-20 md:py-28 bg-[#F9FAFB]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-[#111827]">
                SHOP BY <span className="text-[#6B7280]">CATEGORY</span>
              </h2>
              <p className="text-[#9CA3AF] mt-3 tracking-wider text-sm">Equipo para cada disciplina</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map(({ slug, name, image, large, wide }) => (
                <Link
                  key={slug}
                  href={`/coleccion/${slug}`}
                  className={`group relative overflow-hidden rounded-2xl border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
                    large ? 'md:col-span-2 md:row-span-2 aspect-square' :
                    wide ? 'md:col-span-2 aspect-[2/1]' : 'aspect-square'
                  }`}
                >
                  <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-all duration-700 group-hover:scale-110"
                  />

                  {/* Dark overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent group-hover:via-[#111827]/20 transition-all duration-500" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                    <span className="text-white font-black text-lg md:text-xl tracking-wider text-center mb-2">
                      {name}
                    </span>
                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      EXPLORAR →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        )}

        {/* BEST SELLERS SECTION */}
        {bestSellers.length > 0 && (
        <section className="py-20 md:py-28 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="inline-block px-4 py-2 border border-[#E5E7EB] text-[#111827] text-[10px] font-bold tracking-[0.2em] rounded-full mb-4">
                  TOP PICKS
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-[#111827]">
                  BEST <span className="text-[#6B7280]">SELLERS</span>
                </h2>
              </div>
              <Link href="/best-sellers" className="hidden md:block">
                <Button variant="outline" size="sm">
                  VER TODO →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-10 md:hidden">
              <Link href="/best-sellers">
                <Button variant="outline" fullWidth>
                  VER BEST SELLERS
                </Button>
              </Link>
            </div>
          </div>
        </section>

        )}

        {/* PACKAGING */}
        <section className="relative py-24 md:py-32 overflow-hidden border-t border-black/[0.06] bg-[#F7F7F8] dark:border-white/10 dark:bg-[#0B0B0D]">
          <div className="relative container mx-auto px-4">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="text-center lg:text-left">
                <span className="inline-block px-5 py-2 bg-white border border-black/10 text-[#374151] shadow-sm dark:bg-white/10 dark:backdrop-blur-sm dark:border-white/20 dark:text-white/80 dark:shadow-none text-xs font-bold tracking-[0.2em] rounded-full mb-6">
                  UNBOXING PREMIUM
                </span>
                <h2 className="text-3xl md:text-5xl font-body font-bold uppercase tracking-[0.04em] text-[#111827] dark:text-white mb-6">
                  ARMADO PARA LLEGAR
                </h2>
                <p className="text-[#6B7280] dark:text-white/60 max-w-xl mx-auto lg:mx-0 text-lg leading-relaxed">
                  Cada pedido sale en bolsa CPE negro mate esmerilado y en cilindro de cartón negro con nuestro logo en
                  serigrafía plata. Equipo de alto rendimiento, desde que lo abres.
                </p>
              </div>
              <PackagingBags />
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3 max-w-5xl mx-auto text-left lg:mt-14">
              {[
                { title: 'Bolsa CPE mate', text: 'Negro esmerilado, resistente y sellada.' },
                { title: 'Cilindro de cartón', text: 'Negro, con logo en serigrafía plata.' },
                { title: 'Desde Guadalajara', text: 'Stock propio, sale en 1–2 días hábiles.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
                  <p className="text-sm font-bold tracking-wider text-[#111827] dark:text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-[#6B7280] dark:text-white/55">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DROP 001 TEASER + WAITLIST */}
        <section className="relative overflow-hidden border-t border-black/[0.06] bg-white py-24 md:py-32 dark:border-white/10 dark:bg-[#0B0B0D]">
          <DotGrid adaptive />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-10 h-[360px] w-[620px] max-w-full -translate-x-1/2 rounded-full bg-[#F3F4F6] blur-3xl dark:bg-white/[0.05]"
          />
          <div className="relative container mx-auto px-4 text-center">
            <span className="inline-block rounded-full border border-black/10 bg-white px-5 py-2 text-xs font-bold tracking-[0.24em] text-[#374151] shadow-sm dark:border-white/20 dark:bg-white/10 dark:text-white/80 dark:shadow-none">
              CAPÍTULO 02 · PRÓXIMAMENTE
            </span>
            <InViewTitle text="DROP 001" className="mt-6 font-body font-bold uppercase tracking-[0.04em] text-5xl leading-none text-[#111827] dark:text-white md:text-7xl" />
            <TextReveal
              as="p"
              whileInView
              stagger={0.035}
              delay={0.25}
              text="Entrena primero. Viste después. Nuestra primera colección de ropa viene en camino. Únete a la lista y compra antes que nadie."
              className="mx-auto mt-6 mb-10 max-w-lg text-lg leading-relaxed text-[#6B7280] dark:text-white/60"
            />
            <WaitlistForm source="home" adaptive />
            <Link
              href="/drop"
              className="mt-8 inline-block text-xs font-bold tracking-[0.2em] text-[#6B7280] transition-colors hover:text-[#111827] dark:text-white/50 dark:hover:text-white"
            >
              SABER MÁS DEL DROP →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
