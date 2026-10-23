'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { loadGoogleMaps, parsePlace, type ParsedPlace } from '@/lib/google-maps'

interface Suggestion {
  id: string
  main: string
  secondary: string
  prediction: google.maps.places.PlacePrediction
}

const DEBOUNCE_MS = 250

/** Google Places (New) autocomplete with a custom, themed dropdown. */
export function GoogleAddressSearch({ onSelect }: { onSelect: (place: ParsedPlace) => void }) {
  const listId = useId()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // One session token per search so Google bills the suggestions and the pick as one session
  const sessionRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const placesRef = useRef<google.maps.PlacesLibrary | null>(null)
  const requestId = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 3) {
      setSuggestions([])
      setLoading(false)
      return
    }
    const id = ++requestId.current
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        await loadGoogleMaps()
        placesRef.current ??= (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary
        const places = placesRef.current
        sessionRef.current ??= new places.AutocompleteSessionToken()
        const { suggestions: results } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionRef.current,
          includedRegionCodes: ['mx'],
          language: 'es',
        })
        if (id !== requestId.current) return
        setSuggestions(
          results
            .map((result) => result.placePrediction)
            .filter((prediction): prediction is google.maps.places.PlacePrediction => !!prediction)
            .map((prediction) => ({
              id: prediction.placeId,
              main: prediction.mainText?.text ?? prediction.text.text,
              secondary: prediction.secondaryText?.text ?? '',
              prediction,
            }))
        )
        setActiveIndex(-1)
        setOpen(true)
        setError(null)
      } catch {
        if (id === requestId.current) setError('No pudimos buscar direcciones. Llena los campos abajo.')
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  const choose = async (suggestion: Suggestion) => {
    setOpen(false)
    setResolving(true)
    try {
      const place = suggestion.prediction.toPlace()
      await place.fetchFields({ fields: ['addressComponents', 'location', 'formattedAddress'] })
      const parsed = parsePlace(place)
      if (parsed) {
        onSelect(parsed)
        setQuery(parsed.formattedAddress || suggestion.main)
        setSuggestions([])
      }
    } catch {
      setError('No pudimos cargar esa dirección. Intenta de nuevo.')
    } finally {
      setResolving(false)
      sessionRef.current = null
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1))
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      choose(suggestions[activeIndex])
    } else if (event.key === 'Escape') {
      // Close the list without closing the modal
      event.stopPropagation()
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Busca tu dirección"
          className="w-full pl-10 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-2xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/50 focus:border-transparent transition-all dark:bg-white/[0.05] dark:border-white/10"
        />
        {(loading || resolving) && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#9CA3AF]" />
        )}
      </div>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-64 overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-xl dark:bg-[#2A2E37] dark:border-white/10"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 transition-colors',
                  index === activeIndex ? 'bg-[#F3F4F6] dark:bg-white/[0.06]' : ''
                )}
              >
                <MapPin className="mt-0.5 w-4 h-4 flex-shrink-0 text-[#FF3D00]" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[#111827]">{suggestion.main}</span>
                  {suggestion.secondary && <span className="block truncate text-xs text-[#6B7280]">{suggestion.secondary}</span>}
                </span>
              </li>
            ))}
            <li aria-hidden className="px-3 pt-1.5 pb-0.5 text-right text-[10px] text-[#9CA3AF]">
              Sugerencias de Google
            </li>
          </motion.ul>
        )}
      </AnimatePresence>

      {error && <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">{error}</p>}
    </div>
  )
}
