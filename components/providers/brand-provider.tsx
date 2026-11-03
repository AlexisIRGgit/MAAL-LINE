'use client'

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BRAND_STORAGE_KEY, brandForPath, isMercaditoPath, isSharedPath, type Brand } from '@/lib/brand'
import { THEME_STORAGE_KEY } from '@/lib/theme-key'

type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => { finished: Promise<void> }
}

interface BrandContextValue {
  brand: Brand
  /** Goes to the other store with the same circle reveal as the theme toggle, growing from `origin` */
  switchBrand: (href: string, origin?: HTMLElement | null) => void
}

const BrandContext = createContext<BrandContextValue>({ brand: 'maal', switchBrand: () => undefined })

export const useBrand = () => useContext(BrandContext).brand
export const useSwitchBrand = () => useContext(BrandContext).switchBrand

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

// The new page has to be on screen before the circle starts, but a slow network must not hold the old frame
const MAX_NAVIGATION_WAIT_MS = 2500

/** Shows the DOM in the given store's look right away; the provider's state follows on the next render */
function paintBrand(brand: Brand) {
  const root = document.documentElement
  if (brand === 'mercadito') root.dataset.brand = 'mercadito'
  else delete root.dataset.brand

  let theme = 'light'
  if (brand === 'maal') {
    try {
      theme = localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
    } catch {}
  }
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const router = useRouter()
  const [stored, setStored] = useState<Brand>('maal')
  const brand = brandForPath(pathname, stored)
  const arrived = useRef<(() => void) | null>(null)

  // Shared pages keep the store the visitor came from, which only the browser knows
  useIsomorphicLayoutEffect(() => {
    let saved: Brand = 'maal'
    try {
      saved = localStorage.getItem(BRAND_STORAGE_KEY) === 'mercadito' ? 'mercadito' : 'maal'
    } catch {}
    if (isMercaditoPath(pathname)) saved = 'mercadito'
    else if (!isSharedPath(pathname)) saved = 'maal'
    setStored(saved)

    // The admin isn't part of either store, so visiting it doesn't change where the customer was
    if (!pathname.startsWith('/admin')) {
      try {
        if (saved === 'mercadito') localStorage.setItem(BRAND_STORAGE_KEY, saved)
        else localStorage.removeItem(BRAND_STORAGE_KEY)
      } catch {}
    }

    const next = brandForPath(pathname, saved)
    if (next === 'mercadito') document.documentElement.dataset.brand = 'mercadito'
    else delete document.documentElement.dataset.brand

    arrived.current?.()
    arrived.current = null
  }, [pathname])

  const switchBrand = useCallback(
    (href: string, origin?: HTMLElement | null) => {
      const target: Brand = isMercaditoPath(href) ? 'mercadito' : 'maal'
      const doc = document as DocumentWithViewTransition
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const navigate = () =>
        new Promise<void>((resolve) => {
          paintBrand(target)
          arrived.current = resolve
          router.push(href)
          setTimeout(resolve, MAX_NAVIGATION_WAIT_MS)
        })

      if (reduceMotion || !doc.startViewTransition) {
        navigate()
        return
      }

      const root = document.documentElement
      const rect = origin?.getBoundingClientRect()
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
      const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
      root.style.setProperty('--theme-vt-x', `${x}px`)
      root.style.setProperty('--theme-vt-y', `${y}px`)
      root.style.setProperty('--theme-vt-r', `${Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))}px`)
      root.dataset.themeVt = 'circle'

      doc.startViewTransition(navigate).finished.finally(() => {
        delete root.dataset.themeVt
      })
    },
    [router]
  )

  const value = useMemo(() => ({ brand, switchBrand }), [brand, switchBrand])
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}
