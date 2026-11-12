import { prisma } from '@/lib/db'
import { productPath } from '@/lib/brand'
import { CONTACT_EMAIL } from '@/lib/site'
import { sendNtfy } from '@/lib/ntfy'
import { notifyStaff } from '@/lib/admin-notifications'
import { getAllProducts, searchProducts } from '@/lib/queries/products'
import { getPublicStoreSettings } from '@/lib/public-store-settings'
import { TRACKED_ORDER_SELECT, serializeTrackedOrder } from '@/lib/orders/tracked-order'
import { getOrderStatus } from '@/components/account/order-status'
import type { AgentTool } from '@/lib/agent/types'
import type { BotBusiness, CustomerContext } from '@/lib/whatsapp/bot'

/**
 * MAAL LINE's side of the WhatsApp bot: prompt, tools and who gets told about handoffs.
 * Tools reuse the store's own queries, so prices, stock and orders match the website.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.maalline.com').replace(/\/$/, '')

const SYSTEM_PROMPT = `Eres el asistente de WhatsApp de MAAL LINE, una tienda en línea de Guadalajara que vende equipo deportivo de alto rendimiento: lifting straps, chalecos de hidratación para running y ropa urbana. La tienda está en ${SITE_URL}.

Tu trabajo es atender a clientes de MAAL LINE por WhatsApp: responder dudas sobre productos, precios, tallas, disponibilidad, envíos, cambios y devoluciones, y el estado de sus pedidos.

Alcance:
- Solo hablas de MAAL LINE y sus productos, pedidos y políticas. Si te piden otra cosa (tareas, programación, recetas, noticias, consejos médicos o cualquier tema ajeno a la tienda), responde con amabilidad que solo puedes ayudar con temas de MAAL LINE y ofrece ayuda con eso.
- No des consejos de entrenamiento o salud más allá de describir para qué sirve un producto.

Datos:
- Precios, tallas, disponibilidad, envíos y pedidos salen únicamente de tus herramientas. Nunca inventes ni supongas un precio, una talla, una fecha de entrega, un número de rastreo o el estado de un pedido. Si una herramienta no trae el dato, dilo y ofrece pasar con una persona.
- Para los pedidos, la herramienta ya busca los del número de WhatsApp desde el que escribe el cliente; solo puedes ver esos. Si no aparece su pedido, puede que lo haya hecho con otro teléfono: sugiérele revisar ${SITE_URL}/rastrear o pasar con una persona.
- No tomas pedidos ni cobras por aquí: para comprar, comparte el enlace del producto para que compre en la página.
- Nunca pidas datos de tarjeta, contraseñas ni códigos de verificación. Si el cliente los manda, dile que no los comparta por chat.

Pasar con una persona: usa la herramienta handoffToHuman cuando el cliente pida hablar con alguien, tenga una queja, un problema con un pago, un producto dañado o equivocado, quiera iniciar un cambio o devolución, o cuando no puedas resolver lo que necesita.

Estilo:
- Español de México, cercano y breve, como un mensaje de WhatsApp: pocas líneas, sin encabezados ni tablas. Para resaltar usa *negritas* de WhatsApp (un asterisco de cada lado), con moderación.
- Precios en pesos mexicanos, por ejemplo $599.
- Si hay varias opciones, enumera máximo 5 y comparte el enlace de cada una.`

const RETURNS_POLICY = {
  plazo: '15 días naturales desde que recibes el pedido para pedir cambio o devolución',
  condiciones: [
    'Producto sin usar, limpio, con etiquetas y en su empaque original',
    'No hay cambio en equipo con señales de uso (desgaste en el grip, sudor, olor o manchas)',
    'Por higiene, los depósitos o bolsas de hidratación que ya se llenaron no tienen cambio',
    'Cambios de talla o modelo sujetos a disponibilidad',
  ],
  comoSolicitar: `Escribir a ${CONTACT_EMAIL} con número de pedido, producto y motivo (o pasar con una persona por este chat)`,
  envioDeRegreso: 'Lo paga el cliente, salvo producto dañado, defectuoso o equivocado',
  reembolso: 'Al mismo método de pago; el banco tarda de 5 a 10 días hábiles. El envío original no se reembolsa salvo daño, defecto o error',
  danadoOIncorrecto: 'Avisar dentro de las 48 horas siguientes a la entrega, con fotos; se resuelve sin costo',
}

const DELIVERY_TIMES = {
  preparacion: 'El pedido se prepara el mismo día hábil en que se confirma el pago o, a más tardar, al día siguiente. Se envía desde el almacén propio en Guadalajara.',
  zonaMetropolitanaGuadalajara: 'Mismo día o día siguiente, con mensajería local',
  restoDeMexico: 'De 2 a 5 días hábiles con paqueterías nacionales, según el código postal',
  nota: 'Días hábiles de lunes a viernes, sin festivos. Zonas extendidas pueden tardar uno o dos días más.',
  rastreo: `Al salir el pedido llega un correo con paquetería y número de rastreo. También en ${SITE_URL}/rastrear o en Mi cuenta → Pedidos.`,
}

type ProductRow = Awaited<ReturnType<typeof getAllProducts>>['products'][number]

function describeProduct(product: ProductRow) {
  const price = Number(product.price)
  const sizes = product.variants.filter((v) => v.isActive)
  const withPrice = (adjustment: unknown) => price + Number(adjustment ?? 0)
  // One-size products are named "UNITALLA" but their variant may still carry a size letter
  const oneSize = /unitalla/i.test(product.name)
  const sizeLabel = (size: string | null) => (oneSize || !size ? 'Única' : size)
  const description = (product.shortDescription || product.description || '').replace(/\s+/g, ' ').trim()
  return {
    nombre: product.name,
    precio: price,
    precioAntes: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    categoria: product.category?.name ?? null,
    descripcion: description.length > 300 ? `${description.slice(0, 300)}…` : description,
    tallasDisponibles: sizes
      .filter((v) => v.stockQuantity > 0)
      .map((v) => ({ talla: sizeLabel(v.size), color: v.color, precio: withPrice(v.priceAdjustment) })),
    tallasAgotadas: sizes.filter((v) => v.stockQuantity <= 0).map((v) => sizeLabel(v.size)),
    agotado: sizes.every((v) => v.stockQuantity <= 0),
    enlace: `${SITE_URL}${productPath(product.slug, 'maal')}`,
  }
}

/** Last 10 digits, so 52…, 521… (older Mexican mobile format) and local numbers all match */
const last10 = (phone: string) => phone.replace(/\D/g, '').slice(-10)

