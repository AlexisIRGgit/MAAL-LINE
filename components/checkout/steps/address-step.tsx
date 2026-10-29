'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { MapPin, Plus } from 'lucide-react'
import { useCheckoutModalStore, type AddressData } from '@/lib/store/checkout-modal-store'
import { useAuthModalStore } from '@/lib/store/auth-modal-store'
import { hasGoogleMaps, type ParsedPlace } from '@/lib/google-maps'
import { GoogleAddressSearch } from '@/components/account/google-address-search'
import { CheckoutMap } from '@/components/checkout/checkout-map'
import { RadioCards } from '@/components/ui/radio-cards'
import { SkeletonBlock } from '@/components/ui/skeleton'
import { FloatingField } from '../floating-field'
import { PRIMARY_BUTTON, StepFooter } from '../step-footer'

const NEW_ADDRESS = 'new'
// Two-digit area codes (GDL, CDMX, MTY) read as 33 1234 5678; the rest as 312 123 4567
const TWO_DIGIT_AREAS = ['33', '55', '56', '81']

export function formatPhone(digits: string): string {
  const d = digits.slice(0, 10)
  const area = TWO_DIGIT_AREAS.includes(d.slice(0, 2)) ? 2 : 3
  const groups = area === 2 ? [d.slice(0, 2), d.slice(2, 6), d.slice(6)] : [d.slice(0, 3), d.slice(3, 6), d.slice(6)]
  return groups.filter(Boolean).join(' ')
}

const savedLine = (addr: AddressData) =>
  [addr.streetLine1, addr.streetLine2, addr.neighborhood, `${addr.city}, ${addr.state}`, `CP ${addr.postalCode}`].filter(Boolean).join(' · ')

