// Force dynamic rendering - database queries require runtime connection
export const dynamic = 'force-dynamic'

import Image from 'next/image'
import Link from 'next/link'
import { getMercaditoProducts } from '@/lib/queries/products'
import { transformProductsForCards } from '@/lib/transformers/product'
import { MERCADITO_PATH, MERCADITO_TYPES } from '@/lib/brand'
import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { ProductCard } from '@/components/product/product-card'

interface Props {
  searchParams: Promise<{ page?: string; tipo?: string }>
}

export default async function MercaditoPage({ searchParams }: Props) {
  const { page: pageParam, tipo } = await searchParams
  const page = Math.max(1, parseInt(pageParam || '1') || 1)
  const type = MERCADITO_TYPES.find(({ tag }) => tag === tipo)

  const { products: productsRaw, total, totalPages } = await getMercaditoProducts(page, 12, type?.tag)
  const products = transformProductsForCards(productsRaw)
  const typeHref = (tag?: string) => (tag ? `${MERCADITO_PATH}?tipo=${tag}` : MERCADITO_PATH)
  const pageHref = (p: number) => `${MERCADITO_PATH}?${new URLSearchParams({ ...(type && { tipo: type.tag }), page: String(p) })}`
  const filters = [{ tag: undefined, label: 'Todo' }, ...MERCADITO_TYPES]

  return (
    <>
      <PromoBar />
      <Navbar />

      <main className="min-h-screen bg-white">
        <section className="border-b border-[#E5E7EB] bg-white">
          <div className="container mx-auto flex flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:py-14">
            <div className="min-w-0">
              <p className="font-cute text-sm font-semibold tracking-wide text-[#D6357D]">La marca hermana menor de MAAL</p>
              <h1 className="mt-2 font-cute text-4xl font-bold text-[#111827] md:text-5xl">
                El <span className="text-[#E8589C]">Mercadito</span> by MAAL
              </h1>
              <p className="mt-4 max-w-2xl text-[#6B7280]">
                Fin de temporada, piezas de colecciones pasadas, prototipos de prueba y prendas con detalles estéticos mínimos, junto con
                ropa con diseños plasmados, todo a un precio mucho más accesible.
              </p>
              <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1">
                {filters.map(({ tag, label }) => {
                  const active = tag === type?.tag
                  return (
                    <Link
                      key={label}
                      href={typeHref(tag)}
                      aria-current={active ? 'page' : undefined}
                      className={
                        active
                          ? 'flex-shrink-0 rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white'
                          : 'flex-shrink-0 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-medium text-[#6B7280] transition-colors hover:border-[#111827] hover:text-[#111827]'
                      }
                    >
                      {label}
                    </Link>
                  )
                })}
              </div>
            </div>
            <Image
              src="/images/mercadito/logo.png"
              alt=""
              width={220}
              height={161}
              priority
              className="hidden flex-shrink-0 object-contain md:block"
            />
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <p className="mb-6 text-sm text-[#9CA3AF]">
              {total} {total === 1 ? 'producto' : 'productos'}
            </p>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 4} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-[2rem] border border-[#E5E7EB] bg-white px-6 py-16 text-center">
                <Image src="/images/mercadito/face.png" alt="" width={64} height={64} className="mb-4 object-contain" />
                <p className="font-cute text-xl font-semibold text-[#111827]">Estamos acomodando el puesto</p>
                <p className="mt-1 text-sm text-[#6B7280]">Muy pronto habrá prendas aquí. Vuelve en unos días.</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={
                      p === page
                        ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] text-sm font-semibold text-white'
                        : 'flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#374151] transition-colors hover:border-[#111827]'
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
