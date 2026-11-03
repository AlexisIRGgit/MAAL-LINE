import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'El Mercadito by MAAL',
  description:
    'Fin de temporada, colecciones pasadas, prototipos y ropa con diseños a un precio mucho más accesible. La marca hermana menor de MAAL LINE.',
  icons: { icon: '/images/mercadito/face.png', apple: '/images/mercadito/face.png' },
}

export default function MercaditoLayout({ children }: { children: React.ReactNode }) {
  return children
}
