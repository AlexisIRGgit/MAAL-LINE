/**
 * Plain HTML emails (table layout + inline styles, so Gmail/Outlook render them).
 * Each template returns subject, html and a text fallback. All interpolated data is escaped.
 */

export type EmailContent = { subject: string; html: string; text: string }

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://www.maalline.com').replace(/\/$/, '')

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export const formatMXN = (value: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)

function button(label: string, href: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#0A0A0A;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px">${escapeHtml(label)}</a>`
}

function layout({ preheader, heading, body }: { preheader: string; heading: string; body: string }): string {
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#F5F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F7;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;overflow:hidden">
<tr><td style="background:#0A0A0A;padding:22px 28px">
<a href="${SITE_URL}" style="color:#FFFFFF;text-decoration:none;font-size:18px;font-weight:800;letter-spacing:0.18em">MAAL LINE</a>
</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#111827">${escapeHtml(heading)}</h1>
${body}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #E5E7EB;font-size:12px;color:#9CA3AF">
MAAL LINE · Performance Gear · Guadalajara · <a href="${SITE_URL}" style="color:#6B7280">maalline.com</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

const p = (html: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151">${html}</p>`

type LineItem = { productName: string; variantName: string | null; quantity: number }

function itemsTable(items: LineItem[]): string {
  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:14px;color:#111827">${escapeHtml(item.productName)}${
          item.variantName ? ` <span style="color:#6B7280">(${escapeHtml(item.variantName)})</span>` : ''
        }</td><td align="right" style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:14px;color:#6B7280">×${item.quantity}</td></tr>`
    )
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px">${rows}</table>`
}

const itemsText = (items: LineItem[]) =>
  items.map((item) => `- ${item.quantity}x ${item.productName}${item.variantName ? ` (${item.variantName})` : ''}`).join('\n')

// ---------- Owner ----------

export function ownerNewOrderEmail(order: {
  orderNumber: string
  total: number
  customer: string
  email: string
  provider: string
  items: LineItem[]
}): EmailContent {
  const adminUrl = `${SITE_URL}/admin/orders?search=${encodeURIComponent(order.orderNumber)}`
  return {
    subject: `💰 Nuevo pedido pagado ${order.orderNumber} · ${formatMXN(order.total)}`,
    html: layout({
      preheader: `${order.customer} pagó ${formatMXN(order.total)} con ${order.provider}`,
      heading: 'Nuevo pedido pagado',
      body:
        p(
          `<strong>${escapeHtml(order.customer)}</strong> (${escapeHtml(order.email)}) pagó <strong>${formatMXN(
            order.total
          )}</strong> con ${escapeHtml(order.provider)}.`
        ) +
        p(`Pedido <strong>${escapeHtml(order.orderNumber)}</strong>`) +
        itemsTable(order.items) +
        button('Ver pedido en el admin', adminUrl),
    }),
    text: `Nuevo pedido pagado ${order.orderNumber}\n${order.customer} (${order.email}) pagó ${formatMXN(order.total)} con ${order.provider}.\n\n${itemsText(order.items)}\n\n${adminUrl}`,
  }
}

export function ownerLowStockEmail(variants: { name: string; sku: string; stock: number }[]): EmailContent {
  const first = variants[0]
  const list = variants
    .map(
      (v) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:14px;color:#111827">${escapeHtml(v.name)} <span style="color:#9CA3AF">${escapeHtml(
          v.sku
        )}</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:14px;font-weight:600;color:${
          v.stock <= 0 ? '#DC2626' : '#D97706'
        }">${v.stock <= 0 ? 'Agotado' : `Quedan ${v.stock}`}</td></tr>`
    )
    .join('')
  return {
    subject:
      variants.length === 1
        ? `⚠️ Stock bajo: ${first.name} (${first.stock <= 0 ? 'agotado' : `quedan ${first.stock}`})`
        : `⚠️ Stock bajo en ${variants.length} productos`,
    html: layout({
      preheader: 'Algunos productos están por agotarse',
      heading: 'Stock bajo',
      body:
        p('Estos productos llegaron a su mínimo de inventario después de una venta:') +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px">${list}</table>` +
        button('Ver inventario', `${SITE_URL}/admin/inventory`),
    }),
    text: `Stock bajo:\n${variants.map((v) => `- ${v.name} (${v.sku}): ${v.stock <= 0 ? 'agotado' : `quedan ${v.stock}`}`).join('\n')}\n\n${SITE_URL}/admin/inventory`,
  }
}

