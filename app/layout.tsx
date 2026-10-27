import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/session-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { QuickViewModal } from '@/components/product/quick-view-modal'
import { AuthModal } from '@/components/auth/auth-modal'
import { CheckoutModal } from '@/components/checkout/checkout-modal'
import { getPublicStoreSettings } from '@/lib/public-store-settings'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

const baseMetadata: Metadata = {
  title: 'MAAL LINE | Streetwear Oversize con Actitud',
  description: 'Tienda oficial de MAAL Line. Hoodies, tees y bottoms oversized. Streetwear mexicano premium. Envío gratis +$999.',
  keywords: ['streetwear', 'oversize', 'hoodies', 'ropa urbana', 'mexico', 'maal line', 'gothic streetwear'],
}

// The logo uploaded in Admin > Configuración > General doubles as the favicon
export async function generateMetadata(): Promise<Metadata> {
  try {
    const { logo } = await getPublicStoreSettings()
    if (!logo) return baseMetadata
    const href = `/api/store/logo?v=${logo.version}`
    return { ...baseMetadata, icons: { icon: href, apple: href } }
  } catch {
    return baseMetadata
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-MX" className={`${spaceGrotesk.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-[#F9FAFB] text-[#111827] antialiased">
        <ThemeProvider>
          <SessionProvider>
            {children}
            <CartDrawer />
            <QuickViewModal />
            <AuthModal />
            <CheckoutModal />
            <ToastProvider />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
