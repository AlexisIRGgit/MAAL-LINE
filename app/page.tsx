// Force dynamic rendering - database queries require runtime connection
export const dynamic = 'force-dynamic'

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

// Fallback categories when database is empty
const FALLBACK_CATEGORIES = [
  {
    slug: 'longsleeves',
    name: 'LONGSLEEVES',
    image: '/images/IMG_3009.PNG',
    large: true,
  },
  {
    slug: 'tees',
    name: 'TEES',
    image: '/images/IMG_3008.PNG',
  },
  {
    slug: 'gothic',
    name: 'GOTHIC',
    image: '/images/IMG_3010.PNG',
  },
  {
    slug: 'new-drops',
    name: 'NEW DROPS',
    image: '/images/IMG_3009.PNG',
    wide: true,
  },
]

// Fallback products when database is empty
const FALLBACK_PRODUCTS = [
  {
    id: '1',
    slug: 'tee-maal-tribal-wings',
    name: 'Tee MAAL Tribal Wings',
    price: 699,
    compareAtPrice: 899,
    images: ['/images/IMG_3008.PNG', '/images/IMG_3009.PNG'],
    isNew: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: '2',
    slug: 'longsleeve-maal-dragon-wings',
    name: 'Longsleeve MAAL Dragon Wings',
    price: 899,
    images: ['/images/IMG_3009.PNG', '/images/IMG_3008.PNG'],
    isBestSeller: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: '3',
    slug: 'longsleeve-maal-gothic-cross',
    name: 'Longsleeve MAAL Gothic Cross',
    price: 899,
    images: ['/images/IMG_3010.PNG', '/images/IMG_3009.PNG'],
    isRestock: true,
    sizes: ['M', 'L', 'XL'],
  },
  {
    id: '4',
    slug: 'tee-maal-oversized-black',
    name: 'Tee MAAL Oversized Black',
    price: 699,
    images: ['/images/IMG_3008.PNG', '/images/IMG_3010.PNG'],
    isNew: true,
    sizes: ['S', 'M', 'L', 'XL'],
  },
]