export function ownerDropWaitlistEmail(signup: { email: string; source: string; total: number }): EmailContent {
  const where = signup.source === 'drop' ? 'la página del Drop 001' : 'el Home'
  return {
    subject: `🔥 Nuevo interesado en el Drop 001 · ${signup.total} en la lista`,
    html: layout({
      preheader: `${signup.email} se unió a la lista de espera`,
      heading: 'Nuevo en la lista del Drop 001',
      body:
        p(`<strong>${escapeHtml(signup.email)}</strong> se unió a la lista de espera desde ${where}.`) +
        p(`Ya van <strong>${signup.total}</strong> ${signup.total === 1 ? 'persona' : 'personas'} en la lista.`) +
        button('Ver la página del drop', `${SITE_URL}/drop`),
    }),
    text: `Nuevo en la lista del Drop 001\n${signup.email} se unió desde ${where}.\nYa van ${signup.total} en la lista.\n\n${SITE_URL}/drop`,
  }
}

// ---------- Customer ----------

export function customerOrderShippedEmail(order: {
  orderNumber: string
  firstName: string | null
  items: LineItem[]
  carrier: string | null
  trackingNumber: string | null
  trackingUrl: string | null
}): EmailContent {
  const greeting = order.firstName ? `¡Hola ${escapeHtml(order.firstName)}!` : '¡Hola!'
  const tracking =
    order.trackingNumber || order.carrier
      ? p(
          `${order.carrier ? `Paquetería: <strong>${escapeHtml(order.carrier)}</strong><br>` : ''}${
            order.trackingNumber ? `Número de rastreo: <strong>${escapeHtml(order.trackingNumber)}</strong>` : ''
          }`
        )
      : ''
  const accountUrl = `${SITE_URL}/cuenta/pedidos`
  return {
    subject: `Tu pedido ${order.orderNumber} va en camino 📦`,
    html: layout({
      preheader: 'Tu pedido ya salió de nuestro almacén',
      heading: 'Tu pedido va en camino',
      body:
        p(`${greeting} Tu pedido <strong>${escapeHtml(order.orderNumber)}</strong> ya salió y va rumbo a tu dirección.`) +
        tracking +
        itemsTable(order.items) +
        (order.trackingUrl ? button('Rastrear mi paquete', order.trackingUrl) : button('Ver mi pedido', accountUrl)),
    }),
    text: `Tu pedido ${order.orderNumber} va en camino.\n${order.carrier ? `Paquetería: ${order.carrier}\n` : ''}${
      order.trackingNumber ? `Rastreo: ${order.trackingNumber}\n` : ''
    }\n${itemsText(order.items)}\n\n${order.trackingUrl || accountUrl}`,
  }
}

export function customerWelcomeEmail(firstName: string | null): EmailContent {
  const greeting = firstName ? `¡Bienvenido, ${escapeHtml(firstName)}!` : '¡Bienvenido!'
  return {
    subject: 'Bienvenido a MAAL LINE 🖤',
    html: layout({
      preheader: 'Tu cuenta ya está lista',
      heading: greeting,
      body:
        p('Tu cuenta en MAAL LINE ya está lista. Desde ella puedes seguir tus pedidos, guardar tus direcciones y comprar más rápido.') +
        p('Performance gear para entrenar duro: lifting straps y chalecos de running con stock propio en Guadalajara.') +
        button('Ver la tienda', SITE_URL),
    }),
    text: `${firstName ? `¡Bienvenido, ${firstName}!` : '¡Bienvenido!'}\nTu cuenta en MAAL LINE ya está lista.\n\n${SITE_URL}`,
  }
}
