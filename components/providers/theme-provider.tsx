'use client'

import { usePathname } from 'next/navigation'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export const THEME_STORAGE_KEY = 'maal-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // The admin panel is designed light-only, so it ignores the store preference
  const forcedTheme = pathname?.startsWith('/admin') ? 'light' : undefined

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey={THEME_STORAGE_KEY}
      forcedTheme={forcedTheme}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
