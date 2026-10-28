// Shipping methods and prices come from the admin settings (cached, revalidated on save)
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Truck } from 'lucide-react'
import { InfoPage, InfoSection } from '@/components/info/info-page'
import { getPublicStoreSettings } from '@/lib/public-store-settings'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Envíos y devoluciones | MAAL LINE',
  description: 'Envíos desde Guadalajara: mismo día o día siguiente en la ZMG y de 2 a 5 días hábiles en todo México. Cambios y devoluciones.',
}

const formatMXN = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)

export default async function ShippingPage() {
  const { shipping } = await getPublicStoreSettings()
  const methods = shipping.methods.filter((method) => method.enabled)
  const threshold = shipping.freeShippingThreshold

  return (
    <InfoPage
      eyebrow="Ayuda"
      title="Envíos y devoluciones"
      intro="Todo nuestro equipo está en stock en Guadalajara, Jalisco, así que tu pedido sale rápido. Aquí encuentras los tiempos de entrega, los costos y cómo hacer un cambio o una devolución."
      current="/envios"
    >
      <InfoSection title="Métodos y costos de envío">
        <p>El costo se calcula al finalizar tu compra, según el método que elijas:</p>
        <div className="not-prose grid gap-2 pt-1">
          {methods.map((method) => {
            const free = threshold !== null && method.freeEligible
            return (
              <div key={method.id} className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827]">{method.name}</p>
                  <p className="text-xs text-[#6B7280]">
                    {method.description}
                    {free && ` · Gratis en compras desde ${formatMXN(threshold)}`}
                  </p>
                </div>
                <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-[#111827]">{formatMXN(method.price)}</span>
              </div>
            )
          })}
        </div>
        {threshold !== null && methods.some((method) => method.freeEligible) && (
          <p>
            <strong>Envío gratis</strong> en compras desde {formatMXN(threshold)} con los métodos marcados.
          </p>
        )}
      </InfoSection>

      <InfoSection title="Tiempos de entrega">
        <p>
          No dependemos de proveedores externos ni de importaciones: enviamos desde nuestro propio almacén en
          Guadalajara. Preparamos tu pedido el mismo día hábil en que se confirma el pago o, a más tardar, al día
          siguiente.
        </p>
        <div className="grid gap-2 pt-1 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="text-sm font-semibold text-[#111827]">Zona Metropolitana de Guadalajara</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Mismo día o día siguiente, con mensajería local. Si confirmas tu pedido tarde, te llega al día siguiente.
            </p>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="text-sm font-semibold text-[#111827]">Resto de México</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              De 2 a 5 días hábiles con paqueterías nacionales, según tu código postal.
            </p>
          </div>
        </div>
        <p>
          Los días hábiles son de lunes a viernes, sin días festivos. Algunas zonas extendidas o de difícil acceso
          pueden tardar uno o dos días más; si es tu caso, te avisamos.
        </p>
      </InfoSection>

      <InfoSection title="Empaque">
        <p>
          Cada pedido sale en bolsa CPE negro mate esmerilado y dentro de un cilindro de cartón negro con nuestro logo
          en serigrafía plata, que protege tu equipo durante el envío.
        </p>
      </InfoSection>

      <InfoSection title="Rastreo de tu pedido">
        <p>
          Cuando tu pedido sale, te enviamos un correo con la paquetería y el número de rastreo. También puedes ver el
          estado de tus pedidos en <a href="/cuenta/pedidos">Mi cuenta → Pedidos</a>.
        </p>
      </InfoSection>

      <InfoSection title="Cambios y devoluciones">
        <p>
          Tienes <strong>15 días naturales</strong> a partir de que recibes tu pedido para solicitar un cambio o una
          devolución.
        </p>
        <ul>
          <li>El producto debe estar sin usar, limpio, con sus etiquetas y en su empaque original (bolsa y cilindro).</li>
          <li>
            No aceptamos cambios ni devoluciones de equipo con señales de uso, como desgaste en el grip, sudor, olor o
            manchas.
          </li>
          <li>Por higiene, los depósitos o bolsas de hidratación que ya se hayan llenado no tienen cambio.</li>
          <li>Los cambios de talla o modelo están sujetos a disponibilidad.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Cómo solicitar un cambio o devolución">
        <ul>
          <li>
            Escríbenos a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> con tu número de pedido, el producto y el
            motivo.
          </li>
          <li>Te respondemos con las instrucciones y la dirección para enviar el paquete.</li>
          <li>Cuando lo recibimos, revisamos el producto y te confirmamos el cambio o el reembolso.</li>
        </ul>
        <p>
          El envío de regreso corre por tu cuenta, salvo que el producto llegue dañado, con un defecto de fabricación o
          sea diferente al que pediste. En esos casos lo cubrimos nosotros.
        </p>
      </InfoSection>

      <InfoSection title="Reembolsos">
        <p>
          Una vez aprobada la devolución, reembolsamos el importe del producto al mismo método de pago que usaste. El
          banco puede tardar de 5 a 10 días hábiles en reflejarlo. El costo del envío original no es reembolsable,
          salvo en los casos de producto dañado, defectuoso o equivocado.
        </p>
      </InfoSection>

      <InfoSection title="Pedido dañado o incorrecto">
        <p>
          Si tu paquete llega dañado o con un producto equivocado, escríbenos dentro de las 48 horas siguientes a la
          entrega, con fotos del paquete y del producto, y lo resolvemos sin costo para ti.
        </p>
      </InfoSection>
    </InfoPage>
  )
}
