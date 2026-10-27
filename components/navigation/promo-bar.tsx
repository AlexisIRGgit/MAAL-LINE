'use client'

import { useState, useEffect } from 'react'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/store-settings'

const FREE_SHIPPING_MESSAGE = `ENVÍO GRATIS EN PEDIDOS +$${FREE_SHIPPING_THRESHOLD}`
const OTHER_MESSAGES = [
  'NEW DROP — OVERSIZED COLLECTION',
  'PAGO EN 3 MSI CON TARJETAS PARTICIPANTES',
]
// Last values from the server, so returning visitors don't see the bar or message flash
const BAR_CACHE_KEY = 'maal-promo-bar'
const BANNER_CACHE_KEY = 'maal-free-shipping-banner'

function readCachedFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) !== 'false'
  } catch {
    return true
  }
}

function cacheFlag(key: string, value: boolean) {
  try {
    localStorage.setItem(key, String(value))
  } catch {}
}

export function PromoBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [barEnabled, setBarEnabled] = useState(true)
  const [showFreeShipping, setShowFreeShipping] = useState(true)

  // Admin > Configuración: General turns the whole bar off, Envíos the free-shipping message
  useEffect(() => {
    setBarEnabled(readCachedFlag(BAR_CACHE_KEY))
    setShowFreeShipping(readCachedFlag(BANNER_CACHE_KEY))
    fetch('/api/store/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (typeof data?.promoBar === 'boolean') {
          setBarEnabled(data.promoBar)
          cacheFlag(BAR_CACHE_KEY, data.promoBar)
        }
        if (typeof data?.freeShippingBanner === 'boolean') {
          setShowFreeShipping(data.freeShippingBanner)
          cacheFlag(BANNER_CACHE_KEY, data.freeShippingBanner)
        }
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

  if (!isVisible || !barEnabled) return null

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
