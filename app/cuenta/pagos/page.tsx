'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  Shield,
  AlertCircle,
  X,
  Check,
  Loader2,
} from 'lucide-react'

// Mock data - será reemplazado con datos reales
const mockPaymentMethods = [
  {
    id: '1',
    type: 'visa',
    lastFour: '4532',
    expiryMonth: '12',
    expiryYear: '25',
    holderName: 'JUAN PEREZ',
    isDefault: true,
  },
  {
    id: '2',
    type: 'mastercard',
    lastFour: '8901',
    expiryMonth: '08',
    expiryYear: '26',
    holderName: 'JUAN PEREZ',
    isDefault: false,
  },
]

interface PaymentMethod {
  id: string
  type: 'visa' | 'mastercard' | 'amex'
  lastFour: string
  expiryMonth: string
  expiryYear: string
  holderName: string
  isDefault: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const getCardBrand = (type: string) => {
  switch (type) {
    case 'visa':
      return { name: 'Visa', color: 'text-blue-600 bg-blue-50', gradient: 'from-blue-600 to-blue-800' }
    case 'mastercard':
      return { name: 'Mastercard', color: 'text-orange-600 bg-orange-50', gradient: 'from-orange-500 to-red-600' }
    case 'amex':
      return { name: 'American Express', color: 'text-cyan-600 bg-cyan-50', gradient: 'from-cyan-600 to-cyan-800' }
    default:
      return { name: 'Tarjeta', color: 'text-gray-600 bg-gray-50', gradient: 'from-gray-600 to-gray-800' }
  }
}

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods as PaymentMethod[])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    isDefault: false,
  })

  const resetForm = () => {
    setFormData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      holderName: '',
      isDefault: false,
    })
  }

  const openModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const detectCardType = (number: string): 'visa' | 'mastercard' | 'amex' => {
    const cleaned = number.replace(/\s/g, '')
    if (cleaned.startsWith('4')) return 'visa'
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard'
    if (cleaned.startsWith('3')) return 'amex'
    return 'visa'
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16)
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(' ') : cleaned
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const cleanedNumber = formData.cardNumber.replace(/\s/g, '')
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: detectCardType(formData.cardNumber),
      lastFour: cleanedNumber.slice(-4),
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      holderName: formData.holderName.toUpperCase(),
      isDefault: formData.isDefault,
    }

    if (formData.isDefault) {
      setPaymentMethods(paymentMethods.map((m) => ({ ...m, isDefault: false })))
    }

    setPaymentMethods((prev) => [...prev, newMethod])
    setIsLoading(false)
    closeModal()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setPaymentMethods(paymentMethods.filter((m) => m.id !== id))
    setDeletingId(null)
  }

  const handleSetDefault = async (id: string) => {
    setPaymentMethods(
      paymentMethods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    )
  }

  const isFormValid = () => {
    const cleanedNumber = formData.cardNumber.replace(/\s/g, '')
    return (
      cleanedNumber.length >= 15 &&
      formData.expiryMonth !== '' &&
      formData.expiryYear !== '' &&
      formData.cvv.length >= 3 &&
      formData.holderName.length >= 3
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Métodos de Pago</h1>
          <p className="text-[#6B7280] text-sm mt-1">Gestiona tus tarjetas y métodos de pago</p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar tarjeta
        </button>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        variants={itemVariants}
        className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
      >
        <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-green-800">Tus datos están seguros</p>
          <p className="text-xs text-green-700 mt-0.5">
            Utilizamos encriptación de nivel bancario para proteger tu información de pago.
          </p>
        </div>
      </motion.div>

      {/* Payment Methods Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const brand = getCardBrand(method.type)
          const isDeleting = deletingId === method.id

          return (
            <motion.div
              key={method.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative bg-gradient-to-br ${brand.gradient} rounded-2xl p-5 text-white overflow-hidden ${
                isDeleting ? 'opacity-50' : ''
              }`}
            >
              {/* Card Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-2 border-white" />
                <div className="absolute top-8 right-8 w-16 h-16 rounded-full border-2 border-white" />
              </div>

              {/* Default Badge */}
              {method.isDefault && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                  <Star className="w-3 h-3" fill="currentColor" />
                  <span className="text-xs font-medium">Principal</span>
                </div>
              )}

              {/* Card Content */}
              <div className="relative z-10 space-y-6">
                {/* Card Type Icon */}
                <div className="flex items-center justify-between">
                  <CreditCard className="w-8 h-8" />
                  <span className="text-sm font-semibold tracking-wider">{brand.name}</span>
                </div>

                {/* Card Number */}
                <div className="font-mono text-lg sm:text-xl tracking-wider">
                  •••• •••• •••• {method.lastFour}
                </div>

                {/* Card Details */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase opacity-70">Titular</p>
                    <p className="text-sm font-medium">{method.holderName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase opacity-70">Expira</p>
                    <p className="text-sm font-medium">
                      {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="relative z-10 flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="flex-1 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Hacer principal
                  </button>
                )}
                <button
                  onClick={() => handleDelete(method.id)}
                  disabled={isDeleting}
                  className={`${
                    method.isDefault ? 'flex-1' : ''
                  } py-2 px-4 text-xs font-medium bg-white/10 hover:bg-red-500/50 rounded-lg transition-colors flex items-center justify-center gap-2`}
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Eliminar
                </button>
              </div>
            </motion.div>
          )
        })}

        {/* Empty State */}
        {paymentMethods.length === 0 && (
          <div className="col-span-full bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
            <CreditCard className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280] font-medium">No tienes métodos de pago guardados</p>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Agrega una tarjeta para hacer tus compras más rápido
            </p>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar tarjeta
            </button>
          </div>
        )}
      </motion.div>

      {/* Add New Card Info */}
      {paymentMethods.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="flex items-start gap-3 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-[#6B7280] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[#374151]">
              Puedes agregar hasta 5 métodos de pago. La tarjeta marcada como principal se usará por defecto en tus compras.
            </p>
          </div>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-white rounded-2xl z-50 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F3F4F6] rounded-xl">
                    <CreditCard className="w-5 h-5 text-[#6B7280]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#111827]">Agregar tarjeta</h2>
                    <p className="text-xs text-[#6B7280]">Ingresa los datos de tu tarjeta</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Número de tarjeta
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all font-mono"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">Mes</label>
                    <select
                      value={formData.expiryMonth}
                      onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = (i + 1).toString().padStart(2, '0')
                        return (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">Año</label>
                    <select
                      value={formData.expiryYear}
                      onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                    >
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = (26 + i).toString()
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">CVV</label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                        })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all font-mono"
                      placeholder="123"
                    />
                  </div>
                </div>

                {/* Holder Name */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">
                    Nombre del titular
                  </label>
                  <input
                    type="text"
                    value={formData.holderName}
                    onChange={(e) =>
                      setFormData({ ...formData, holderName: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all uppercase"
                    placeholder="COMO APARECE EN LA TARJETA"
                  />
                </div>

                {/* Set as Default */}
                <label className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827]"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Usar como principal</p>
                    <p className="text-xs text-[#6B7280]">
                      Esta tarjeta se usará por defecto en tus compras
                    </p>
                  </div>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] text-sm font-semibold rounded-xl hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !isFormValid()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Agregar tarjeta
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
