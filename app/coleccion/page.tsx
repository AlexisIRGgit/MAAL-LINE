// Force dynamic rendering - database queries require runtime connection
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllProducts, searchProducts } from '@/lib/queries/products'
import { transformProductsForCards } from '@/lib/transformers/product'
import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { ProductCard } from '@/components/product/product-card'

export const metadata: Metadata = {
  title: 'Todo el equipo | MAAL LINE',
  description: 'Lifting straps, chalecos de running e hidratación y todo el performance gear de MAAL LINE.',
}

// Quick filters over name, description and tags
const FILTERS = [
  { q: '', label: 'Todo' },
  { q: 'strap', label: 'Lifting Straps' },
  { q: 'chaleco', label: 'Chalecos de running' },
]

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function ShopAllPage({ searchParams }: Props) {
  const { page: pageParam, q: rawQuery } = await searchParams
  const page = Math.max(1, parseInt(pageParam || '1') || 1)
  const query = (rawQuery ?? '').trim().slice(0, 60)

  const { products: productsRaw, total, totalPages } = query
    ? await searchProducts(query, page, 12)
    : await getAllProducts(page, 12)
  const products = transformProductsForCards(productsRaw)
  const pageHref = (p: number) => `/coleccion?${new URLSearchParams({ ...(query && { q: query }), page: String(p) })}`

  return (
    <>
      <PromoBar />
      <Navbar />

      <main className="bg-[#F9FAFB] min-h-screen">
        <section className="border-b border-[#E5E7EB] bg-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <nav className="text-xs text-[#9CA3AF] mb-6">
              <Link href="/" className="hover:text-[#111827]">Inicio</Link>
              <span className="mx-2">/</span>
              <span className="text-[#111827]">Todo el equipo</span>
            </nav>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF3D00]">Performance gear</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">Todo el equipo</h1>
            <p className="mt-4 max-w-2xl text-[#6B7280]">
              Lifting straps y chalecos de running e hidratación. Stock propio en Guadalajara.
            </p>

            <div className="mt-8 -mx-4 px-4 flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((filter) => {
                const active = filter.q.toLowerCase() === query.toLowerCase()
                return (
                  <Link
                    key={filter.label}
                    href={filter.q ? `/coleccion?q=${filter.q}` : '/coleccion'}
                    aria-current={active ? 'page' : undefined}
                    className={
                      active
                        ? 'flex-shrink-0 rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white'
                        : 'flex-shrink-0 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:border-[#111827] transition-colors'
                    }
                  >
                    {filter.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <p className="mb-6 text-sm text-[#9CA3AF]">
              {total} {total === 1 ? 'producto' : 'productos'}
            </p>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 4} />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-[#E5E7EB] bg-white px-6 py-16 text-center">
                <p className="text-lg font-medium text-[#111827]">Todavía no hay productos aquí</p>
                <p className="mt-1 text-sm text-[#6B7280]">Muy pronto. Mientras, revisa el resto del equipo.</p>
                <Link
                  href="/coleccion"
                  className="mt-6 inline-flex rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1F2937] transition-colors"
                >
                  Ver todo el equipo
                </Link>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={
                      p === page
                        ? 'w-10 h-10 flex items-center justify-center rounded-xl bg-[#111827] text-sm font-semibold text-white'
                        : 'w-10 h-10 flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#374151] hover:border-[#111827] transition-colors'
                    }
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
