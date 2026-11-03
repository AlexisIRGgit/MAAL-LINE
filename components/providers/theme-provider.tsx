'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useBrand } from '@/components/providers/brand-provider'
import { THEME_STORAGE_KEY } from '@/lib/theme-key'

export { THEME_STORAGE_KEY }

/**
 * One theme preference for the whole site: store, customer panel and admin.
 * El Mercadito is always white; the saved preference comes back on leaving it.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const brand = useBrand()
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey={THEME_STORAGE_KEY}
      forcedTheme={brand === 'mercadito' ? 'light' : undefined}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
