'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence, useReducedMotion, animate, useMotionValue } from 'framer-motion'
import { Home, Building2, MapPin, ChevronLeft, ArrowRight, Check, Loader2, AlertTriangle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Stepper, type StepperStep } from '@/components/ui/stepper'
import type { Address } from '@/components/account/address-card'

// MapLibre touches window, so the map only loads on the client
const AddressMap = dynamic(() => import('@/components/ui/address-map').then((m) => m.AddressMap), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-2xl bg-[#F3F4F6] animate-pulse" />,
})

const STEPS: StepperStep[] = [
  { id: 'contact', label: 'Contacto', description: 'Quién recibe' },
  { id: 'address', label: 'Dirección', description: 'Calle y colonia' },
  { id: 'confirm', label: 'Confirmar', description: 'Revisa el mapa' },
]

const ADDRESS_TYPES = [
  { value: 'home', label: 'Casa', icon: Home },
  { value: 'work', label: 'Oficina', icon: Building2 },
  { value: 'other', label: 'Otro', icon: MapPin },
] as const

const inputClass =
  'w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all dark:bg-white/[0.05] dark:border-white/10'

type GeoState =
  | { status: 'idle' | 'loading' | 'failed' }
  | { status: 'found' | 'approximate'; lat: number; lng: number }

interface NominatimResult {
  lat: string
  lon: string
}

/** Forward-geocodes with OpenStreetMap Nominatim, falling back to broader queries. */
async function geocodeAddress(data: Partial<Address>, signal: AbortSignal): Promise<GeoState> {
  const base = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=mx'
  const street = [data.number, data.street].filter(Boolean).join(' ')
  const attempts: { params: Record<string, string>; exact: boolean }[] = [
    { params: { street, city: data.city ?? '', state: data.state ?? '', postalcode: data.zipCode ?? '' }, exact: true },
    { params: { q: [`${data.street ?? ''} ${data.number ?? ''}`, data.neighborhood, data.city, data.state, data.zipCode].filter(Boolean).join(', ') }, exact: true },
    { params: { postalcode: data.zipCode ?? '', country: 'México' }, exact: false },
    { params: { city: data.city ?? '', state: data.state ?? '' }, exact: false },
  ]

  for (const attempt of attempts) {
    const params = Object.entries(attempt.params).filter(([, value]) => value.trim())
    if (params.length === 0) continue
    const query = params.map(([key, value]) => `${key}=${encodeURIComponent(value.trim())}`).join('&')
    const response = await fetch(`${base}&${query}`, { signal, headers: { 'Accept-Language': 'es' } })
    if (!response.ok) continue
    const results = (await response.json()) as NominatimResult[]
    const hit = results[0]
    if (hit) {
      return { status: attempt.exact ? 'found' : 'approximate', lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) }
    }
  }
  return { status: 'failed' }
}

