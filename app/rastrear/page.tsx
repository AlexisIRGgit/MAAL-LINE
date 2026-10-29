import type { Metadata } from 'next'
import { Navbar } from '@/components/navigation/navbar'
import { PromoBar } from '@/components/navigation/promo-bar'
import { Footer } from '@/components/navigation/footer'
import { DotGrid } from '@/components/ui/dot-grid'
import { OrderTracker } from '@/components/track/order-tracker'

export const metadata: Metadata = {
  title: 'Rastrear pedido | MAAL LINE',
  description: 'Consulta el estado de tu pedido de MAAL LINE con tu número de pedido.',
}

/** Order lookup for guest purchases; customers with an account see their orders in /cuenta/pedidos */
export default function TrackOrderPage({ searchParams }: { searchParams: { pedido?: string } }) {
  const initialOrder = typeof searchParams.pedido === 'string' ? searchParams.pedido.toUpperCase().slice(0, 30) : ''
  return (
    <>
      <PromoBar />
      <Navbar />
      <main className="min-h-screen bg-[#F7F7F8] dark:bg-[#0B0B0D]">
        <section className="relative overflow-hidden">
          <DotGrid adaptive />
          <div className="container relative mx-auto max-w-6xl px-4 pb-16 pt-14 md:pt-20">
            <div className="mb-8 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF3D00]">Compras como invitado</p>
              <h1 className="mt-3 font-body text-3xl font-bold tracking-tight text-[#111827] dark:text-white md:text-5xl">Rastrea tu pedido</h1>
              <p className="mx-auto mt-3 max-w-md text-[#6B7280] dark:text-white/60">
                Escribe el número que te dimos al pagar y los últimos 4 dígitos de tu teléfono.
              </p>
            </div>
            <OrderTracker initialOrder={initialOrder} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
