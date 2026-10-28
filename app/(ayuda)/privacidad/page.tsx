import type { Metadata } from 'next'
import { InfoSection } from '@/components/info/info-page'
import { CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Aviso de privacidad | MAAL LINE',
  description: 'Cómo MAAL LINE recaba, usa y protege tus datos personales, y cómo ejercer tus derechos.',
}

export default function PrivacyPage() {
  return (
    <>
      <InfoSection title="Responsable de tus datos">
        <p>
          MAAL LINE, marca de equipo deportivo con domicilio en Guadalajara, Jalisco, México, es responsable del
          tratamiento de los datos personales que nos proporcionas a través de maalline.com, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. Para
          cualquier tema de privacidad, escríbenos a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </InfoSection>

      <InfoSection title="Datos que recabamos">
        <ul>
          <li>
            <strong>Identificación y contacto:</strong> nombre, correo electrónico y teléfono.
          </li>
          <li>
            <strong>Envío:</strong> dirección, código postal y, si la marcas en el mapa, la ubicación de entrega.
          </li>
          <li>
            <strong>Cuenta:</strong> contraseña (guardada cifrada) o los datos básicos de tu cuenta de Google si inicias
            sesión con ella.
          </li>
          <li>
            <strong>Compras:</strong> productos, montos e historial de pedidos.
          </li>
          <li>
            <strong>Navegación:</strong> datos técnicos como dirección IP, tipo de dispositivo y navegador, y cookies
            necesarias para que la tienda funcione (sesión y carrito).
          </li>
        </ul>
        <p>
          No recabamos datos personales sensibles. Los datos de tu tarjeta los recibe y procesa directamente Stripe;
          MAAL LINE nunca los ve ni los almacena.
        </p>
      </InfoSection>

      <InfoSection title="Para qué usamos tus datos">
        <p>
          <strong>Finalidades necesarias</strong> para darte el servicio:
        </p>
        <ul>
          <li>Procesar tus pedidos y pagos, y entregarlos en tu dirección.</li>
          <li>Crear y administrar tu cuenta.</li>
          <li>Enviarte confirmaciones, avisos de envío y responder tus solicitudes de soporte, cambios o devoluciones.</li>
          <li>Prevenir fraudes y mantener la seguridad de la tienda.</li>
          <li>Cumplir obligaciones legales y fiscales.</li>
        </ul>
        <p>
          <strong>Finalidades secundarias</strong>, que puedes rechazar en cualquier momento escribiéndonos: enviarte
          promociones y novedades de la marca, y analizar de forma agregada cómo se usa la tienda para mejorarla.
        </p>
      </InfoSection>

      <InfoSection title="Con quién compartimos tus datos">
        <p>No vendemos ni rentamos tus datos. Solo los compartimos con proveedores que nos ayudan a operar la tienda:</p>
        <ul>
          <li>Procesadores de pago (Stripe) para cobrar tus compras.</li>
          <li>
            Servicios de mensajería local y paqueterías nacionales (directamente o a través de plataformas de guías de
            envío), solo con los datos necesarios para entregar tu pedido: nombre, teléfono y dirección.
          </li>
          <li>Proveedores de hospedaje, base de datos y envío de correos, que operan la tienda en nuestro nombre.</li>
          <li>Google, si eliges iniciar sesión con tu cuenta o usar el mapa para tu dirección.</li>
          <li>Autoridades, cuando una ley o una orden lo requiera.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Tus derechos (ARCO)">
        <p>
          Puedes <strong>acceder</strong> a tus datos, pedir que los <strong>rectifiquemos</strong> si son inexactos,
          que los <strong>cancelemos</strong> o <strong>oponerte</strong> a su uso para ciertos fines. También puedes
          revocar tu consentimiento. Muchos datos los puedes editar tú mismo en Mi cuenta.
        </p>
        <p>
          Para ejercer estos derechos, escríbenos a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> desde el
          correo de tu cuenta, indicando tu nombre, el derecho que quieres ejercer y los datos a los que se refiere. Te
          respondemos en un plazo máximo de 20 días hábiles.
        </p>
      </InfoSection>

      <InfoSection title="Cookies">
        <p>
          Usamos cookies y almacenamiento local necesarios para mantener tu sesión, tu carrito y tus preferencias (como
          el modo oscuro). Puedes borrarlos desde tu navegador, aunque algunas funciones de la tienda podrían dejar de
          funcionar.
        </p>
      </InfoSection>

      <InfoSection title="Seguridad y conservación">
        <p>
          Protegemos tus datos con medidas técnicas y administrativas, como conexiones cifradas, contraseñas cifradas y
          acceso restringido. Los conservamos mientras tengas una cuenta o mientras sean necesarios para las finalidades
          de este aviso y para cumplir obligaciones legales.
        </p>
      </InfoSection>

      <InfoSection title="Cambios a este aviso">
        <p>
          Podemos actualizar este aviso de privacidad. Publicaremos la versión vigente en esta página con su fecha de
          actualización.
        </p>
      </InfoSection>
    </>
  )
}
