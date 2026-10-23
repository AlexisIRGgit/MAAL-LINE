// Google Maps JS API loader (Places autocomplete + vector map with a draggable pin).
// Enabled only when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set; otherwise the address
// wizard falls back to the free CARTO/MapLibre map with Nominatim geocoding.

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

/** Map ID from Google Cloud (Map Management). Required for advanced markers and dark color scheme. */
export const GOOGLE_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

export const hasGoogleMaps = !!API_KEY

let loadPromise: Promise<void> | null = null

declare global {
  interface Window {
    __maalGoogleMapsReady?: () => void
  }
}

/** Injects the Maps script once and resolves when `google.maps.importLibrary` is available. */
export function loadGoogleMaps(): Promise<void> {
  if (!API_KEY) return Promise.reject(new Error('Google Maps API key is not configured'))
  if (typeof window === 'undefined') return Promise.reject(new Error('Google Maps can only load in the browser'))
  // `google` is declared globally by @types/google.maps but only exists once the script has loaded
  if (typeof window.google !== 'undefined' && typeof window.google.maps?.importLibrary === 'function') return Promise.resolve()

  loadPromise ??= new Promise<void>((resolve, reject) => {
    window.__maalGoogleMapsReady = () => resolve()
    const params = new URLSearchParams({
      key: API_KEY,
      v: 'weekly',
      loading: 'async',
      language: 'es',
      region: 'MX',
      callback: '__maalGoogleMapsReady',
    })
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`
    script.async = true
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Failed to load Google Maps'))
    }
    document.head.appendChild(script)
  })
  return loadPromise
}

export interface ParsedPlace {
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  latitude: number
  longitude: number
  formattedAddress: string
}

/** Maps Google address components onto the address form fields. */
export function parsePlace(place: google.maps.places.Place): ParsedPlace | null {
  const location = place.location
  if (!location) return null
  const components = place.addressComponents ?? []
  const find = (...types: string[]) =>
    components.find((component) => types.some((type) => component.types.includes(type)))?.longText ?? ''

  return {
    street: find('route'),
    number: find('street_number'),
    neighborhood: find('sublocality_level_1', 'neighborhood', 'sublocality'),
    city: find('locality', 'administrative_area_level_2'),
    state: find('administrative_area_level_1'),
    zipCode: find('postal_code'),
    latitude: location.lat(),
    longitude: location.lng(),
    formattedAddress: place.formattedAddress ?? '',
  }
}
