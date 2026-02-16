import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// Use a placeholder token during build time
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-placeholder-for-build'

export const mercadopago = new MercadoPagoConfig({
  accessToken,
  options: { timeout: 5000 },
})

export const preference = new Preference(mercadopago)
export const payment = new Payment(mercadopago)