export function AddressStep() {
  const { status, data: session } = useSession()
  const {
    selectedAddressId,
    selectedAddress,
    setSelectedAddress,
    inlineAddress,
    setInlineAddress,
    completeStep,
    nextStep,
    closeCheckoutModal,
  } = useCheckoutModalStore()
  const openAuthModal = useAuthModalStore((s) => s.openAuthModal)

  const [saved, setSaved] = useState<AddressData[] | null>(null)
  const [attempted, setAttempted] = useState(false)
  // Manual fields when there is no Maps key or Google can't be reached
  const [manual, setManual] = useState(!hasGoogleMaps)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)

  // Signed-in customers can reuse a saved address
  useEffect(() => {
    if (status !== 'authenticated') {
      if (status === 'unauthenticated') setSaved([])
      return
    }
    let cancelled = false
    fetch('/api/account/addresses')
      .then((res) => (res.ok ? res.json() : { addresses: [] }))
      .then((data: { addresses?: AddressData[] }) => {
        if (cancelled) return
        const list = data.addresses ?? []
        setSaved(list)
        const current = useCheckoutModalStore.getState()
        if (!current.selectedAddressId && !current.inlineAddress.streetLine1) {
          const pick = list.find((a) => a.isDefault) ?? list[0]
          if (pick) setSelectedAddress(pick.id, pick)
        }
      })
      .catch(() => !cancelled && setSaved([]))
    return () => {
      cancelled = true
    }
  }, [status, setSelectedAddress])

  // Start the receiver name with the account name
  useEffect(() => {
    if (session?.user?.name && !useCheckoutModalStore.getState().inlineAddress.fullName) {
      setInlineAddress({ fullName: session.user.name })
    }
  }, [session?.user?.name, setInlineAddress])

  const usingSaved = !!selectedAddressId && !!selectedAddress
  const hasPlace = !!inlineAddress.streetLine1

  const errors = {
    address: !hasPlace
      ? 'Busca y elige tu dirección'
      : !/^\d{5}$/.test(inlineAddress.postalCode)
        ? 'Esta dirección no trae código postal. Busca con calle y número.'
        : null,
    name: inlineAddress.fullName.trim().length < 2 ? 'Escribe el nombre de quien recibe' : null,
    phone: inlineAddress.phone.length !== 10 ? 'El teléfono debe tener 10 dígitos' : null,
  }
  const valid = usingSaved || (!errors.address && !errors.name && !errors.phone)

  const handlePlace = (place: ParsedPlace) => {
    setInlineAddress({
      streetLine1: [place.street, place.number].filter(Boolean).join(' ') || place.formattedAddress.split(',')[0] || '',
      neighborhood: place.neighborhood,
      city: place.city,
      state: place.state,
      postalCode: place.zipCode,
      latitude: place.latitude,
      longitude: place.longitude,
      formattedAddress: place.formattedAddress,
    })
    // Next field, like the keyboard's "next" arrow
    requestAnimationFrame(() => (inlineAddress.fullName ? phoneRef : nameRef).current?.focus())
  }

  const handleContinue = () => {
    setAttempted(true)
    if (!valid) return
    completeStep(0)
    nextStep()
  }

  const savedOptions = (saved ?? []).map((addr) => ({
    value: addr.id,
    label: addr.fullName,
    description: savedLine(addr),
    icon: <MapPin />,
    meta: addr.isDefault ? <span className="text-[11px] font-semibold text-[#6B7280] dark:text-white/50">Predeterminada</span> : undefined,
  }))

  const mapLat = usingSaved ? selectedAddress?.latitude ?? undefined : inlineAddress.latitude ?? undefined
  const mapLng = usingSaved ? selectedAddress?.longitude ?? undefined : inlineAddress.longitude ?? undefined
  const mapText = usingSaved && selectedAddress
    ? [selectedAddress.streetLine1, selectedAddress.neighborhood, selectedAddress.city, selectedAddress.state, selectedAddress.postalCode].filter(Boolean).join(', ')
    : inlineAddress.formattedAddress ||
      [inlineAddress.streetLine1, inlineAddress.city, inlineAddress.state, inlineAddress.postalCode].filter(Boolean).join(', ')
  // Typed-by-hand addresses show on the map once the postal code is complete (avoids geocoding every keystroke)
  const showMap = usingSaved || (hasPlace && (!manual || /^\d{5}$/.test(inlineAddress.postalCode)))

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-bold text-[#111827] dark:text-white">¿A dónde lo enviamos?</h3>
            {status === 'unauthenticated' && (
              <button
                type="button"
                onClick={() => {
                  closeCheckoutModal()
                  openAuthModal('login')
                }}
                className="flex-shrink-0 text-xs font-medium text-[#6B7280] underline-offset-2 hover:text-[#111827] hover:underline dark:text-white/50 dark:hover:text-white"
              >
                ¿Tienes cuenta? Entra
              </button>
            )}
          </div>

          {saved === null && status === 'authenticated' && (
            <div className="space-y-2">
              <SkeletonBlock className="h-16 w-full rounded-[20px]" />
              <SkeletonBlock index={1} className="h-16 w-full rounded-[20px]" />
            </div>
          )}

          {saved && saved.length > 0 && (
            <RadioCards
              layout="list"
              aria-label="Dirección de envío"
              value={selectedAddressId ?? NEW_ADDRESS}
              onValueChange={(value) => {
                const addr = saved.find((a) => a.id === value)
                setSelectedAddress(addr ? addr.id : null, addr ?? null)
              }}
              options={[...savedOptions, { value: NEW_ADDRESS, label: 'Otra dirección', description: 'Búscala en el mapa', icon: <Plus /> }]}
            />
          )}

          {!usingSaved && saved !== null && (
            <div className="space-y-3">
              {hasGoogleMaps && !manual && (
                <GoogleAddressSearch
                  label="Dirección de entrega"
                  initialQuery={inlineAddress.formattedAddress}
                  onSelect={handlePlace}
                  onUnavailable={() => setManual(true)}
                  error={!manual && (attempted || hasPlace) ? errors.address : null}
                />
              )}
              {manual && (
                <div className="grid grid-cols-2 gap-3">
                  <FloatingField
                    className="col-span-2"
                    label="Calle y número"
                    autoComplete="address-line1"
                    enterKeyHint="next"
                    value={inlineAddress.streetLine1}
                    onChange={(e) => setInlineAddress({ streetLine1: e.target.value, latitude: null, longitude: null, formattedAddress: '' })}
                    error={attempted && !inlineAddress.streetLine1 ? 'Escribe tu calle y número' : null}
                  />
                  <FloatingField
                    label="Código postal"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={5}
                    value={inlineAddress.postalCode}
                    onChange={(e) => setInlineAddress({ postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                    error={attempted && !/^\d{5}$/.test(inlineAddress.postalCode) ? '5 dígitos' : null}
                  />
                  <FloatingField
                    label="Ciudad"
                    autoComplete="address-level2"
                    value={inlineAddress.city}
                    onChange={(e) => setInlineAddress({ city: e.target.value })}
                  />
                  <FloatingField
                    className="col-span-2"
                    label="Estado"
                    autoComplete="address-level1"
                    value={inlineAddress.state}
                    onChange={(e) => setInlineAddress({ state: e.target.value })}
                  />
                </div>
              )}

              {/* On phones the map sits right under the search, so people see the pin they picked */}
              {showMap && (
                <div className="h-44 overflow-hidden rounded-[20px] border border-[#E5E7EB] dark:border-white/10 md:hidden">
                  <CheckoutMap lat={mapLat} lng={mapLng} address={mapText || undefined} />
                </div>
              )}

              <FloatingField
                ref={nameRef}
                label="Nombre de quien recibe"
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                maxLength={100}
                value={inlineAddress.fullName}
                onChange={(e) => setInlineAddress({ fullName: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    phoneRef.current?.focus()
                  }
                }}
                error={attempted ? errors.name : null}
              />
              <FloatingField
                ref={phoneRef}
                label="Teléfono (10 dígitos)"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                enterKeyHint="done"
                value={formatPhone(inlineAddress.phone)}
                onChange={(e) => setInlineAddress({ phone: e.target.value.replace(/\D/g, '').replace(/^52(?=\d{10})/, '').slice(0, 10) })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleContinue()
                  }
                }}
                error={attempted ? errors.phone : null}
                hint={!attempted ? 'Solo para coordinar la entrega' : null}
              />
            </div>
          )}

          {usingSaved && (
            <div className="h-44 overflow-hidden rounded-[20px] border border-[#E5E7EB] dark:border-white/10 md:hidden">
              <CheckoutMap lat={mapLat} lng={mapLng} address={mapText || undefined} />
            </div>
          )}
        </div>

        {/* Map column from md up */}
        <div className="hidden md:block">
          <div className="sticky top-0 h-[360px] overflow-hidden rounded-[20px] border border-[#E5E7EB] dark:border-white/10">
            {showMap ? (
              <CheckoutMap lat={mapLat} lng={mapLng} address={mapText || undefined} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#F9FAFB] text-center dark:bg-white/[0.03]">
                <MapPin className="h-6 w-6 text-[#9CA3AF]" />
                <p className="max-w-[220px] text-sm text-[#6B7280] dark:text-white/50">Busca tu dirección y aquí verás el punto de entrega</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <StepFooter>
        <button type="button" onClick={handleContinue} disabled={saved === null} className={PRIMARY_BUTTON}>
          Continuar al envío
        </button>
      </StepFooter>
    </div>
  )
}
