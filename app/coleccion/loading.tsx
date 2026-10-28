import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { SkeletonBlock } from '@/components/ui/skeleton'

// Same frame as /coleccion so the grid fades in instead of the page jumping
export default function ShopAllLoading() {
  return (
    <>
      <PromoBar />
      <Navbar />
      <main className="bg-[#F9FAFB] min-h-screen" role="status" aria-label="Cargando productos" aria-busy="true">
        <section className="border-b border-[#E5E7EB] bg-white">
          <div className="container mx-auto px-4 py-12 md:py-16 space-y-4">
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock index={1} className="h-3 w-28" />
            <SkeletonBlock index={2} className="h-10 w-72 max-w-full" />
            <SkeletonBlock index={3} className="h-4 w-96 max-w-full" />
            <div className="flex gap-2 pt-4">
              {[0, 1, 2].map((chip) => (
                <SkeletonBlock key={chip} index={chip + 3} className="h-8 w-28 rounded-full" />
              ))}
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <SkeletonBlock className="mb-6 h-3 w-20" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }, (_, card) => (
                <div key={card} className="space-y-3">
                  <SkeletonBlock index={card % 4} className="aspect-[4/5] w-full rounded-[22px]" />
                  <SkeletonBlock index={(card % 4) + 1} className="h-3.5 w-3/4" />
                  <SkeletonBlock index={(card % 4) + 2} className="h-3.5 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
