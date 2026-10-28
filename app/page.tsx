// ISR - Revalidate every 5 minutes for fresh product data while caching
export const revalidate = 300

import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getNewArrivals, getBestSellers } from '@/lib/queries/products'
import { getActiveCategories } from '@/lib/queries/categories'
import { transformProductsForCards } from '@/lib/transformers/product'

// What sets the brand apart, shown under the hero
const VALUE_PROPS = [
  { value: 'Mismo día', label: 'Entrega en GDL' },
  { value: '2–5 días', label: 'Resto de México' },
  { value: 'Stock', label: 'Propio' },
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
        {/* HERO SECTION - Modern Rounded */}
        <section className="relative min-h-[100svh] flex items-center">
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Content */}
              <div className="text-center lg:text-left">
                <span className="inline-block px-4 py-2 bg-white border border-[#E5E7EB] text-[#111827] text-xs font-bold tracking-wider rounded-full mb-8 shadow-sm">
                  PERFORMANCE GEAR · GUADALAJARA
                </span>

                {/* Title */}
                <h1 className="mb-8">
                  <span className="block text-6xl md:text-8xl lg:text-9xl font-gothic text-[#111827] leading-none tracking-wide">
                    MAAL
                  </span>
                  <span className="block text-lg sm:text-2xl md:text-3xl font-bold text-[#6B7280] tracking-[0.2em] sm:tracking-[0.3em] mt-2">
                    PERFORMANCE GEAR
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-[#6B7280] mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Lifting straps y chalecos de running hechos para entrenar duro. Equipo de alto rendimiento con stock propio y envío desde Guadalajara.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/coleccion">
                    <Button variant="primary" size="xl">
                      VER EQUIPO
                    </Button>
                  </Link>
                  <Link href="/envios">
                    <Button variant="secondary" size="xl">
                      ENVÍOS
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-3 sm:gap-6 mt-16 justify-center lg:justify-start">
                  {VALUE_PROPS.map((stat) => (
                    <div key={stat.label} className="text-center lg:text-left px-4 py-3 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
                      <p className="text-lg sm:text-2xl font-black text-[#111827] whitespace-nowrap">{stat.value}</p>
                      <p className="text-[10px] text-[#9CA3AF] tracking-wider uppercase">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Hero Image with rounded frame */}
              <div className="relative">
                <div className="relative aspect-[3/4] max-w-md mx-auto">
                  {/* Rounded frame */}
                  <div className="absolute -inset-3 bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB] rounded-3xl" />
                  <div className="absolute -inset-2 bg-white rounded-2xl shadow-lg" />

                  <div className="relative h-full overflow-hidden rounded-2xl">
                    <Image
                      src={heroImage}
                      alt="MAAL Line Performance Gear"
                      fill
                      priority
                      className="object-contain bg-[#F3F4F6]"
                    />
                    {/* Light overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-40" />
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -left-4 top-1/4 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E5E7EB] shadow-md">
                  <p className="text-sm font-bold text-[#111827] tracking-wider">✦ STOCK EN GDL</p>
                </div>
                <div className="absolute -right-4 bottom-1/4 px-4 py-3 bg-[#111827] backdrop-blur-sm rounded-2xl shadow-md">
                  <p className="text-sm font-bold text-white tracking-wider">ENVÍO MISMO DÍA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
            <div className="w-8 h-12 border-2 border-[#D1D5DB] rounded-full flex justify-center">
              <div className="w-1.5 h-3 bg-[#111827] mt-2 rounded-full animate-bounce" />
            </div>
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
        <section className="relative py-24 md:py-32 overflow-hidden bg-[#0B0B0D]">
          <div className="relative container mx-auto px-4 text-center">
            <span className="inline-block px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-bold tracking-[0.2em] rounded-full mb-6">
              UNBOXING PREMIUM
            </span>
            <h2 className="text-4xl md:text-6xl font-gothic text-white mb-6">
              ARMADO PARA LLEGAR
            </h2>
            <p className="text-white/60 max-w-xl mx-auto mb-12 text-lg leading-relaxed">
              Cada pedido sale en bolsa CPE negro mate esmerilado y en cilindro de cartón negro con nuestro logo en
              serigrafía plata. Equipo de alto rendimiento, desde que lo abres.
            </p>
            <div className="grid gap-3 sm:grid-cols-3 max-w-3xl mx-auto text-left">
              {[
                { title: 'Bolsa CPE mate', text: 'Negro esmerilado, resistente y sellada.' },
                { title: 'Cilindro de cartón', text: 'Negro, con logo en serigrafía plata.' },
                { title: 'Desde Guadalajara', text: 'Stock propio, sale en 1–2 días hábiles.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm font-bold tracking-wider text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-white/55">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER SECTION */}
        <section className="py-20 md:py-28 bg-[#F9FAFB] relative overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-2xl mx-auto bg-white border border-[#E5E7EB] rounded-3xl p-8 md:p-12 shadow-sm">
              <h2 className="text-3xl md:text-4xl font-black text-[#111827] mb-4">
                ÚNETE AL <span className="text-[#6B7280]">CREW</span>
              </h2>
              <p className="text-[#6B7280] mb-8 max-w-md mx-auto">
                Entérate primero de lanzamientos, restocks y promociones. Sin spam.
              </p>

              <form className="max-w-lg mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    required
                    className="flex-1 h-14 px-6 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-xl text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#111827] transition-colors tracking-wider"
                  />
                  <Button type="submit" size="lg">
                    SUSCRIBIR
                  </Button>
                </div>
              </form>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
