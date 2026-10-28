import type { Metadata } from 'next'
import Link from 'next/link'
import { InfoPage, InfoSection } from '@/components/info/info-page'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Términos y condiciones | MAAL LINE',
  description: 'Términos y condiciones de uso y de compra en la tienda en línea de MAAL LINE.',
}

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Términos y condiciones"
      intro="Al navegar o comprar en maalline.com aceptas estos términos. Te pedimos leerlos con atención."
      updated="28 de octubre de 2026"
      current="/terminos"
    >
      <InfoSection title="1. Quiénes somos">
        <p>
          MAAL LINE es una marca de ropa streetwear que vende sus productos a través del sitio maalline.com (la
          &ldquo;Tienda&rdquo;) a clientes dentro de México. Para cualquier asunto relacionado con estos términos puedes
          escribirnos a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </InfoSection>

      <InfoSection title="2. Uso del sitio">
        <ul>
          <li>Debes ser mayor de edad o comprar con la autorización de tu madre, padre o tutor.</li>
          <li>Te comprometes a dar información verdadera y a mantener la confidencialidad de tu contraseña.</li>
          <li>
            No puedes usar la Tienda para fines ilícitos, intentar acceder sin autorización a sus sistemas ni copiar su
            contenido para uso comercial.
          </li>
        </ul>
        <p>Podemos suspender o cancelar cuentas que incumplan estos términos.</p>
      </InfoSection>

      <InfoSection title="3. Productos y precios">
        <ul>
          <li>Todos los precios están en pesos mexicanos (MXN) e incluyen IVA.</li>
          <li>El costo de envío se muestra por separado antes de pagar.</li>
          <li>
            Procuramos que las fotos y descripciones sean exactas, pero el color puede variar ligeramente según tu
            pantalla.
          </li>
          <li>
            Los productos están sujetos a disponibilidad. Si un artículo se agota después de tu compra, te avisamos y te
            reembolsamos el importe completo.
          </li>
          <li>
            Si un precio aparece con un error evidente, podemos cancelar el pedido y reembolsarte, aunque ya se haya
            confirmado.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="4. Pedidos y pagos">
        <p>
          Tu pedido queda confirmado cuando el pago es aprobado. Los pagos con tarjeta se procesan con Stripe; MAAL LINE
          no almacena los datos de tu tarjeta. Podemos cancelar pedidos con indicios de fraude o uso indebido, en cuyo
          caso reembolsamos el importe cobrado.
        </p>
      </InfoSection>

      <InfoSection title="5. Envíos">
        <p>
          Los métodos, costos y tiempos de envío están en <Link href="/envios">Envíos y devoluciones</Link>. Los tiempos
          son estimados y pueden variar por causas ajenas a nosotros, como retrasos de la paquetería, clima o días
          festivos.
        </p>
      </InfoSection>

      <InfoSection title="6. Cambios, devoluciones y garantía">
        <p>
          Puedes solicitar un cambio o devolución dentro de los 15 días naturales siguientes a la entrega, según las
          condiciones de <Link href="/envios">Envíos y devoluciones</Link>. Esto no limita los derechos que te otorga la
          Ley Federal de Protección al Consumidor.
        </p>
      </InfoSection>

      <InfoSection title="7. Promociones y códigos de descuento">
        <p>
          Las promociones y códigos tienen vigencia y condiciones propias, no son acumulables salvo que se indique y no
          se pueden canjear por dinero.
        </p>
      </InfoSection>

      <InfoSection title="8. Propiedad intelectual">
        <p>
          La marca MAAL LINE, el logotipo, los diseños, fotografías y textos del sitio son propiedad de MAAL LINE o de
          sus licenciantes. No pueden usarse, copiarse ni reproducirse sin autorización por escrito.
        </p>
      </InfoSection>

      <InfoSection title="9. Responsabilidad">
        <p>
          Hacemos lo posible para que la Tienda funcione sin interrupciones, pero no garantizamos que esté libre de
          errores en todo momento. No somos responsables por daños derivados del mal uso del sitio o de causas fuera de
          nuestro control.
        </p>
      </InfoSection>

      <InfoSection title="10. Datos personales">
        <p>
          El tratamiento de tus datos se rige por nuestro <Link href="/privacidad">Aviso de privacidad</Link>.
        </p>
      </InfoSection>

      <InfoSection title="11. Cambios a estos términos">
        <p>
          Podemos actualizar estos términos en cualquier momento. La versión vigente es la publicada en esta página, con
          su fecha de actualización. Las compras se rigen por los términos vigentes al momento de realizarlas.
        </p>
      </InfoSection>

      <InfoSection title="12. Legislación aplicable">
        <p>
          Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes
          se someten a los tribunales competentes y a la Procuraduría Federal del Consumidor (PROFECO).
        </p>
      </InfoSection>
    </InfoPage>
  )
}
