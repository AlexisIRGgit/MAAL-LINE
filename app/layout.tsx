import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { SessionProvider } from '@/components/providers/session-provider'
import { CartDrawer } from '@/components/cart/cart-drawer'
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

export const metadata: Metadata = {
  title: 'MAAL LINE | Streetwear Oversize con Actitud',
  description: 'Tienda oficial de MAAL Line. Hoodies, tees y bottoms oversized. Streetwear mexicano premium. Envío gratis +$999.',
  keywords: ['streetwear', 'oversize', 'hoodies', 'ropa urbana', 'mexico', 'maal line', 'gothic streetwear'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-MX" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="bg-[#0A0A0A] text-[#E8E4D9] antialiased">
        <SessionProvider>
          {children}
          <CartDrawer />
        </SessionProvider>
      </body>
    </html>
  )
}
