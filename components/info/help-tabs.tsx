'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircleHelp, FileText, ShieldCheck, Truck } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const HELP_PAGES = [
  { href: '/envios', label: 'Envíos y devoluciones', icon: Truck },
  { href: '/faq', label: 'Preguntas frecuentes', icon: CircleHelp },
  { href: '/terminos', label: 'Términos y condiciones', icon: FileText },
  { href: '/privacidad', label: 'Aviso de privacidad', icon: ShieldCheck },
]

/** Help-page switcher: beui tabs with the icon only on the selected page; picking one navigates there */
export function HelpTabs({ current }: { current: string }) {
  const router = useRouter()
  // Selected locally first so the pill glides and the icon opens while the next page loads
  const [value, setValue] = useState(current)

  return (
    <nav aria-label="Ayuda">
      <Tabs
        value={value}
        icons="selected"
        onValueChange={(href) => {
          setValue(href)
          router.push(href)
        }}
      >
        <TabsList>
          {HELP_PAGES.map((page) => (
            <TabsTrigger
              key={page.href}
              value={page.href}
              icon={<page.icon className="h-3.5 w-3.5" />}
              className="text-xs"
              onMouseEnter={() => router.prefetch(page.href)}
            >
              {page.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </nav>
  )
}
