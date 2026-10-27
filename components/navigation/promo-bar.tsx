'use client'

import { useState, useEffect } from 'react'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/store-settings'

const FREE_SHIPPING_MESSAGE = `ENVÍO GRATIS EN PEDIDOS +$${FREE_SHIPPING_THRESHOLD}`
const OTHER_MESSAGES = [
  'NEW DROP — OVERSIZED COLLECTION',
  'PAGO EN 3 MSI CON TARJETAS PARTICIPANTES',
]
// Last value from the server, so returning visitors don't see the message flash in or out
const BANNER_CACHE_KEY = 'maal-free-shipping-banner'

function readCachedBanner(): boolean {
  try {
    return localStorage.getItem(BANNER_CACHE_KEY) !== 'false'
  } catch {
    return true
  }
}

export function PromoBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFreeShipping, setShowFreeShipping] = useState(true)

  // The free-shipping message can be turned off in Admin > Configuración > Envíos
  useEffect(() => {
    setShowFreeShipping(readCachedBanner())
    fetch('/api/store/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (typeof data?.freeShippingBanner !== 'boolean') return
        setShowFreeShipping(data.freeShippingBanner)
        try {
          localStorage.setItem(BANNER_CACHE_KEY, String(data.freeShippingBanner))
        } catch {}
      })
      .catch(() => {})
  }, [])

  const messages = showFreeShipping ? [FREE_SHIPPING_MESSAGE, ...OTHER_MESSAGES] : OTHER_MESSAGES

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [messages.length])

  if (!isVisible) return null

  return (
    <div className="bg-[#111827] text-white relative">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center relative">
        <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-center">
          ✦ {messages[currentIndex % messages.length]} ✦
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:opacity-50 transition-opacity text-white"
          aria-label="Cerrar"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
