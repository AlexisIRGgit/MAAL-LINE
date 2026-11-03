'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSwitchBrand } from '@/components/providers/brand-provider'
import { MERCADITO_PATH } from '@/lib/brand'
import { cn } from '@/lib/utils/cn'

// A plain click gets the circle reveal; opening in a new tab or window keeps working as a normal link
const isPlainClick = (event: React.MouseEvent) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

/** The pill that takes you to the other store: "SHOP" from MAAL LINE, "MAAL" from El Mercadito */
export function BrandSwitch({ to, className, onNavigate }: { to: 'mercadito' | 'maal'; className?: string; onNavigate?: () => void }) {
  const switchBrand = useSwitchBrand()
  const toMercadito = to === 'mercadito'
  const href = toMercadito ? MERCADITO_PATH : '/coleccion'

  return (
    <Link
      href={href}
      aria-label={toMercadito ? 'Ir a El Mercadito by MAAL' : 'Volver a MAAL LINE'}
      onClick={(event) => {
        if (!isPlainClick(event)) return
        event.preventDefault()
        switchBrand(href, event.currentTarget)
        onNavigate?.()
      }}
      className={cn(
        'group inline-flex h-9 flex-shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 transition-colors',
        toMercadito
          ? 'border-[#E5E7EB] bg-[#F3F4F6] hover:border-[#F88EBC] dark:border-white/[0.08] dark:bg-white/[0.05] dark:hover:border-[#F88EBC]/60'
          : 'border-[#111827] bg-[#111827] hover:bg-[#1F2937] maal-switch',
        className
      )}
    >
      <span className="grid h-7 w-7 flex-shrink-0 place-items-center overflow-hidden rounded-full" style={{ backgroundColor: '#fff' }}>
        <Image
          src={toMercadito ? '/images/mercadito/face.png' : '/images/logo-maal-negro.png'}
          alt=""
          width={toMercadito ? 18 : 22}
          height={toMercadito ? 18 : 9}
          className="object-contain"
        />
      </span>
      {toMercadito ? (
        <span className="font-cute text-[13px] font-bold tracking-[0.12em] text-[#D6357D] dark:text-[#F88EBC]">SHOP</span>
      ) : (
        <span className="text-xs font-bold tracking-[0.2em] text-white">MAAL</span>
      )}
    </Link>
  )
}
