'use client'

import { useEffect, useState } from 'react'

/** Tracks a CSS media query; false during SSR and the first client render. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