/** Animates its height to fit the content, so step changes don't jump. */
function AnimatedHeight({ children }: { children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const height = useMotionValue<number | 'auto'>('auto')
  const reduceMotion = useReducedMotion()

  useLayoutEffect(() => {
    const node = innerRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    let measured = false
    const observer = new ResizeObserver(() => {
      const next = node.offsetHeight
      if (!measured || reduceMotion) {
        measured = true
        height.jump(next)
        return
      }
      animate(height, next, { type: 'spring', stiffness: 320, damping: 34 })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [height, reduceMotion])

  return (
    <motion.div style={{ height }} className="relative overflow-hidden">
      <div ref={innerRef}>{children}</div>
    </motion.div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-sm font-medium text-[#374151] mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export function AddressWizard({
  formData,
  onChange,
  onSubmit,
  isSaving,
  isEditing,
}: {
  formData: Partial<Address>
  onChange: (patch: Partial<Address>) => void
  onSubmit: () => void
  isSaving: boolean
  isEditing: boolean
}) {
  const reduceMotion = useReducedMotion()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [geo, setGeo] = useState<GeoState>({ status: 'idle' })
  const geocodedKey = useRef<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)

  const canContinue = [
    !!formData.fullName?.trim(),
    !!formData.street?.trim() && !!formData.city?.trim(),
    true,
  ][step]

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  // Geocode when the confirm step opens, and again only if the address changed
  const addressKey = [formData.street, formData.number, formData.neighborhood, formData.city, formData.state, formData.zipCode].join('|')
  useEffect(() => {
    if (step !== 2) return
    if (geocodedKey.current === `${addressKey}#${retryToken}`) return
    geocodedKey.current = `${addressKey}#${retryToken}`
    const controller = new AbortController()
    setGeo({ status: 'loading' })
    geocodeAddress(formData, controller.signal)
      .then(setGeo)
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') setGeo({ status: 'failed' })
      })
    return () => controller.abort()
    // formData is read through addressKey; re-running on every keystroke elsewhere isn't needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, addressKey, retryToken])

  const slide = {
    enter: (dir: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * 28, filter: 'blur(4px)' }),
    center: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: (dir: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * -28, filter: 'blur(4px)' }),
  }

  const streetLine = `${formData.street ?? ''} ${formData.number ?? ''}`.trim() + (formData.interior ? `, ${formData.interior}` : '')
  const cityLine = [formData.neighborhood, formData.city, formData.state].filter(Boolean).join(', ') + (formData.zipCode ? ` ${formData.zipCode}` : '')

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pr-14">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF]">{isEditing ? 'Editar dirección' : 'Nueva dirección'}</p>
        <h2 id="address-wizard-title" className="mt-1 text-lg font-bold text-[#111827]">
          {STEPS[step].label}
        </h2>
      </div>

      <div className="px-6 pt-5 pb-2">
        <Stepper steps={STEPS} current={step} onStepSelect={goTo} />
      </div>

      {/* Step content */}
      <AnimatedHeight>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0.12 : 0.32, ease: [0.2, 0, 0.2, 1] }}
            className="px-6 py-5 space-y-4"
          >
            {step === 0 && (
              <>
                <div>
                  <span className="block text-sm font-medium text-[#374151] mb-2">Tipo de dirección</span>
                  <div className="grid grid-cols-3 gap-2">
                    {ADDRESS_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => onChange({ type: type.value, label: type.label })}
                        className={cn(
                          'flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-sm font-medium transition-all',
                          formData.type === type.value
                            ? 'border-[#FF3D00] bg-[#FF3D00]/[0.06] text-[#FF3D00] shadow-[0_0_0_3px_rgba(255,61,0,0.12)]'
                            : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] dark:border-white/10 dark:hover:border-white/20'
                        )}
                      >
                        <type.icon className="w-5 h-5" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Nombre completo">
                  <input
                    type="text"
                    autoComplete="name"
                    value={formData.fullName ?? ''}
                    onChange={(e) => onChange({ fullName: e.target.value })}
                    className={inputClass}
                    placeholder="Quién recibe el paquete"
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone ?? ''}
                    onChange={(e) => onChange({ phone: e.target.value })}
                    className={inputClass}
                    placeholder="+52 55 1234 5678"
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Calle" className="col-span-2">
                    <input
                      type="text"
                      autoComplete="address-line1"
                      value={formData.street ?? ''}
                      onChange={(e) => onChange({ street: e.target.value })}
                      className={inputClass}
                      placeholder="Av. Reforma"
                    />
                  </Field>
                  <Field label="Número">
                    <input
                      type="text"
                      value={formData.number ?? ''}
                      onChange={(e) => onChange({ number: e.target.value })}
                      className={inputClass}
                      placeholder="123"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Interior (opcional)">
                    <input
                      type="text"
                      autoComplete="address-line2"
                      value={formData.interior ?? ''}
                      onChange={(e) => onChange({ interior: e.target.value })}
                      className={inputClass}
                      placeholder="Depto 4B"
                    />
                  </Field>
                  <Field label="Colonia">
                    <input
                      type="text"
                      value={formData.neighborhood ?? ''}
                      onChange={(e) => onChange({ neighborhood: e.target.value })}
                      className={inputClass}
                      placeholder="Col. Centro"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Field label="Ciudad">
                    <input
                      type="text"
                      autoComplete="address-level2"
                      value={formData.city ?? ''}
                      onChange={(e) => onChange({ city: e.target.value })}
                      className={inputClass}
                      placeholder="Guadalajara"
                    />
                  </Field>
                  <Field label="Estado">
                    <input
                      type="text"
                      autoComplete="address-level1"
                      value={formData.state ?? ''}
                      onChange={(e) => onChange({ state: e.target.value })}
                      className={inputClass}
                      placeholder="Jalisco"
                    />
                  </Field>
                  <Field label="Código Postal" className="col-span-2 sm:col-span-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={formData.zipCode ?? ''}
                      onChange={(e) => onChange({ zipCode: e.target.value })}
                      className={inputClass}
                      placeholder="44580"
                    />
                  </Field>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="relative h-52 sm:h-56">
                  {geo.status === 'found' || geo.status === 'approximate' ? (
                    <AddressMap longitude={geo.lng} latitude={geo.lat} label={formData.label} zoom={geo.status === 'found' ? 16 : 13} className="h-full w-full" />
                  ) : (
                    <div className="h-full w-full rounded-2xl bg-[#F3F4F6] flex flex-col items-center justify-center gap-2 text-center px-6">
                      {geo.status === 'failed' ? (
                        <>
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          <p className="text-sm text-[#6B7280]">No encontramos esta dirección en el mapa</p>
                          <button
                            type="button"
                            onClick={() => setRetryToken((n) => n + 1)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#111827] hover:underline"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reintentar
                          </button>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-[#9CA3AF]" />
                          <p className="text-sm text-[#6B7280]">Buscando tu dirección…</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {geo.status === 'approximate' && (
                  <p className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    Ubicación aproximada por código postal o ciudad. Revisa que los datos sean correctos.
                  </p>
                )}

                <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-white/[0.05] dark:ring-1 dark:ring-white/[0.06]">
                  <p className="text-sm font-semibold text-[#111827]">{formData.fullName}</p>
                  <p className="mt-1 text-sm text-[#374151]">{streetLine}</p>
                  <p className="text-sm text-[#6B7280]">{cityLine}</p>
                  {formData.phone && <p className="mt-1 text-xs text-[#6B7280] tabular-nums">{formData.phone}</p>}
                  <button type="button" onClick={() => goTo(1)} className="mt-3 text-xs font-medium text-[#FF3D00] hover:underline">
                    ¿No es tu dirección? Corregir
                  </button>
                </div>

                <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#F9FAFB] dark:bg-white/[0.05] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.isDefault}
                    onChange={(e) => onChange({ isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-[#D1D5DB] accent-[#FF3D00]"
                  />
                  <span className="text-sm text-[#374151]">Usar como dirección principal</span>
                </label>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </AnimatedHeight>

      {/* Footer */}
      <div className="px-6 pb-6 pt-1 flex items-center gap-2">
        {step > 0 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="inline-flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] dark:hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </button>
        )}
        <button
          type="button"
          disabled={!canContinue || isSaving}
          onClick={() => (step < STEPS.length - 1 ? goTo(step + 1) : onSubmit())}
          className="ml-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#111827] text-white text-sm font-semibold hover:bg-[#1F2937] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {step < STEPS.length - 1 ? (
            <>
              Continuar
              <ArrowRight className="w-4 h-4" />
            </>
          ) : isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              {isEditing ? 'Guardar cambios' : 'Guardar dirección'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
