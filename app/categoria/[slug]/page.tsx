// Force dynamic rendering - database queries require runtime connection
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getProductsByCategory } from '@/lib/queries/products'
import { getCategoryBySlug } from '@/lib/queries/categories'
import { transformProductsForCards } from '@/lib/transformers/product'
import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { ProductCard } from '@/components/product/product-card'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return {
      title: 'Categoría no encontrada | MAAL LINE',
    }
  }

  return {
    title: `${category.name} | MAAL LINE`,
    description: category.description || `Explora nuestra colección de ${category.name} en MAAL LINE`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || '1')

  const { products: productsRaw, total, category, totalPages } = await getProductsByCategory(slug, page, 12)

  if (!category) {
    notFound()
  }

  const products = transformProductsForCards(productsRaw)

  return (
    <>
      <PromoBar />
      <Navbar />

      <main className="bg-[#0A0A0A] min-h-screen">
        {/* Header */}
        <section className="py-12 md:py-16 border-b border-[#E8E4D9]/10">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="text-xs text-[#E8E4D9]/50 mb-6">
              <Link href="/" className="hover:text-[#E8E4D9]">Inicio</Link>
              <span className="mx-2">/</span>
              <span className="text-[#E8E4D9]">{category.name}</span>
            </nav>

            <h1 className="text-4xl md:text-5xl font-black text-[#E8E4D9] uppercase tracking-wide">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-4 text-[#E8E4D9]/60 max-w-2xl">
                {category.description}
              </p>
            )}
            <p className="mt-4 text-sm text-[#E8E4D9]/40">
              {total} {total === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={index < 4}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {page > 1 && (
                      <Link
                        href={`/categoria/${slug}?page=${page - 1}`}
                        className="px-4 py-2 border border-[#E8E4D9]/30 text-[#E8E4D9] text-sm hover:bg-[#E8E4D9]/10 transition-colors"
                      >
                        Anterior
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/categoria/${slug}?page=${p}`}
                        className={`px-4 py-2 text-sm transition-colors ${
                          p === page
                            ? 'bg-[#E8E4D9] text-[#0A0A0A]'
                            : 'border border-[#E8E4D9]/30 text-[#E8E4D9] hover:bg-[#E8E4D9]/10'
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                    {page < totalPages && (
                      <Link
                        href={`/categoria/${slug}?page=${page + 1}`}
                        className="px-4 py-2 border border-[#E8E4D9]/30 text-[#E8E4D9] text-sm hover:bg-[#E8E4D9]/10 transition-colors"
                      >
                        Siguiente
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-[#E8E4D9]/50 text-lg">
                  No hay productos en esta categoría
                </p>
                <Link
                  href="/"
                  className="inline-block mt-6 px-6 py-3 bg-[#E8E4D9] text-[#0A0A0A] font-bold text-sm tracking-wider hover:bg-[#C9A962] transition-colors"
                >
                  VER TODOS LOS PRODUCTOS
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
