'use client'

import { Component, useEffect, useRef, useState, type ReactNode } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet's default marker icon paths for webpack/Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const DEFAULT_CENTER: [number, number] = [19.4326, -99.1332]

/** Returns true only if the value is a finite number (rejects NaN, Infinity, undefined, null, etc.) */
function isValidCoord(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

/* ---------- Error boundary to catch any Leaflet runtime crash ---------- */
interface MapErrorBoundaryProps {
  children: ReactNode
}

interface MapErrorBoundaryState {
  hasError: boolean
}

class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  constructor(props: MapErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.warn('[CheckoutMap] Leaflet error caught by boundary:', error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full min-h-[300px] w-full rounded-xl bg-gray-100 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No se pudo cargar el mapa</p>
        </div>
      )
    }
    return this.props.children
  }
}

/* ---------- FlyToMarker: animates + shows marker ---------- */
interface FlyToMarkerProps {
  lat: number
  lng: number
}

function FlyToMarker({ lat, lng }: FlyToMarkerProps) {
  const map = useMap()

  useEffect(() => {
    if (map && isValidCoord(lat) && isValidCoord(lng)) {
      map.flyTo([lat, lng], 16, { duration: 1.5 })
    }
  }, [lat, lng, map])

  if (!isValidCoord(lat) || !isValidCoord(lng)) {
    return null
  }

  return <Marker position={[lat, lng]} />
}

/* ---------- Main map component ---------- */
interface CheckoutMapInnerProps {
  lat?: number
  lng?: number
  address?: string
}

export default function CheckoutMapInner({ lat, lng, address }: CheckoutMapInnerProps) {
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(() => {
    if (isValidCoord(lat) && isValidCoord(lng)) return { lat, lng }
    return null
  })
  const geocodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Geocode address string when no coordinates provided
  useEffect(() => {
    if (isValidCoord(lat) && isValidCoord(lng)) {
      setMarkerPos({ lat, lng })
      return
    }

    if (!address) {
      setMarkerPos(null)
      return
    }

    // Debounce geocoding
    if (geocodeTimeout.current) {
      clearTimeout(geocodeTimeout.current)
    }

    geocodeTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
          { headers: { 'User-Agent': 'MAAL-LINE/1.0' } }
        )
        const data = await response.json()
        if (data.length > 0) {
          const parsedLat = parseFloat(data[0].lat)
          const parsedLng = parseFloat(data[0].lon)
          // Only set marker if both coordinates are valid — parseFloat can return NaN
          if (isValidCoord(parsedLat) && isValidCoord(parsedLng)) {
            setMarkerPos({ lat: parsedLat, lng: parsedLng })
          }
        }
      } catch {
        // Geocoding failed silently
      }
    }, 800)

    return () => {
      if (geocodeTimeout.current) {
        clearTimeout(geocodeTimeout.current)
      }
    }
  }, [lat, lng, address])

  // Compute safe center — always falls back to Mexico City
  const center: [number, number] =
    markerPos && isValidCoord(markerPos.lat) && isValidCoord(markerPos.lng)
      ? [markerPos.lat, markerPos.lng]
      : DEFAULT_CENTER

  const showMarker =
    markerPos !== null && isValidCoord(markerPos.lat) && isValidCoord(markerPos.lng)

  return (
    <MapErrorBoundary>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full min-h-[300px] w-full rounded-xl"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showMarker && (
          <FlyToMarker lat={markerPos.lat} lng={markerPos.lng} />
        )}
      </MapContainer>
    </MapErrorBoundary>
  )
}
