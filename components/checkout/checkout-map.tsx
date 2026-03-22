'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

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

interface CheckoutMapProps {
  lat?: number
  lng?: number
  address?: string
}

export function CheckoutMap({ lat, lng, address }: CheckoutMapProps) {
  // Sanitize coordinates — pass undefined if not valid finite numbers
  const safeLat = typeof lat === 'number' && Number.isFinite(lat) ? lat : undefined
  const safeLng = typeof lng === 'number' && Number.isFinite(lng) ? lng : undefined

  // Only mount the Leaflet map once its container is actually visible.
  // Leaflet computes pixel dimensions on init; if the container has
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
      {visible ? (
        <CheckoutMapInner lat={safeLat} lng={safeLng} address={address} />
      ) : (
        <div className="h-full min-h-[300px] w-full rounded-xl bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Cargando mapa...</div>
        </div>
      )}
    </div>
  )
}
