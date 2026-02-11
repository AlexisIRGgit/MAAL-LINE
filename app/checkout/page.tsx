'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  Check,
  ChevronRight,
  Plus,
  Package,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Shield,
} from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { cn } from '@/lib/utils/cn'

interface Address {
  id: string
  fullName: string
  phone: string | null
  streetLine1: string
  streetLine2: string | null
  neighborhood: string | null
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
}

const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Envío Estándar',
    description: 'Entrega en días hábiles',
    price: 99,
    estimatedDays: '5-7 días',
  },
  {
    id: 'express',
    name: 'Envío Express',
    description: 'Entrega rápida',
    price: 199,
    estimatedDays: '2-3 días',
  },
  {
    id: 'next_day',
    name: 'Envío al Día Siguiente',
    description: 'Recíbelo mañana (pedidos antes de 2pm)',
    price: 349,
    estimatedDays: '1 día',
  },
]

const FREE_SHIPPING_THRESHOLD = 999

const steps = [
  { id: 'address', label: 'Dirección', icon: MapPin },
  { id: 'shipping', label: 'Envío', icon: Truck },
  { id: 'payment', label: 'Pago', icon: CreditCard },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { items, getSubtotal, clearCart } = useCartStore()

  // Calculate subtotal from items (reactive)
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  const [currentStep, setCurrentStep] = useState(0)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [selectedShipping, setSelectedShipping] = useState<string>('standard')
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New address form
  const [showNewAddress, setShowNewAddress] = useState(false)
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

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login?redirect=/checkout')
    }
  }, [sessionStatus, router])

  // Redirect if cart is empty (but not if order was just completed)
  useEffect(() => {
    if (items.length === 0 && sessionStatus === 'authenticated' && !orderCompleted) {
      router.push('/')
    }
  }, [items, sessionStatus, router, orderCompleted])

  // Fetch addresses when session is available
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoadingAddresses(true)
      try {
        const response = await fetch('/api/account/addresses')
        if (response.ok) {
          const data = await response.json()
          const fetchedAddresses = data.addresses || []
          setAddresses(fetchedAddresses)

          // Pre-select default address if exists
          const defaultAddr = fetchedAddresses.find((a: Address) => a.isDefault)
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id)
          } else if (fetchedAddresses.length > 0) {
            // If no default, select first address
            setSelectedAddressId(fetchedAddresses[0].id)
          }
        }
      } catch (err) {
        console.error('Error fetching addresses:', err)
      } finally {
        setLoadingAddresses(false)
      }
    }

    if (sessionStatus === 'authenticated') {
      fetchAddresses()
    }
  }, [sessionStatus])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === selectedShipping)
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (shippingMethod?.price || 0)
  const total = subtotal + shippingCost

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  // Check if new address form is being shown (either explicitly or because no addresses exist)
  const isNewAddressFormVisible = !loadingAddresses && (showNewAddress || addresses.length === 0)

  const isNewAddressValid = newAddress.fullName.trim() !== '' &&
    newAddress.streetLine1.trim() !== '' &&
    newAddress.city.trim() !== '' &&
    newAddress.state.trim() !== '' &&
    newAddress.postalCode.trim() !== ''

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        // Don't allow proceeding while loading
        if (loadingAddresses) return false
        // Either have a selected address OR have a valid new address form
        return selectedAddressId !== null || (isNewAddressFormVisible && isNewAddressValid)
      case 1:
        return selectedShipping !== null
      case 2:
        return true
      default:
        return false
    }
  }

  const handleNext = async () => {
    // If on address step and new address form is visible with valid data, save it first
    if (currentStep === 0 && isNewAddressFormVisible && isNewAddressValid && !selectedAddressId) {
      try {
        const response = await fetch('/api/account/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newAddress,
            country: 'MX',
            isDefault: addresses.length === 0,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          setAddresses([...addresses, data.address])
          setSelectedAddressId(data.address.id)
          setShowNewAddress(false)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Error al guardar la dirección')
          return
        }
      } catch (err) {
        setError('Error al guardar la dirección')
        return
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmitOrder = async () => {
    if (!selectedAddressId || !selectedShipping) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          shippingMethod: selectedShipping,
          items: items.map((item) => ({
            productId: item.productId,
            variantName: item.size,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Mark order as completed BEFORE clearing cart to prevent redirect to home
        setOrderCompleted(true)
        clearCart()
        router.push(`/checkout/success?order=${data.orderNumber}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al procesar el pedido')
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8E4D9]" />
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#E8E4D9]/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#E8E4D9] tracking-wider">
            MAAL LINE
          </Link>
          <div className="flex items-center gap-2 text-[#E8E4D9]/50 text-sm">
            <Shield className="w-4 h-4" />
            <span>Pago Seguro</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#E8E4D9]/50 hover:text-[#E8E4D9] text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Seguir comprando
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Steps */}
              <div className="flex items-center gap-2 mb-8">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => index < currentStep && setCurrentStep(index)}
                      disabled={index > currentStep}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                        index === currentStep
                          ? 'bg-[#E8E4D9] text-[#0A0A0A]'
                          : index < currentStep
                            ? 'bg-green-600 text-white'
                            : 'bg-[#E8E4D9]/10 text-[#E8E4D9]/50'
                      )}
                    >
                      {index < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">{step.label}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-[#E8E4D9]/30 mx-1" />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {/* Step 1: Address */}
                {currentStep === 0 && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-bold text-[#E8E4D9]">Dirección de Envío</h2>

                    {/* Loading addresses */}
                    {loadingAddresses && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#E8E4D9]" />
                        <span className="ml-2 text-[#E8E4D9]/60">Cargando direcciones...</span>
                      </div>
                    )}

                    {/* Show saved addresses if available */}
                    {!loadingAddresses && addresses.length > 0 && !showNewAddress && (
                      <div className="space-y-3">
                        {addresses.map((address) => (
                          <button
                            key={address.id}
                            onClick={() => setSelectedAddressId(address.id)}
                            className={cn(
                              'w-full p-4 border rounded-xl text-left transition-all',
                              selectedAddressId === address.id
                                ? 'border-[#E8E4D9] bg-[#E8E4D9]/5'
                                : 'border-[#E8E4D9]/20 hover:border-[#E8E4D9]/40'
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-[#E8E4D9]">{address.fullName}</p>
                                <p className="text-sm text-[#E8E4D9]/60 mt-1">
                                  {address.streetLine1}
                                  {address.streetLine2 && `, ${address.streetLine2}`}
                                </p>
                                <p className="text-sm text-[#E8E4D9]/60">
                                  {address.city}, {address.state} {address.postalCode}
                                </p>
                                {address.phone && (
                                  <p className="text-sm text-[#E8E4D9]/60">{address.phone}</p>
                                )}
                              </div>
                              <div
                                className={cn(
                                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                  selectedAddressId === address.id
                                    ? 'border-[#E8E4D9] bg-[#E8E4D9]'
                                    : 'border-[#E8E4D9]/30'
                                )}
                              >
                                {selectedAddressId === address.id && (
                                  <Check className="w-3 h-3 text-[#0A0A0A]" />
                                )}
                              </div>
                            </div>
                          </button>
                        ))}

                        <button
                          onClick={() => setShowNewAddress(true)}
                          className="w-full p-4 border border-dashed border-[#E8E4D9]/30 rounded-xl text-[#E8E4D9]/60 hover:text-[#E8E4D9] hover:border-[#E8E4D9]/50 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar nueva dirección
                        </button>
                      </div>
                    )}

                    {/* Show new address form only when no addresses exist or user clicked to add new */}
                    {!loadingAddresses && (addresses.length === 0 || showNewAddress) && (
                      <div className="space-y-4 p-4 border border-[#E8E4D9]/20 rounded-xl">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs text-[#E8E4D9]/60 mb-1">Nombre completo *</label>
                            <input
                              type="text"
                              value={newAddress.fullName}
                              onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                              className="w-full px-3 py-2 bg-transparent border border-[#E8E4D9]/30 rounded-lg text-[#E8E4D9] text-sm focus:outline-none focus:border-[#E8E4D9]"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs text-[#E8E4D9]/60 mb-1">Teléfono</label>
                            <input
                              type="tel"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                              className="w-full px-3 py-2 bg-transparent border border-[#E8E4D9]/30 rounded-lg text-[#E8E4D9] text-sm focus:outline-none focus:border-[#E8E4D9]"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-[#E8E4D9]/60 mb-1">Calle y número *</label>
                            <input
                              type="text"
                              value={newAddress.streetLine1}
                              onChange={(e) => setNewAddress({ ...newAddress, streetLine1: e.target.value })}
                              className="w-full px-3 py-2 bg-transparent border border-[#E8E4D9]/30 rounded-lg text-[#E8E4D9] text-sm focus:outline-none focus:border-[#E8E4D9]"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-[#E8E4D9]/60 mb-1">Interior/Depto (opcional)</label>
                            <input
                              type="text"
                              value={newAddress.streetLine2}
                              onChange={(e) => setNewAddress({ ...newAddress, streetLine2: e.target.value })}
                              className="w-full px-3 py-2 bg-transparent border border-[#E8E4D9]/30 rounded-lg text-[#E8E4D9] text-sm focus:outline-none focus:border-[#E8E4D9]"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs text-[#E8E4D9]/60 mb-1">Colonia</label>
                            <input
                              type="text"
                              value={newAddress.neighborhood}
                              onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                              className="w-full px-3 py-2 bg-transparent border border-[#E8E4D9]/30 rounded-lg text-[#E8E4D9] text-sm focus:outline-none focus:border-[#E8E4D9]"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs text-[#E8E4D9]/60 mb-1">Código Postal *</label>
                            <input
                              type="text"
                              value={newAddress.postalCode}
                              onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                              className="w-full px-3 py-2 bg-transparent border border-[#E8E4D9]/30 rounded-lg text-[#E8E4D9] text-sm focus:outline-none focus:border-[#E8E4D9]"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs text-[#E8E4D9]/60 mb-1">Ciudad *</label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              className="w-full px-3 py-2 bg-transparent border border-[#E8E4D9]/30 rounded-lg text-[#E8E4D9] text-sm focus:outline-none focus:border-[#E8E4D9]"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs text-[#E8E4D9]/60 mb-1">Estado *</label>
                            <input
                              type="text"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              className="w-full px-3 py-2 bg-transparent border border-[#E8E4D9]/30 rounded-lg text-[#E8E4D9] text-sm focus:outline-none focus:border-[#E8E4D9]"
                            />
                          </div>
                        </div>

                        {addresses.length > 0 && (
                          <button
                            onClick={() => setShowNewAddress(false)}
                            className="text-sm text-[#E8E4D9]/50 hover:text-[#E8E4D9]"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Shipping */}
                {currentStep === 1 && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-bold text-[#E8E4D9]">Método de Envío</h2>

                    {subtotal >= FREE_SHIPPING_THRESHOLD && (
                      <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        ¡Envío gratis en pedidos mayores a {formatPrice(FREE_SHIPPING_THRESHOLD)}!
                      </div>
                    )}

                    <div className="space-y-3">
                      {SHIPPING_METHODS.map((method) => {
                        const isFree = subtotal >= FREE_SHIPPING_THRESHOLD
                        return (
                          <button
                            key={method.id}
                            onClick={() => setSelectedShipping(method.id)}
                            className={cn(
                              'w-full p-4 border rounded-xl text-left transition-all',
                              selectedShipping === method.id
                                ? 'border-[#E8E4D9] bg-[#E8E4D9]/5'
                                : 'border-[#E8E4D9]/20 hover:border-[#E8E4D9]/40'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Truck className="w-5 h-5 text-[#E8E4D9]/60" />
                                <div>
                                  <p className="font-medium text-[#E8E4D9]">{method.name}</p>
                                  <p className="text-sm text-[#E8E4D9]/50">
                                    {method.description} • {method.estimatedDays}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  'font-medium',
                                  isFree ? 'text-green-400 line-through' : 'text-[#E8E4D9]'
                                )}>
                                  {formatPrice(method.price)}
                                </span>
                                {isFree && <span className="text-green-400 font-medium">GRATIS</span>}
                                <div
                                  className={cn(
                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                    selectedShipping === method.id
                                      ? 'border-[#E8E4D9] bg-[#E8E4D9]'
                                      : 'border-[#E8E4D9]/30'
                                  )}
                                >
                                  {selectedShipping === method.id && (
                                    <Check className="w-3 h-3 text-[#0A0A0A]" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 2 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-bold text-[#E8E4D9]">Confirmar Pedido</h2>

                    {/* Order Summary */}
                    <div className="p-4 border border-[#E8E4D9]/20 rounded-xl space-y-4">
                      <h3 className="font-medium text-[#E8E4D9]">Resumen del Pedido</h3>

                      {/* Address */}
                      {selectedAddress && (
                        <div className="flex items-start gap-3 p-3 bg-[#E8E4D9]/5 rounded-lg">
                          <MapPin className="w-4 h-4 text-[#E8E4D9]/60 mt-0.5" />
                          <div className="text-sm">
                            <p className="text-[#E8E4D9]">{selectedAddress.fullName}</p>
                            <p className="text-[#E8E4D9]/60">
                              {selectedAddress.streetLine1}, {selectedAddress.city}, {selectedAddress.state}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Shipping */}
                      {shippingMethod && (
                        <div className="flex items-start gap-3 p-3 bg-[#E8E4D9]/5 rounded-lg">
                          <Truck className="w-4 h-4 text-[#E8E4D9]/60 mt-0.5" />
                          <div className="text-sm">
                            <p className="text-[#E8E4D9]">{shippingMethod.name}</p>
                            <p className="text-[#E8E4D9]/60">{shippingMethod.estimatedDays}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Info */}
                    <div className="p-4 border border-[#E8E4D9]/20 rounded-xl">
                      <div className="flex items-center gap-2 text-[#E8E4D9]/60 text-sm mb-3">
                        <CreditCard className="w-4 h-4" />
                        <span>Pago contra entrega</span>
                      </div>
                      <p className="text-xs text-[#E8E4D9]/40">
                        Por el momento solo aceptamos pago contra entrega. Próximamente tarjeta de crédito/débito.
                      </p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-[#E8E4D9]/10">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 0}
                  className={cn(
                    'flex items-center gap-2 text-sm',
                    currentStep === 0
                      ? 'text-[#E8E4D9]/30 cursor-not-allowed'
                      : 'text-[#E8E4D9]/60 hover:text-[#E8E4D9]'
                  )}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={cn(
                      'px-6 py-3 font-bold tracking-wider transition-all',
                      canProceed()
                        ? 'bg-[#E8E4D9] text-[#0A0A0A] hover:bg-[#C9A962]'
                        : 'bg-[#E8E4D9]/20 text-[#E8E4D9]/40 cursor-not-allowed'
                    )}
                  >
                    CONTINUAR
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="px-6 py-3 bg-[#E8E4D9] text-[#0A0A0A] font-bold tracking-wider hover:bg-[#C9A962] transition-all flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        PROCESANDO...
                      </>
                    ) : (
                      <>CONFIRMAR PEDIDO</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 p-6 border border-[#E8E4D9]/20 rounded-xl space-y-4">
                <h3 className="font-bold text-[#E8E4D9] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Tu Pedido ({items.length})
                </h3>

                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                      <div className="relative w-16 h-20 bg-[#111] rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8E4D9] text-[#0A0A0A] text-xs font-bold flex items-center justify-center rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#E8E4D9] font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-[#E8E4D9]/50">Talla: {item.size}</p>
                        <p className="text-sm text-[#E8E4D9] mt-1">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-4 border-t border-[#E8E4D9]/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#E8E4D9]/60">Subtotal</span>
                    <span className="text-[#E8E4D9]">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#E8E4D9]/60">Envío</span>
                    <span className={cn(
                      shippingCost === 0 ? 'text-green-400' : 'text-[#E8E4D9]'
                    )}>
                      {shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#E8E4D9]/10">
                    <span className="text-[#E8E4D9]">Total</span>
                    <span className="text-[#E8E4D9]">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
