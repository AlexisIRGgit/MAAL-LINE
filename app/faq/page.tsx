import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPage } from '@/components/info/info-page'
import { BouncyAccordion } from '@/components/ui/bouncy-accordion'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Preguntas frecuentes | MAAL LINE',
  description: 'Respuestas sobre pedidos, envíos desde Guadalajara, cuidado de lifting straps y chalecos, cambios y devoluciones.',
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
    title: 'Envíos y entregas',
    items: [
      {
        q: '¿Desde dónde envían?',
        a: 'Desde nuestro propio almacén en Guadalajara, Jalisco. Tenemos el equipo en stock, así que no esperas importaciones ni proveedores externos.',
      },
      {
        q: '¿Cuánto tarda en llegar mi pedido?',
        a: (
          <>
            En la Zona Metropolitana de Guadalajara te llega el mismo día o al día siguiente. Al resto de México, de 2 a 5
            días hábiles. Costos y detalles en <Link href="/envios">Envíos y devoluciones</Link>.
          </>
        ),
      },
      {
        q: '¿Hacen envíos a todo México?',
        a: 'Sí, enviamos a toda la República Mexicana. Por ahora no hacemos envíos internacionales.',
      },
      {
        q: '¿Cómo rastreo mi pedido?',
        a: 'Cuando tu pedido sale te enviamos un correo con la paquetería y el número de rastreo. También lo ves en Mi cuenta → Pedidos.',
      },
      {
        q: '¿Cómo viene empacado?',
        a: 'En bolsa CPE negro mate esmerilado y dentro de un cilindro de cartón negro con nuestro logo en serigrafía plata. Protege tu equipo en el camino y el unboxing está a la altura.',
      },
    ],
  },
  {
    title: 'Cuidado del equipo',
    items: [
      {
        q: '¿Cómo lavo mis lifting straps?',
        a: 'A mano, con agua fría y jabón neutro. Enjuaga bien y déjalos secar al aire, a la sombra. No uses secadora, cloro ni los planches: el calor daña el neopreno y el grip de silicona.',
      },
      {
        q: '¿Cómo mantengo el grip de los straps?',
        a: 'Después de entrenar, quita el exceso de magnesio o sudor con un trapo húmedo. Guárdalos secos y lejos del sol directo para que la silicona conserve su agarre.',
      },
      {
        q: '¿Cómo lavo mi chaleco de running?',
        a: 'Saca los depósitos o botellas y vacía los bolsillos. Lávalo a mano con agua fría y jabón neutro, sin cloro ni suavizante, y déjalo secar al aire. No lo metas a la secadora.',
      },
      {
        q: '¿Cómo limpio los depósitos de hidratación?',
        a: 'Enjuágalos con agua tibia después de cada uso y déjalos secar abiertos. Si les pusiste bebidas con azúcar o electrolitos, lávalos con un poco de jabón neutro y enjuaga muy bien.',
      },
    ],
  },
  {
    title: 'Cambios y devoluciones',
    items: [
      {
        q: '¿Puedo cambiar mi producto?',
        a: 'Sí, dentro de los 15 días naturales siguientes a la entrega, con el producto sin usar, con etiquetas y en su empaque original. Está sujeto a disponibilidad.',
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
        a: 'Escríbenos dentro de las 48 horas siguientes a la entrega con fotos del paquete y del producto. Lo resolvemos sin costo para ti.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="Ayuda"
      title="Preguntas frecuentes"
      intro="Lo que más nos preguntan sobre pedidos, envíos, cuidado del equipo y devoluciones."
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