export default async function HomePage() {
  // Fetch data from database
  const [newArrivalsRaw, bestSellersRaw, dbCategories] = await Promise.all([
    getNewArrivals(4),
    getBestSellers(4),
    getActiveCategories(),
  ])

  // Transform products for ProductCard component
  const newArrivals = newArrivalsRaw.length > 0
    ? transformProductsForCards(newArrivalsRaw)
    : FALLBACK_PRODUCTS

  const bestSellers = bestSellersRaw.length > 0
    ? transformProductsForCards(bestSellersRaw)
    : FALLBACK_PRODUCTS

  // Use database categories or fallback
  const categories = dbCategories.length > 0
    ? dbCategories.map((cat, index) => ({
        slug: cat.slug,
        name: cat.name.toUpperCase(),
        image: cat.imageUrl || '/images/IMG_3008.PNG',
        large: index === 0,
        wide: index === 3,
      }))
    : FALLBACK_CATEGORIES
  return (
    <>
      <PromoBar />
      <Navbar />

      <main className="overflow-hidden bg-[#0A0A0A]">
        {/* HERO SECTION - Modern Rounded */}
        <section className="relative min-h-[100svh] flex items-center">
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Content */}
              <div className="text-center lg:text-left">
                <span className="inline-block px-4 py-2 bg-[#1A1A1A] border border-[#2A2A2A] text-[#C9A962] text-xs font-bold tracking-wider rounded-full mb-8">
                  NEW DROP 2026
                </span>

                {/* Title */}
                <h1 className="mb-8">
                  <span className="block text-6xl md:text-8xl lg:text-9xl font-gothic text-[#E8E4D9] leading-none tracking-wide">
                    MAAL
                  </span>
                  <span className="block text-2xl md:text-3xl font-bold text-[#E8E4D9]/50 tracking-[0.3em] mt-2">
                    STREETWEAR
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-[#E8E4D9]/60 mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Oversized con actitud. Piezas statement para los que no piden permiso.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/coleccion">
                    <Button variant="primary" size="xl">
                      VER COLECCIÓN
                    </Button>
                  </Link>
                  <Link href="/lookbook">
                    <Button variant="secondary" size="xl">
                      LOOKBOOK
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-16 justify-center lg:justify-start">
                  {[
                    { value: '500+', label: 'Diseños' },
                    { value: '10K+', label: 'Clientes' },
                    { value: '24h', label: 'Express' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center lg:text-left px-4 py-3 bg-[#1A1A1A]/50 rounded-2xl border border-[#2A2A2A]">
                      <p className="text-2xl font-black text-[#E8E4D9]">{stat.value}</p>
                      <p className="text-[10px] text-[#E8E4D9]/40 tracking-wider uppercase">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Hero Image with rounded frame */}
              <div className="relative">
                <div className="relative aspect-[3/4] max-w-md mx-auto">
                  {/* Rounded frame */}
                  <div className="absolute -inset-3 bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] rounded-3xl" />
                  <div className="absolute -inset-2 bg-[#0A0A0A] rounded-2xl" />

                  <div className="relative h-full overflow-hidden rounded-2xl">
                    <Image
                      src="/images/IMG_3009.PNG"
                      alt="MAAL Line Streetwear"
                      fill
                      priority
                      className="object-contain bg-[#111]"
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -left-4 top-1/4 px-4 py-3 bg-[#1A1A1A]/90 backdrop-blur-sm rounded-2xl border border-[#2A2A2A]">
                  <p className="text-sm font-bold text-[#E8E4D9] tracking-wider">✦ TRENDING</p>
                </div>
                <div className="absolute -right-4 bottom-1/4 px-4 py-3 bg-[#1A1A1A]/90 backdrop-blur-sm rounded-2xl border border-[#2A2A2A]">
                  <p className="text-sm font-bold text-[#C9A962] tracking-wider">NEW DROP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
            <div className="w-8 h-12 border-2 border-[#E8E4D9]/30 rounded-full flex justify-center">
              <div className="w-1.5 h-3 bg-[#E8E4D9] mt-2 rounded-full animate-bounce" />
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <section className="py-4 bg-[#E8E4D9] overflow-hidden rounded-t-3xl">
          <div className="marquee-container">
            <div className="marquee-content whitespace-nowrap">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="inline-flex items-center gap-8 mx-8">
                  <span className="text-[#0A0A0A] font-black text-sm tracking-[0.2em]">STREETWEAR</span>
                  <span className="text-[#0A0A0A]/30">✦</span>
                  <span className="text-[#0A0A0A] font-black text-sm tracking-[0.2em]">OVERSIZED</span>
                  <span className="text-[#0A0A0A]/30">✦</span>
                  <span className="text-[#0A0A0A] font-black text-sm tracking-[0.2em]">PREMIUM</span>
                  <span className="text-[#0A0A0A]/30">✦</span>
                  <span className="text-[#0A0A0A] font-black text-sm tracking-[0.2em]">MAAL LINE</span>
                  <span className="text-[#0A0A0A]/30">✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* NEW DROPS SECTION */}
        <section className="py-20 md:py-28 bg-[#0A0A0A] relative">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="inline-block px-4 py-2 bg-[#E8E4D9] text-[#0A0A0A] text-[10px] font-bold tracking-[0.2em] rounded-full mb-4">
                  JUST DROPPED
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-[#E8E4D9]">
                  NEW <span className="text-[#C9A962]">ARRIVALS</span>
                </h2>
              </div>
              <Link href="/drops" className="hidden md:block">
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
              <Link href="/drops">
                <Button variant="outline" fullWidth>
                  VER TODOS LOS DROPS
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CATEGORIES GRID - Rounded Cards */}
        <section className="py-20 md:py-28 bg-[#111111]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-[#E8E4D9]">
                SHOP BY <span className="text-[#C9A962]">CATEGORY</span>
              </h2>
              <p className="text-[#E8E4D9]/40 mt-3 tracking-wider text-sm">Encuentra tu estilo</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map(({ slug, name, image, large, wide }) => (
                <Link
                  key={slug}
                  href={`/coleccion/${slug}`}
                  className={`group relative overflow-hidden rounded-2xl border border-[#2A2A2A] hover:border-[#3A3A3A] transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
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

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent group-hover:via-[#0A0A0A]/20 transition-all duration-500" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                    <span className="text-[#E8E4D9] font-black text-lg md:text-xl tracking-wider text-center mb-2">
                      {name}
                    </span>
                    <span className="px-4 py-1.5 bg-[#E8E4D9]/10 backdrop-blur-sm rounded-full text-[#E8E4D9]/70 text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      EXPLORAR →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* BEST SELLERS SECTION */}
        <section className="py-20 md:py-28 bg-[#0A0A0A] relative">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="inline-block px-4 py-2 border border-[#E8E4D9]/50 text-[#E8E4D9] text-[10px] font-bold tracking-[0.2em] rounded-full mb-4">
                  TOP PICKS
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-[#E8E4D9]">
                  BEST <span className="text-[#C9A962]">SELLERS</span>
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

        {/* LOOKBOOK PREVIEW */}
        <section className="relative py-32 md:py-40 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <Image
              src="/images/IMG_3010.PNG"
              alt="Lookbook"
              fill
              className="object-contain bg-[#0A0A0A]"
            />
            <div className="absolute inset-0 bg-[#0A0A0A]/80" />
          </div>

          <div className="relative container mx-auto px-4 text-center">
            <span className="inline-block px-5 py-2 bg-[#1A1A1A]/80 backdrop-blur-sm border border-[#2A2A2A] text-[#E8E4D9]/60 text-xs font-bold tracking-[0.2em] rounded-full mb-6">
              FALL/WINTER 2026
            </span>
            <h2 className="text-5xl md:text-7xl font-gothic text-[#E8E4D9] mb-6">
              LOOKBOOK
            </h2>
            <p className="text-[#E8E4D9]/50 max-w-md mx-auto mb-10 text-lg">
              Descubre las piezas de la temporada. Editorial street con actitud.
            </p>
            <Link href="/lookbook">
              <Button variant="primary" size="xl">
                EXPLORAR LOOKBOOK
              </Button>
            </Link>
          </div>
        </section>

        {/* NEWSLETTER SECTION */}
        <section className="py-20 md:py-28 bg-[#111111] relative overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-2xl mx-auto bg-[#1A1A1A] border border-[#2A2A2A] rounded-3xl p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-black text-[#E8E4D9] mb-4">
                ÚNETE AL <span className="text-[#C9A962]">CREW</span>
              </h2>
              <p className="text-[#E8E4D9]/50 mb-8 max-w-md mx-auto">
                Acceso anticipado a drops, restocks y contenido exclusivo. Sin spam.
              </p>

              <form className="max-w-lg mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    required
                    className="flex-1 h-14 px-6 bg-[#0A0A0A] border-2 border-[#2A2A2A] rounded-xl text-[#E8E4D9] placeholder:text-[#E8E4D9]/30 focus:outline-none focus:border-[#E8E4D9] transition-colors tracking-wider"
                  />
                  <Button type="submit" size="lg">
                    SUSCRIBIR
                  </Button>
                </div>
              </form>

              <p className="text-[#E8E4D9]/30 text-xs mt-8 tracking-wider">
                +10,000 PERSONAS YA SON PARTE DEL CREW
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
