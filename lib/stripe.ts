import Stripe from 'stripe'

// Use a placeholder key during build time (Stripe requires a valid format)
const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build'

export const stripe = new Stripe(secretKey, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

// Helper to format price for Stripe (cents)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
}

// Helper to format price from Stripe (cents to MXN)
export function formatAmountFromStripe(amount: number): number {
  return amount / 100
}
