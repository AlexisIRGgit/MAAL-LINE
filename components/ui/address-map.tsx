'use client'

import { useEffect, useRef, useState } from 'react'
import type * as MapLibreGL from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTheme } from 'next-themes'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { createPinElement, setPinLabel } from '@/components/ui/map-pin'

// Same setup as mapcn (mapcn.dev): MapLibre GL with CARTO's free basemaps per theme
const MAP_STYLES = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const

type MapLibreModule = typeof MapLibreGL

let maplibrePromise: Promise<MapLibreModule> | null = null

/** Loads MapLibre once on the client; its worker is served from unpkg for the installed version. */
function loadMapLibre() {
  maplibrePromise ??= import('maplibre-gl')
    .then((lib) => {
      if (!lib.getWorkerUrl()) {
        lib.setWorkerUrl(`https://unpkg.com/maplibre-gl@${lib.getVersion()}/dist/maplibre-gl-worker.mjs`)
      }
      return lib
    })
    .catch((error) => {
      maplibrePromise = null
      throw error
    })
  return maplibrePromise
}

export function AddressMap({
  longitude,
  latitude,
  label,
  zoom = 16,
  draggable = false,
  onPositionChange,
  className,
}: {
  longitude: number
  latitude: number
  label?: string
  zoom?: number
  /** Lets people drag the pin (or tap the map) to mark the exact spot */
  draggable?: boolean
  onPositionChange?: (position: { latitude: number; longitude: number }) => void
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreGL.Map | null>(null)
  const markerRef = useRef<MapLibreGL.Marker | null>(null)
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light'
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const onPositionChangeRef = useRef(onPositionChange)
  onPositionChangeRef.current = onPositionChange

  // Create the map once
  useEffect(() => {
    let cancelled = false
    loadMapLibre()
      .then((lib) => {
        if (cancelled || !containerRef.current) return
        const map = new lib.Map({
          container: containerRef.current,
          style: MAP_STYLES[theme],
          center: [longitude, latitude],
          zoom,
          attributionControl: { compact: true },
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
        })
        map.addControl(new lib.NavigationControl({ showCompass: false }), 'top-right')
        map.touchZoomRotate.disableRotation()
        map.once('load', () => {
          if (cancelled) return
          // Compact attribution starts expanded; keep it as the small (i) button until tapped
          containerRef.current?.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show')
          setLoaded(true)
        })
        const marker = new lib.Marker({ element: createPinElement(label), anchor: 'center', draggable })
          .setLngLat([longitude, latitude])
          .addTo(map)
        if (draggable) {
          const report = () => {
            const { lat, lng } = marker.getLngLat()
            onPositionChangeRef.current?.({ latitude: lat, longitude: lng })
          }
          marker.on('dragend', report)
          map.on('click', (event) => {
            marker.setLngLat(event.lngLat)
            report()
          })
        }
        markerRef.current = marker
        mapRef.current = map
      })
      .catch(() => !cancelled && setFailed(true))

    return () => {
      cancelled = true
      markerRef.current?.remove()
      mapRef.current?.remove()
      markerRef.current = null
      mapRef.current = null
    }
    // The map is created once; position, label and theme are synced by the effects below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Follow the address when it changes (a drag already moved the pin, so only pan if needed)
  useEffect(() => {
    const marker = markerRef.current
    const current = marker?.getLngLat()
    if (current && Math.abs(current.lat - latitude) < 1e-7 && Math.abs(current.lng - longitude) < 1e-7) return
    marker?.setLngLat([longitude, latitude])
    mapRef.current?.flyTo({ center: [longitude, latitude], zoom, duration: 1200, essential: true })
  }, [longitude, latitude, zoom])

  // Swap basemap with the theme
  useEffect(() => {
    mapRef.current?.setStyle(MAP_STYLES[theme])
  }, [theme])

  // Keep the pin label in sync
  useEffect(() => {
    const pin = markerRef.current?.getElement()
    if (pin) setPinLabel(pin, label)
  }, [label])

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-[#F3F4F6]', className)}>
      {/* maplibre-gl.css sets .maplibregl-map { position: relative }, so size the container directly */}
      <div ref={containerRef} className="h-full w-full" />
      {!loaded && !failed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#9CA3AF]" />
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-[#6B7280]">
          No se pudo cargar el mapa
        </div>
      )}
    </div>
  )
}
