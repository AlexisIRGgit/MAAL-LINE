import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPage } from '@/components/info/info-page'
import { BouncyAccordion } from '@/components/ui/bouncy-accordion'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Preguntas frecuentes | MAAL LINE',
  description: 'Respuestas sobre pedidos, pagos, envíos, tallas, cambios y devoluciones en MAAL LINE.',
}

type Faq = { q: string; a: React.ReactNode }

const FAQ_GROUPS: { title: string; items: Faq[] }[] = [
  {
    title: 'Pedidos y pagos',
    items: [
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos tarjetas de crédito y débito Visa, Mastercard y American Express. El pago se procesa de forma segura con Stripe; nosotros nunca vemos ni guardamos los datos de tu tarjeta.',
      },
      {
        q: '¿Cómo sé que mi pedido se realizó?',
        a: 'Al confirmarse el pago verás la pantalla de confirmación con tu número de pedido. También puedes consultarlo en Mi cuenta → Pedidos.',
      },
      {
        q: '¿Puedo modificar o cancelar mi pedido?',
        a: (
          <>
            Sí, mientras no haya salido de nuestro almacén. Escríbenos lo antes posible a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> con tu número de pedido.
          </>
        ),
      },
      {
        q: '¿Necesito una cuenta para comprar?',
        a: 'Te recomendamos crear una: así puedes guardar tus direcciones, seguir tus pedidos y comprar más rápido.',
      },
    ],
  },
  {
    title: 'Envíos',
    items: [
      {
        q: '¿Hacen envíos a todo México?',
        a: 'Sí, enviamos a toda la República Mexicana. Por ahora no hacemos envíos internacionales.',
      },
      {
        q: '¿Cuánto cuesta el envío y cuánto tarda?',
        a: (
          <>
            Depende del método que elijas al pagar. Consulta los costos y tiempos actualizados en{' '}
            <Link href="/envios">Envíos y devoluciones</Link>.
          </>
        ),
      },
      {
        q: '¿Cómo rastreo mi pedido?',
        a: 'Cuando tu pedido sale te enviamos un correo con la paquetería y el número de rastreo. También lo ves en Mi cuenta → Pedidos.',
      },
    ],
  },
  {
    title: 'Tallas y productos',
    items: [
      {
        q: '¿Cómo quedan las prendas?',
        a: 'Nuestro corte es oversize: holgado y con caída. Si prefieres un ajuste más cercano al cuerpo, te recomendamos pedir una talla menos de la que usas normalmente.',
      },
      {
        q: '¿Cómo cuido mis prendas?',
        a: 'Lava a mano o en ciclo delicado con agua fría, del revés y sin blanqueador. Seca a la sombra y no planches sobre los estampados.',
      },
      {
        q: '¿Van a volver a sacar un producto agotado?',
        a: 'Algunos drops son de edición limitada y no se reponen. Síguenos en Instagram para enterarte de los restocks y nuevos lanzamientos.',
      },
    ],
  },
  {
    title: 'Cambios y devoluciones',
    items: [
      {
        q: '¿Puedo cambiar de talla?',
        a: 'Sí, dentro de los 15 días naturales siguientes a la entrega, con la prenda sin usar y con etiquetas. Está sujeto a disponibilidad.',
      },
      {
        q: '¿Cómo hago una devolución?',
        a: (
          <>
            Escríbenos a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> con tu número de pedido y el motivo. Te
            mandamos las instrucciones. Más detalles en <Link href="/envios">Envíos y devoluciones</Link>.
          </>
        ),
      },
      {
        q: '¿Mi pedido llegó dañado o incorrecto, qué hago?',
        a: 'Escríbenos dentro de las 48 horas siguientes a la entrega con fotos del paquete y de la prenda. Lo resolvemos sin costo para ti.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="Ayuda"
      title="Preguntas frecuentes"
      intro="Lo que más nos preguntan sobre pedidos, envíos, tallas y devoluciones."
      current="/faq"
    >
      {FAQ_GROUPS.map((group) => (
        <section key={group.title}>
          <h2 className="font-display text-lg md:text-xl font-semibold text-[#111827] mb-3">{group.title}</h2>
          <BouncyAccordion
            items={group.items.map((item, index) => ({ id: `${group.title}-${index}`, title: item.q, description: item.a }))}
            classNames={{
              item: 'ring-1 ring-black/[0.06] dark:ring-white/[0.08] dark:bg-[#17191F]',
              description:
                '[&_a]:text-[#111827] [&_a]:underline [&_a]:underline-offset-2 dark:[&_a]:text-[#F5F5F5]',
            }}
          />
        </section>
      ))}
    </InfoPage>
  )
}
