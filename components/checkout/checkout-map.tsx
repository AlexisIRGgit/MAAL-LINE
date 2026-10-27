'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import { GoogleAddressMap } from '@/components/ui/google-address-map'
import { hasGoogleMaps, loadGoogleMaps } from '@/lib/google-maps'

const CheckoutMapInner = dynamic(
  () => import('./checkout-map-inner'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[300px] w-full rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Cargando mapa...</div>
      </div>
    ),
  }
)

// Same address → same point; avoids re-geocoding when people switch between addresses
const geocodeCache = new Map<string, { lat: number; lng: number } | null>()

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (geocodeCache.has(address)) return geocodeCache.get(address) ?? null
  await loadGoogleMaps()
  const { Geocoder } = (await google.maps.importLibrary('geocoding')) as google.maps.GeocodingLibrary
  const { results } = await new Geocoder().geocode({ address, region: 'mx', componentRestrictions: { country: 'MX' } })
  const hit = results[0]
  const point = hit ? { lat: hit.geometry.location.lat(), lng: hit.geometry.location.lng() } : null
  geocodeCache.set(address, point)
  return point
}

/** Google map (dark in dark mode) with the address pin, like the account address wizard */
function GoogleCheckoutMap({ lat, lng, address }: CheckoutMapProps) {
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(
    lat !== undefined && lng !== undefined ? { lat, lng } : null
  )
  const [status, setStatus] = useState<'ready' | 'locating' | 'missing'>('ready')

  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      setPoint({ lat, lng })
      setStatus('ready')
      return
    }
    if (!address) {
      setPoint(null)
      setStatus('missing')
      return
    }
    let cancelled = false
    setStatus('locating')
    geocodeAddress(`${address}, México`)
      .then((found) => {
        if (cancelled) return
        setPoint(found)
        setStatus(found ? 'ready' : 'missing')
      })
      .catch(() => !cancelled && setStatus('missing'))
    return () => {
      cancelled = true
    }
  }, [lat, lng, address])

  if (point) {
    return (
      <GoogleAddressMap
        latitude={point.lat}
        longitude={point.lng}
        zoom={16}
        className="h-full min-h-[300px] w-full rounded-none"
      />
    )
  }

  return (
    <div className="h-full min-h-[300px] w-full bg-gray-100 flex flex-col items-center justify-center gap-2 text-center px-6">
      <MapPin className="w-6 h-6 text-gray-400" />
      <p className="text-gray-400 text-sm">
        {status === 'locating' ? 'Ubicando la dirección...' : 'No pudimos ubicar esta dirección en el mapa'}
      </p>
    </div>
  )
}

interface CheckoutMapProps {
  lat?: number
  lng?: number
  address?: string
}

export function CheckoutMap({ lat, lng, address }: CheckoutMapProps) {
  // Sanitize coordinates — pass undefined if not valid finite numbers
  const safeLat = typeof lat === 'number' && Number.isFinite(lat) ? lat : undefined
  const safeLng = typeof lng === 'number' && Number.isFinite(lng) ? lng : undefined

  // Only mount the map once its container is actually visible (it's hidden below lg),
  // so phones never load the map script.
  // The Leaflet fallback computes pixel dimensions on init; if the container has
  // display:none (e.g. `hidden lg:block`) it gets 0x0, which can cause
  // internal NaN calculations and crash with "Invalid LatLng object".
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Use IntersectionObserver to detect when the container becomes visible
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        },
        { threshold: 0.01 }
      )
      observer.observe(el)
      return () => observer.disconnect()
    }

    // Fallback: just render immediately
    setVisible(true)
  }, [])

  return (
    <div ref={containerRef} className="h-full w-full">
      {visible && hasGoogleMaps ? (
        <GoogleCheckoutMap lat={safeLat} lng={safeLng} address={address} />
      ) : visible ? (
        <CheckoutMapInner lat={safeLat} lng={safeLng} address={address} />
      ) : (
        <div className="h-full min-h-[300px] w-full rounded-xl bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Cargando mapa...</div>
        </div>
      )}
    </div>
  )
}
