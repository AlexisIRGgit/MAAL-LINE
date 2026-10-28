// Shipping methods and prices come from the admin settings (cached, revalidated on save)
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { Truck } from 'lucide-react'
import { InfoPage, InfoSection } from '@/components/info/info-page'
import { getPublicStoreSettings } from '@/lib/public-store-settings'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Envíos y devoluciones | MAAL LINE',
  description: 'Métodos y costos de envío, tiempos de entrega, cambios y devoluciones en MAAL LINE.',
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
      intro="Enviamos a todo México. Aquí encuentras los costos, los tiempos de entrega y cómo hacer un cambio o una devolución."
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
          Preparamos tu pedido en un plazo de 1 a 2 días hábiles después de confirmar el pago. Los tiempos de cada método
          cuentan a partir de que el paquete sale de nuestro almacén y son en días hábiles (lunes a viernes, sin días
          festivos).
        </p>
        <p>
          Algunas zonas extendidas o de difícil acceso pueden tardar unos días más. Si eso ocurre con tu pedido, te
          avisamos.
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
          Tienes <strong>15 días naturales</strong> a partir de que recibes tu pedido para solicitar un cambio de talla o
          una devolución.
        </p>
        <ul>
          <li>La prenda debe estar sin usar, sin lavar y con sus etiquetas originales.</li>
          <li>No aceptamos cambios ni devoluciones de prendas con olor, manchas o señales de uso.</li>
          <li>Los cambios de talla están sujetos a disponibilidad.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Cómo solicitar un cambio o devolución">
        <ul>
          <li>
            Escríbenos a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> con tu número de pedido, la prenda y el
            motivo.
          </li>
          <li>Te respondemos con las instrucciones y la dirección para enviar el paquete.</li>
          <li>Cuando la recibimos, revisamos la prenda y te confirmamos el cambio o el reembolso.</li>
        </ul>
        <p>
          El envío de regreso corre por tu cuenta, salvo que el producto llegue dañado, con un defecto de fabricación o
          sea diferente al que pediste. En esos casos lo cubrimos nosotros.
        </p>
      </InfoSection>

      <InfoSection title="Reembolsos">
        <p>
          Una vez aprobada la devolución, reembolsamos el importe de la prenda al mismo método de pago que usaste. El
          banco puede tardar de 5 a 10 días hábiles en reflejarlo. El costo del envío original no es reembolsable,
          salvo en los casos de producto dañado, defectuoso o equivocado.
        </p>
      </InfoSection>

      <InfoSection title="Pedido dañado o incorrecto">
        <p>
          Si tu paquete llega dañado o con un producto equivocado, escríbenos dentro de las 48 horas siguientes a la
          entrega, con fotos del paquete y de la prenda, y lo resolvemos sin costo para ti.
        </p>
      </InfoSection>
    </InfoPage>
  )
}
