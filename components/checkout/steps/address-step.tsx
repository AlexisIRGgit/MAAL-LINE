'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Navigation, Loader2, Pencil } from 'lucide-react'
import { useCheckoutModalStore, type AddressData } from '@/lib/store/checkout-modal-store'
import { CheckoutMap } from '@/components/checkout/checkout-map'
import { cn } from '@/lib/utils/cn'
import { toast } from '@/lib/toast'

export function AddressStep() {
  const {
    selectedAddressId,
    selectedAddress,
    setSelectedAddress,
    completeStep,
    nextStep,
  } = useCheckoutModalStore()

  const [addresses, setAddresses] = useState<AddressData[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [geolocating, setGeolocating] = useState(false)
  const [mapAddress, setMapAddress] = useState<string>('')
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | undefined>()
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)

  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    streetLine1: '',
    streetLine2: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
  })

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/account/addresses')
        if (response.ok) {
          const data = await response.json()
          const fetched: AddressData[] = data.addresses || []
          setAddresses(fetched)

          // Pre-select default or first
          if (!selectedAddressId) {
            const defaultAddr = fetched.find((a) => a.isDefault)
            const toSelect = defaultAddr || fetched[0]
            if (toSelect) {
              setSelectedAddress(toSelect.id, toSelect)
              updateMap(toSelect)
            }
          } else {
            // Re-find the selected address in fetched data
            const found = fetched.find((a) => a.id === selectedAddressId)
            if (found) {
              updateMap(found)
            }
          }
        }
      } catch {
        toast.error('Error al cargar direcciones')
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateMap = (addr: AddressData) => {
    const parts = [addr.streetLine1, addr.neighborhood, addr.city, addr.state, addr.postalCode].filter(Boolean)
    setMapAddress(parts.join(', '))
    setMapCoords(undefined)
  }

  const handleSelectAddress = (addr: AddressData) => {
    setSelectedAddress(addr.id, addr)
    updateMap(addr)
    setShowNewForm(false)
    setEditingAddressId(null)
  }

  const handleEditAddress = (addr: AddressData) => {
    setEditingAddressId(addr.id)
    setNewAddress({
      fullName: addr.fullName,
      phone: addr.phone || '',
      streetLine1: addr.streetLine1,
      streetLine2: addr.streetLine2 || '',
      neighborhood: addr.neighborhood || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
    })
    setShowNewForm(true)
  }

  const handleCancelForm = () => {
    setShowNewForm(false)
    setEditingAddressId(null)
    setNewAddress({ fullName: '', phone: '', streetLine1: '', streetLine2: '', neighborhood: '', city: '', state: '', postalCode: '' })
  }

  const handleFieldChange = (field: string, value: string) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }))
  }

  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }

    setGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setMapCoords({ lat: latitude, lng: longitude })

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'User-Agent': 'MAAL-LINE/1.0' } }
          )
          const data = await response.json()
          if (data.address) {
            const a = data.address
            setNewAddress((prev) => ({
              ...prev,
              streetLine1: [a.road, a.house_number].filter(Boolean).join(' ') || prev.streetLine1,
              neighborhood: a.suburb || a.neighbourhood || prev.neighborhood,
              city: a.city || a.town || a.municipality || prev.city,
              state: a.state || prev.state,
              postalCode: a.postcode || prev.postalCode,
            }))
          }
        } catch {
          toast.error('Error al obtener dirección')
        } finally {
          setGeolocating(false)
        }
      },
      () => {
        toast.error('No se pudo obtener tu ubicación')
        setGeolocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSaveAddress = async () => {
    if (!newAddress.fullName.trim() || !newAddress.streetLine1.trim() || !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.postalCode.trim()) {
      toast.warning('Completa los campos obligatorios')
      return
    }

    setSavingAddress(true)
    try {
      const isEditing = editingAddressId !== null
      const url = isEditing
        ? `/api/account/addresses/${editingAddressId}`
        : '/api/account/addresses'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAddress,
          country: 'MX',
          ...(!isEditing && { isDefault: addresses.length === 0 }),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const saved: AddressData = data.address

        if (isEditing) {
          setAddresses((prev) => prev.map((a) => (a.id === editingAddressId ? saved : a)))
          // Update selected address if the edited one was selected
          if (selectedAddressId === editingAddressId) {
            setSelectedAddress(saved.id, saved)
          }
          toast.success('Dirección actualizada')
        } else {
          setAddresses((prev) => [...prev, saved])
          setSelectedAddress(saved.id, saved)
          toast.success('Dirección guardada')
        }

        updateMap(saved)
        setShowNewForm(false)
        setEditingAddressId(null)
        setNewAddress({ fullName: '', phone: '', streetLine1: '', streetLine2: '', neighborhood: '', city: '', state: '', postalCode: '' })
      } else {
        const errData = await response.json()
        toast.error(errData.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error al guardar dirección')
    } finally {
      setSavingAddress(false)
    }
  }

  const handleContinue = () => {
    if (!selectedAddressId) {
      toast.warning('Selecciona una dirección')
      return
    }
    completeStep(0)
    nextStep()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Address Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Dirección de envío</h3>

          {/* Geolocation Banner — shown when no addresses */}
          {addresses.length === 0 && !showNewForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Navigation className="w-5 h-5" />
                <span className="font-medium">¿Usar tu ubicación actual?</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNewForm(true)
                    handleGeolocation()
                  }}
                  disabled={geolocating}
                  className="flex-1 py-2.5 bg-[#FF3D00] text-white text-sm font-bold rounded-xl hover:bg-[#E63600] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {geolocating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  Usar mi ubicación
                </button>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Ingresar manualmente
                </button>
              </div>
            </div>
          )}

          {/* Saved Address Cards */}
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                'relative w-full text-left p-4 border rounded-xl transition-colors cursor-pointer',
                selectedAddressId === addr.id
                  ? 'border-[#FF3D00] bg-[#FF3D00]/5'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => handleSelectAddress(addr)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectAddress(addr) }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditAddress(addr)
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={`Editar dirección de ${addr.fullName}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  selectedAddressId === addr.id ? 'border-[#FF3D00]' : 'border-gray-300'
                )}>
                  {selectedAddressId === addr.id && (
                    <div className="w-2 h-2 rounded-full bg-[#FF3D00]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{addr.fullName}</p>
                  <p className="text-gray-600 text-sm mt-1">{addr.streetLine1}</p>
                  {addr.streetLine2 && <p className="text-gray-600 text-sm">{addr.streetLine2}</p>}
                  <p className="text-gray-600 text-sm">
                    {[addr.neighborhood, addr.city, addr.state].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-gray-600 text-sm">CP {addr.postalCode}</p>
                  {addr.phone && <p className="text-gray-500 text-xs mt-1">{addr.phone}</p>}
                  {addr.isDefault && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Predeterminada
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add New Address Button */}
          {addresses.length > 0 && !showNewForm && (
            <button
              onClick={() => {
                setEditingAddressId(null)
                setNewAddress({ fullName: '', phone: '', streetLine1: '', streetLine2: '', neighborhood: '', city: '', state: '', postalCode: '' })
                setShowNewForm(true)
              }}
              className="w-full py-3 border border-dashed border-gray-300 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar nueva dirección
            </button>
          )}

          {/* New Address Form */}
          {showNewForm && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {editingAddressId ? 'Editar dirección' : 'Nueva dirección'}
                </h4>
                {(addresses.length > 0 || editingAddressId) && (
                  <button
                    onClick={handleCancelForm}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {/* Geolocation button inside form */}
              {addresses.length > 0 && (
                <button
                  onClick={handleGeolocation}
                  disabled={geolocating}
                  className="w-full py-2 border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  {geolocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                  Usar mi ubicación
                </button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    value={newAddress.fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
                    placeholder="55 1234 5678"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Calle y número *</label>
                  <input
                    type="text"
                    value={newAddress.streetLine1}
                    onChange={(e) => handleFieldChange('streetLine1', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
                    placeholder="Av. Reforma 123"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Interior / Depto (opcional)</label>
                  <input
                    type="text"
                    value={newAddress.streetLine2}
                    onChange={(e) => handleFieldChange('streetLine2', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
                    placeholder="Depto 4B"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Colonia</label>
                  <input
                    type="text"
                    value={newAddress.neighborhood}
                    onChange={(e) => handleFieldChange('neighborhood', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
                    placeholder="Juárez"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
                    placeholder="Ciudad de México"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estado *</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
                    placeholder="CDMX"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Código postal *</label>
                  <input
                    type="text"
                    value={newAddress.postalCode}
                    onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
                    placeholder="06600"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveAddress}
                disabled={savingAddress}
                className="w-full py-2.5 bg-[#FF3D00] text-white text-sm font-bold rounded-xl hover:bg-[#E63600] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingAddress ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingAddressId ? (
                  'Actualizar dirección'
                ) : (
                  'Guardar dirección'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Map */}
        <div className="hidden lg:block">
          <div className="sticky top-0 h-[400px] rounded-xl overflow-hidden border border-gray-200">
            <CheckoutMap
              lat={mapCoords?.lat}
              lng={mapCoords?.lng}
              address={mapAddress || undefined}
            />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleContinue}
          disabled={!selectedAddressId}
          className="px-8 py-3 bg-[#FF3D00] text-white font-bold tracking-wider rounded-xl hover:bg-[#E63600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  )
}
