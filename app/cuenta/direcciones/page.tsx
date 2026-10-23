'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from '@/lib/toast'
import { AddressCard, AddAddressCard, type Address } from '@/components/account/address-card'
import { AddressWizard } from '@/components/account/address-wizard'
import { CenterMorphModal } from '@/components/ui/center-morph-modal'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // New key per opening so the wizard always starts at step 1
  const [wizardKey, setWizardKey] = useState(0)

  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    label: 'Casa',
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

  // Load addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/account/addresses')
        if (response.ok) {
          const data = await response.json()
          setAddresses(data.addresses || [])
        }
      } catch (error) {
        console.error('Error loading addresses:', error)
      } finally {
        setIsLoadingPage(false)
      }
    }

    fetchAddresses()
  }, [])

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address)
      setFormData(address)
    } else {
      setEditingAddress(null)
      setFormData({
        type: 'home',
        label: 'Casa',
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
        isDefault: addresses.length === 0,
      })
    }
    setWizardKey((key) => key + 1)
    setShowModal(true)
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      if (editingAddress) {
        // Update existing address
        const response = await fetch(`/api/account/addresses/${editingAddress.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          const data = await response.json()
          setAddresses(addresses.map((a) =>
            a.id === editingAddress.id ? data.address : (data.address.isDefault ? { ...a, isDefault: false } : a)
          ))
          toast.success('Dirección actualizada')
        } else {
          toast.error('Error al actualizar dirección')
        }
      } else {
        // Create new address
        const response = await fetch('/api/account/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.address.isDefault) {
            setAddresses([...addresses.map(a => ({ ...a, isDefault: false })), data.address])
          } else {
            setAddresses([...addresses, data.address])
          }
          toast.success('Dirección agregada')
        } else {
          toast.error('Error al agregar dirección')
        }
      }

      setShowModal(false)
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Error al guardar dirección')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/account/addresses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const deletedAddress = addresses.find(a => a.id === id)
        let newAddresses = addresses.filter((a) => a.id !== id)

        // If deleted was default and there are other addresses, set first as default
        if (deletedAddress?.isDefault && newAddresses.length > 0) {
          newAddresses = newAddresses.map((a, i) => i === 0 ? { ...a, isDefault: true } : a)
        }

        setAddresses(newAddresses)
        toast.success('Dirección eliminada')
      } else {
        toast.error('Error al eliminar dirección')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Error al eliminar dirección')
    }
    setDeleteConfirm(null)
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/account/addresses/${id}`, {
        method: 'PATCH',
      })

      if (response.ok) {
        setAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })))
        toast.success('Dirección principal actualizada')
      } else {
        toast.error('Error al actualizar dirección')
      }
    } catch (error) {
      console.error('Error setting default:', error)
      toast.error('Error al actualizar dirección')
    }
  }

  if (isLoadingPage) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#111827] animate-spin" />
      </div>
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
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(290px,330px))] gap-4">
        <AnimatePresence initial={false}>
          {[...addresses]
            .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
            .map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isDeleteConfirmOpen={deleteConfirm === address.id}
                deleteMessage={
                  address.isDefault && addresses.length > 1
                    ? '¿Eliminar? Otra dirección será la principal.'
                    : '¿Eliminar esta dirección?'
                }
                onEdit={() => handleOpenModal(address)}
                onSetDefault={() => handleSetDefault(address.id)}
                onRequestDelete={() => setDeleteConfirm(address.id)}
                onCancelDelete={() => setDeleteConfirm(null)}
                onConfirmDelete={() => handleDelete(address.id)}
              />
            ))}
          <AddAddressCard key="add-address" onClick={() => handleOpenModal()} isFirst={addresses.length === 0} />
        </AnimatePresence>
      </motion.div>

      {/* Add / edit address: center morph modal with a step-by-step wizard */}
      <CenterMorphModal
        open={showModal}
        onClose={() => setShowModal(false)}
        labelledBy="address-wizard-title"
        className="max-w-[30rem]"
      >
        <AddressWizard
          key={wizardKey}
          formData={formData}
          onChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleSave}
          isSaving={isLoading}
          isEditing={!!editingAddress}
        />
      </CenterMorphModal>
    </motion.div>
  )
}