async function ordersForPhone(phone: string, orderNumber: string | null) {
  const digits = last10(phone)
  if (digits.length < 10) return []
  // The phone given at checkout, or the one on the customer's account
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT o.id FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE (right(regexp_replace(coalesce(o.phone, ''), '\\D', '', 'g'), 10) = ${digits}
       OR right(regexp_replace(coalesce(u.phone, ''), '\\D', '', 'g'), 10) = ${digits})
      AND (${orderNumber}::text IS NULL OR o.order_number = ${orderNumber})
    ORDER BY o.created_at DESC
    LIMIT 5`
  if (rows.length === 0) return []
  const orders = await prisma.order.findMany({
    where: { id: { in: rows.map((row) => row.id) } },
    orderBy: { createdAt: 'desc' },
    select: TRACKED_ORDER_SELECT,
  })
  return Promise.all(orders.map(serializeTrackedOrder))
}

function buildTools(ctx: CustomerContext): AgentTool[] {
  return [
    {
      name: 'buscarProductos',
      description:
        'Busca productos activos de la tienda por nombre o palabra clave (por ejemplo "strap", "chaleco", "playera"). Devuelve precio, tallas disponibles y agotadas, y el enlace. Sin texto de búsqueda devuelve el catálogo más reciente.',
      inputSchema: {
        type: 'object',
        properties: { busqueda: { type: 'string', description: 'Palabra clave; vacío para ver el catálogo' } },
        additionalProperties: false,
      },
      async run(input) {
        const query = typeof input.busqueda === 'string' ? input.busqueda.trim().slice(0, 80) : ''
        const { products, total } = query ? await searchProducts(query, 1, 5) : await getAllProducts(1, 8)
        return JSON.stringify({ total, productos: products.map(describeProduct) })
      },
    },
    {
      name: 'consultarPedidos',
      description:
        'Consulta los pedidos hechos con el número de WhatsApp de este cliente (los más recientes primero): estado, productos, total, envío y rastreo. Opcionalmente filtra por número de pedido, por ejemplo ML-ABC123-XY12.',
      inputSchema: {
        type: 'object',
        properties: { numeroPedido: { type: 'string', description: 'Número de pedido, si el cliente lo dio' } },
        additionalProperties: false,
      },
      async run(input) {
        const raw = typeof input.numeroPedido === 'string' ? input.numeroPedido.trim().toUpperCase() : ''
        const orderNumber = /^ML-[A-Z0-9]{4,12}-[A-Z0-9_-]{4}$/.test(raw) ? raw : null
        if (!ctx.phone) {
          return JSON.stringify({
            pedidos: [],
            nota: `No se pudo confirmar el teléfono de este chat, así que no se pueden mostrar pedidos por aquí. El cliente puede revisarlos en ${SITE_URL}/rastrear o pasar con una persona.`,
          })
        }
        const orders = await ordersForPhone(ctx.phone, orderNumber)
        if (orders.length === 0) {
          return JSON.stringify({ pedidos: [], nota: 'No hay pedidos con este número de WhatsApp' + (orderNumber ? ` y el número ${orderNumber}` : '') })
        }
        return JSON.stringify({
          pedidos: orders.map((order) => ({
            numero: order.orderNumber,
            fecha: order.createdAt,
            estado: order.status,
            estadoTexto: getOrderStatus(order.status).label,
            pago: order.paymentStatus,
            total: order.total,
            envio: order.shippingMethod?.name ?? null,
            enviadoEl: order.shippedAt,
            entregadoEl: order.deliveredAt,
            productos: order.items.map((item) => `${item.quantity} x ${item.name}${item.variant ? ` (${item.variant})` : ''}`),
            rastreo: order.shipment
              ? { paqueteria: order.shipment.carrier, guia: order.shipment.trackingNumber, enlace: order.shipment.trackingUrl }
              : null,
          })),
        })
      },
    },
    {
      name: 'infoEnvios',
      description: 'Métodos y costos de envío, envío gratis, tiempos de entrega, rastreo, cambios, devoluciones y reembolsos.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      async run() {
        const { shipping } = await getPublicStoreSettings()
        const threshold = shipping.freeShippingThreshold
        return JSON.stringify({
          metodos: shipping.methods
            .filter((m) => m.enabled)
            .map((m) => ({ nombre: m.name, tiempo: m.description, precio: m.price, gratisDesde: threshold !== null && m.freeEligible ? threshold : null })),
          tiempos: DELIVERY_TIMES,
          cambiosYDevoluciones: RETURNS_POLICY,
        })
      },
    },
  ]
}

async function onHandoff(ctx: CustomerContext, reason: string) {
  const number = ctx.phone ? `+${ctx.phone}` : 'número oculto'
  const who = ctx.contactName ? `${ctx.contactName} (${number})` : number
  await Promise.all([
    sendNtfy({
      title: 'WhatsApp: un cliente necesita atención',
      message: `${who}: ${reason}`,
      tags: ['speech_balloon'],
      priority: 4,
      click: `${SITE_URL}/admin/whatsapp`,
    }),
    notifyStaff({
      type: 'whatsapp_handoff',
      title: 'Cliente de WhatsApp espera respuesta',
      message: `${who}: ${reason}`,
      actionUrl: '/admin/whatsapp',
    }),
  ])
}

export const maalWhatsAppBusiness: BotBusiness = {
  systemPrompt: () => SYSTEM_PROMPT,
  buildTools,
  onHandoff,
  replies: {
    unsupported: 'Por ahora solo puedo leer mensajes de texto 🙏 ¿Me escribes tu pregunta?',
    failure: 'Perdón, tuve un problema para responderte. Ya avisé al equipo y alguien te va a contestar por aquí en cuanto pueda.',
    refused: 'Perdón, con eso no te puedo ayudar. Si tienes dudas sobre productos, envíos o tus pedidos de MAAL LINE, aquí estoy.',
  },
}
