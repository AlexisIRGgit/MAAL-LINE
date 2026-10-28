import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPage, InfoSection } from '@/components/info/info-page'

export const metadata: Metadata = {
  title: 'Nuestra historia | MAAL LINE',
  description: 'MAAL LINE es una marca mexicana de performance gear: lifting straps y chalecos de running, desde Guadalajara.',
}

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Nosotros"
      title="Performance gear, desde Guadalajara"
      intro="MAAL LINE hace equipo deportivo de alto rendimiento para quienes entrenan en serio. Estética oscura, materiales que aguantan y cero relleno."
    >
      <InfoSection title="Lo que hacemos">
        <ul>
          <li>
            <strong>Lifting straps:</strong> correas de levantamiento con grip de silicona y acolchado de neopreno, para
            sostener más peso por más tiempo sin que el agarre te limite.
          </li>
          <li>
            <strong>Chalecos de running e hidratación:</strong> para cargar agua y lo esencial en tus salidas largas
            sin tener que parar.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Stock propio, envíos rápidos">
        <p>
          Todo el equipo está en nuestro almacén en Guadalajara, Jalisco. Por eso en la Zona Metropolitana de Guadalajara
          entregamos el mismo día o al día siguiente, y al resto de México en 2 a 5 días hábiles.{' '}
          <Link href="/envios">Ver envíos y devoluciones</Link>.
        </p>
      </InfoSection>

      <InfoSection title="Un unboxing a la altura">
        <p>
          Cada pedido sale en bolsa CPE negro mate esmerilado y dentro de un cilindro de cartón negro con nuestro logo
          en serigrafía plata. Queremos que el equipo se sienta premium desde que lo abres.
        </p>
      </InfoSection>

      <InfoSection title="Nuestra estética">
        <p>
          Oscura, ruda e industrial. Diseñamos equipo que se ve tan serio como tu entrenamiento.
        </p>
      </InfoSection>
    </InfoPage>
  )
}
