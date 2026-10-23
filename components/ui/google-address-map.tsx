'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { loadGoogleMaps, GOOGLE_MAP_ID } from '@/lib/google-maps'
import { createPinElement, setPinLabel } from '@/components/ui/map-pin'

export function GoogleAddressMap({
  longitude,
  latitude,
  label,
  zoom = 17,
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
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)
  const pinRef = useRef<HTMLElement | null>(null)
  const positionRef = useRef({ latitude, longitude })
  positionRef.current = { latitude, longitude }
  const onPositionChangeRef = useRef(onPositionChange)
  onPositionChangeRef.current = onPositionChange
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'dark' ? 'dark' : 'light'
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  // Google fixes the color scheme at creation, so the map is rebuilt when the theme changes
  useEffect(() => {
    let cancelled = false
    const listeners: google.maps.MapsEventListener[] = []
    setLoaded(false)

    loadGoogleMaps()
      .then(async () => {
        const [{ Map }, { AdvancedMarkerElement }, core] = await Promise.all([
          google.maps.importLibrary('maps') as Promise<google.maps.MapsLibrary>,
          google.maps.importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
          google.maps.importLibrary('core') as Promise<google.maps.CoreLibrary>,
        ])
        if (cancelled || !containerRef.current) return

        const { latitude: lat, longitude: lng } = positionRef.current
        const map = new Map(containerRef.current, {
          center: { lat, lng },
          zoom,
          mapId: GOOGLE_MAP_ID,
          colorScheme: theme === 'dark' ? core.ColorScheme.DARK : core.ColorScheme.LIGHT,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          // One-finger panning inside the modal on phones
          gestureHandling: 'greedy',
        })

        const pin = createPinElement(label)
        // Advanced markers anchor at the bottom center; the pin dot should sit on the point
        pin.style.transform = 'translateY(50%)'
        pinRef.current = pin
        const marker = new AdvancedMarkerElement({ map, position: { lat, lng }, content: pin, gmpDraggable: draggable })

        if (draggable) {
          const report = () => {
            const position = marker.position
            if (!position) return
            const point = position instanceof google.maps.LatLng ? position : new google.maps.LatLng(position)
            onPositionChangeRef.current?.({ latitude: point.lat(), longitude: point.lng() })
          }
          listeners.push(marker.addListener('dragend', report))
          listeners.push(
            map.addListener('click', (event: google.maps.MapMouseEvent) => {
              if (!event.latLng) return
              marker.position = event.latLng
              report()
            })
          )
        }

        listeners.push(map.addListener('tilesloaded', () => !cancelled && setLoaded(true)))
        mapRef.current = map
        markerRef.current = marker
      })
      .catch(() => !cancelled && setFailed(true))

    return () => {
      cancelled = true
      listeners.forEach((listener) => listener.remove())
      if (markerRef.current) markerRef.current.map = null
      markerRef.current = null
      mapRef.current = null
    }
    // Position, label and zoom are synced below; only the theme rebuilds the map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, draggable])

  // Follow the address when it changes (a drag already moved the pin, so only pan if needed)
  useEffect(() => {
    const marker = markerRef.current
    const map = mapRef.current
    if (!marker || !map) return
    const current = marker.position
    const point = current ? (current instanceof google.maps.LatLng ? current : new google.maps.LatLng(current)) : null
    if (point && Math.abs(point.lat() - latitude) < 1e-7 && Math.abs(point.lng() - longitude) < 1e-7) return
    marker.position = { lat: latitude, lng: longitude }
    map.panTo({ lat: latitude, lng: longitude })
    map.setZoom(zoom)
  }, [latitude, longitude, zoom])

  useEffect(() => {
    if (pinRef.current) setPinLabel(pinRef.current, label)
  }, [label])

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-[#F3F4F6]', className)}>
      <div ref={containerRef} className="h-full w-full" />
      {!loaded && !failed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
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
