'use client'

import { useState, useEffect } from 'react'

const PROMO_MESSAGES = [
  'ENVÍO GRATIS EN PEDIDOS +$999',
  'NEW DROP — OVERSIZED COLLECTION',
  'PAGO EN 3 MSI CON TARJETAS PARTICIPANTES',
]

export function PromoBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_MESSAGES.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className="bg-[#E8E4D9] text-[#0A0A0A] relative">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center relative">
        <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-center">
          ✦ {PROMO_MESSAGES[currentIndex]} ✦
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:opacity-50 transition-opacity"
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
