'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Building2,
  Check,
  X,
  Loader2,
  Star,
} from 'lucide-react'

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  label: string
  fullName: string
  phone: string
  street: string
  number: string
  interior?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

// Mock data
const mockAddresses: Address[] = [
  {
    id: '1',
    type: 'home',
    label: 'Casa',
    fullName: 'Juan Pérez',
    phone: '+52 55 1234 5678',
    street: 'Av. Reforma',
    number: '123',
    interior: 'Depto 4B',
    neighborhood: 'Col. Centro',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '06600',
    country: 'México',
    isDefault: true,
  },
  {
    id: '2',
    type: 'work',
    label: 'Oficina',
    fullName: 'Juan Pérez',
    phone: '+52 55 8765 4321',
    street: 'Calle 5 de Mayo',
    number: '456',
    neighborhood: 'Roma Norte',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '06700',
    country: 'México',
    isDefault: false,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    label: '',
    fullName: '',
    phone: '',
    street: '',
    number: '',
    interior: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
    isDefault: false,
  })

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address)
      setFormData(address)
    } else {
      setEditingAddress(null)
      setFormData({
        type: 'home',
        label: '',
        fullName: '',
        phone: '',
        street: '',
        number: '',
        interior: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'México',
        isDefault: false,
      })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingAddress) {
      setAddresses(addresses.map((a) => (a.id === editingAddress.id ? { ...a, ...formData } : a)))
    } else {
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
      } as Address
      setAddresses([...addresses, newAddress])
    }

    setIsLoading(false)
    setShowModal(false)
  }

  const handleDelete = async (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id))
    setDeleteConfirm(null)
  }

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4" />
      case 'work':
        return <Building2 className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Mis Direcciones</h1>
          <p className="text-[#6B7280] text-sm mt-1">Gestiona tus direcciones de envío</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva dirección
        </button>
      </motion.div>

      {/* Addresses Grid */}
      {addresses.length > 0 ? (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white border rounded-2xl p-4 sm:p-5 relative ${
                address.isDefault ? 'border-[#111827] ring-1 ring-[#111827]' : 'border-[#E5E7EB]'
              }`}
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#111827] text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Principal
                </div>
              )}

              {/* Type & Label */}
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-[#F3F4F6] rounded-lg text-[#6B7280]">
                  {getTypeIcon(address.type)}
                </div>
                <span className="font-semibold text-[#111827]">{address.label}</span>
              </div>

              {/* Address Details */}
              <div className="space-y-1 text-sm text-[#6B7280]">
                <p className="text-[#111827] font-medium">{address.fullName}</p>
                <p>
                  {address.street} {address.number}
                  {address.interior && `, ${address.interior}`}
                </p>
                <p>{address.neighborhood}</p>
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p>{address.phone}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E5E7EB]">
                <button
                  onClick={() => handleOpenModal(address)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </button>
                {!address.isDefault && (
                  <>
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Predeterminada
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(address.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </>
                )}
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === address.id && (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                  <p className="text-sm text-red-700">¿Eliminar esta dirección?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 text-xs text-[#6B7280] hover:bg-white rounded transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center"
        >
          <MapPin className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#6B7280] font-medium">No tienes direcciones guardadas</p>
          <p className="text-sm text-[#9CA3AF] mt-1">Agrega una dirección para tus envíos</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar dirección
          </button>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg bg-white sm:rounded-2xl shadow-xl overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-bold text-[#111827]">
                  {editingAddress ? 'Editar dirección' : 'Nueva dirección'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Tipo de dirección</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'home', label: 'Casa', icon: Home },
                      { value: 'work', label: 'Oficina', icon: Building2 },
                      { value: 'other', label: 'Otro', icon: MapPin },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value as Address['type'], label: type.label })}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          formData.type === type.value
                            ? 'border-[#111827] bg-[#111827] text-white'
                            : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
                        }`}
                      >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">Nombre completo</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#374151] mb-2">Calle</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                      placeholder="Av. Reforma"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">Número</label>
                    <input
                      type="text"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                      placeholder="123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">Interior (opcional)</label>
                    <input
                      type="text"
                      value={formData.interior}
                      onChange={(e) => setFormData({ ...formData, interior: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                      placeholder="Depto 4B"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">Colonia</label>
                    <input
                      type="text"
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                      placeholder="Col. Centro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">Ciudad</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                      placeholder="CDMX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-2">Estado</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                      placeholder="CDMX"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-[#374151] mb-2">Código Postal</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                      placeholder="06600"
                    />
                  </div>
                </div>

                {/* Default Checkbox */}
                <label className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827] focus:ring-offset-0"
                  />
                  <span className="text-sm text-[#374151]">Usar como dirección principal</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] px-4 sm:px-6 py-4 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-xl hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingAddress ? 'Guardar cambios' : 'Agregar dirección'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
