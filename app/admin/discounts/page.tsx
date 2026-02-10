'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Percent,
  Tag,
  Calendar,
  Users,
  Copy,
  MoreVertical,
  CheckCircle,
  Loader2,
  X,
  Check,
  Trash2,
  Edit2,
  Power,
  DollarSign,
  Truck,
  ChevronDown,
} from 'lucide-react'

interface Discount {
  id: string
  code: string
  description: string | null
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y'
  value: number
  minimumPurchase: number | null
  maximumDiscount: number | null
  usageCount: number
  usageLimit: number | null
  usageLimitPerUser: number
  startsAt: string
  expiresAt: string | null
  appliesTo: string
  customerEligibility: string
  customerGroups: string[]
  isCombinable: boolean
  isActive: boolean
  status: 'active' | 'expired' | 'inactive'
  createdAt: string
}

interface DiscountForm {
  code: string
  description: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping'
  value: number
  minimumPurchase: string
  maximumDiscount: string
  usageLimit: string
  usageLimitPerUser: string
  expiresAt: string
  customerEligibility: string
  customerGroups: string[]
  isCombinable: boolean
  isActive: boolean
}

const initialFormState: DiscountForm = {
  code: '',
  description: '',
  type: 'percentage',
  value: 10,
  minimumPurchase: '',
  maximumDiscount: '',
  usageLimit: '',
  usageLimitPerUser: '1',
  expiresAt: '',
  customerEligibility: 'all',
  customerGroups: [],
  isCombinable: false,
  isActive: true,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalUsage: 0,
    totalSavings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [formData, setFormData] = useState<DiscountForm>(initialFormState)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Action menu
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const fetchDiscounts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (filterStatus !== 'all') params.append('status', filterStatus)

      const response = await fetch(`/api/discounts?${params}`)
      if (!response.ok) throw new Error('Error fetching discounts')

      const data = await response.json()
      setDiscounts(data.discounts)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching discounts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, filterStatus])

  useEffect(() => {
    fetchDiscounts()
  }, [fetchDiscounts])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDiscounts()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, filterStatus, fetchDiscounts])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const openCreateModal = () => {
    setEditingDiscount(null)
    setFormData(initialFormState)
    setFormError(null)
    setShowModal(true)
  }

  const openEditModal = (discount: Discount) => {
    setEditingDiscount(discount)
    setFormData({
      code: discount.code,
      description: discount.description || '',
      type: discount.type === 'buy_x_get_y' ? 'percentage' : discount.type,
      value: discount.value,
      minimumPurchase: discount.minimumPurchase?.toString() || '',
      maximumDiscount: discount.maximumDiscount?.toString() || '',
      usageLimit: discount.usageLimit?.toString() || '',
      usageLimitPerUser: discount.usageLimitPerUser.toString(),
      expiresAt: discount.expiresAt ? discount.expiresAt.split('T')[0] : '',
      customerEligibility: discount.customerEligibility,
      customerGroups: discount.customerGroups,
      isCombinable: discount.isCombinable,
      isActive: discount.isActive,
    })
    setFormError(null)
    setShowModal(true)
    setOpenMenu(null)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDiscount(null)
    setFormError(null)
  }

  const handleSave = async () => {
    // Validate
    if (!formData.code.trim()) {
      setFormError('El código es requerido')
      return
    }
    if (formData.type !== 'free_shipping' && formData.value <= 0) {
      setFormError('El valor debe ser mayor a 0')
      return
    }
    if (formData.type === 'percentage' && formData.value > 100) {
      setFormError('El porcentaje no puede ser mayor a 100')
      return
    }

    setIsSaving(true)
    setFormError(null)

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description || null,
        type: formData.type,
        value: formData.type === 'free_shipping' ? 0 : formData.value,
        minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : null,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        usageLimitPerUser: parseInt(formData.usageLimitPerUser) || 1,
        expiresAt: formData.expiresAt || null,
        customerEligibility: formData.customerEligibility,
        customerGroups: formData.customerGroups,
        isCombinable: formData.isCombinable,
        isActive: formData.isActive,
      }

      const url = editingDiscount
        ? `/api/discounts/${editingDiscount.id}`
        : '/api/discounts'
      const method = editingDiscount ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      closeModal()
      fetchDiscounts()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar')

      setDiscounts(discounts.filter((d) => d.id !== id))
      setDeleteConfirm(null)
      fetchDiscounts()
    } catch (error) {
      console.error('Error deleting discount:', error)
      alert('Error al eliminar el descuento')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleActive = async (discount: Discount) => {
    try {
      const response = await fetch(`/api/discounts/${discount.id}`, {
        method: 'PATCH',
      })

      if (!response.ok) throw new Error('Error al cambiar estado')

      const data = await response.json()
      setDiscounts(
        discounts.map((d) =>
          d.id === discount.id
            ? { ...d, isActive: data.isActive, status: data.isActive ? 'active' : 'inactive' }
            : d
        )
      )
      setOpenMenu(null)
    } catch (error) {
      console.error('Error toggling discount:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />
      case 'fixed_amount':
        return <DollarSign className="w-4 h-4" />
      case 'free_shipping':
        return <Truck className="w-4 h-4" />
      default:
        return <Tag className="w-4 h-4" />
    }
  }

  const getValueDisplay = (discount: Discount) => {
    switch (discount.type) {
      case 'percentage':
        return `${discount.value}% OFF`
      case 'free_shipping':
        return 'Envío Gratis'
      case 'fixed_amount':
        return `$${discount.value} OFF`
      default:
        return `${discount.value}`
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Descuentos</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Gestiona códigos de descuento y promociones</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Descuento
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#111827]/5">
              <Tag className="w-5 h-5 text-[#111827]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{stats.total}</p>
              <p className="text-sm text-[#6B7280]">Total Códigos</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{stats.active}</p>
              <p className="text-sm text-[#6B7280]">Activos</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{stats.totalUsage}</p>
              <p className="text-sm text-[#6B7280]">Usos Totales</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50">
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">
                ${stats.totalSavings >= 1000 ? `${(stats.totalSavings / 1000).toFixed(1)}k` : stats.totalSavings.toFixed(0)}
              </p>
              <p className="text-sm text-[#6B7280]">Ahorro Clientes</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all cursor-pointer text-sm"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="expired">Expirados</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>
      </motion.div>

      {/* Discounts Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#111827] animate-spin" />
        </div>
      ) : discounts.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center"
        >
          <Tag className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
          <p className="text-[#111827] font-medium text-lg">No hay descuentos</p>
          <p className="text-[#6B7280] text-sm mt-1">
            {searchQuery || filterStatus !== 'all'
              ? 'No se encontraron descuentos con los filtros seleccionados'
              : 'Crea tu primer código de descuento'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Descuento
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discounts.map((discount, index) => (
            <motion.div
              key={discount.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-md transition-all group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${
                    discount.status === 'active' ? 'bg-green-50' :
                    discount.status === 'expired' ? 'bg-red-50' : 'bg-gray-100'
                  }`}>
                    {getTypeIcon(discount.type)}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    discount.status === 'active' ? 'bg-green-50 text-green-700' :
                    discount.status === 'expired' ? 'bg-red-50 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {discount.status === 'active' ? 'Activo' :
                     discount.status === 'expired' ? 'Expirado' : 'Inactivo'}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === discount.id ? null : discount.id)}
                    className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-[#6B7280]" />
                  </button>

                  {/* Action Menu */}
                  <AnimatePresence>
                    {openMenu === discount.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-10 overflow-hidden"
                      >
                        <button
                          onClick={() => openEditModal(discount)}
                          className="w-full px-3 py-2 text-left text-sm text-[#374151] hover:bg-[#F9FAFB] flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleActive(discount)}
                          className="w-full px-3 py-2 text-left text-sm text-[#374151] hover:bg-[#F9FAFB] flex items-center gap-2"
                        >
                          <Power className="w-4 h-4" />
                          {discount.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirm(discount.id)
                            setOpenMenu(null)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <code className="text-base font-mono font-bold text-[#111827]">{discount.code}</code>
                <button
                  onClick={() => copyCode(discount.code)}
                  className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                >
                  {copiedCode === discount.code ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#9CA3AF]" />
                  )}
                </button>
              </div>

              <p className="text-[#111827] text-lg font-bold mb-3">
                {getValueDisplay(discount)}
              </p>

              {discount.description && (
                <p className="text-sm text-[#6B7280] mb-3 line-clamp-2">{discount.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-[#6B7280]">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Usos
                  </span>
                  <span className="text-[#111827] font-medium">
                    {discount.usageCount}{discount.usageLimit ? ` / ${discount.usageLimit}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#6B7280]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Expira
                  </span>
                  <span className="text-[#111827] font-medium">
                    {discount.expiresAt
                      ? new Date(discount.expiresAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Sin límite'}
                  </span>
                </div>
              </div>

              {discount.usageLimit && (
                <div className="mt-4">
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#111827] to-[#374151] rounded-full transition-all"
                      style={{ width: `${Math.min((discount.usageCount / discount.usageLimit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Delete Confirmation Overlay */}
              <AnimatePresence>
                {deleteConfirm === discount.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center p-4"
                  >
                    <p className="text-[#111827] font-medium text-center mb-4">
                      ¿Eliminar código <span className="font-bold">{discount.code}</span>?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 text-sm text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Eliminar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-bold text-[#111827]">
                  {editingDiscount ? 'Editar Descuento' : 'Nuevo Descuento'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {formError}
                  </div>
                )}

                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent uppercase"
                    placeholder="VERANO2024"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                    placeholder="Descuento de verano"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Tipo de descuento
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'percentage', label: 'Porcentaje', icon: Percent },
                      { value: 'fixed_amount', label: 'Monto fijo', icon: DollarSign },
                      { value: 'free_shipping', label: 'Envío gratis', icon: Truck },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value as DiscountForm['type'] })}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all ${
                          formData.type === type.value
                            ? 'border-[#111827] bg-[#111827] text-white'
                            : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
                        }`}
                      >
                        <type.icon className="w-5 h-5" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Value */}
                {formData.type !== 'free_shipping' && (
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Valor {formData.type === 'percentage' ? '(%)' : '($)'}
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                      min="0"
                      max={formData.type === 'percentage' ? 100 : undefined}
                    />
                  </div>
                )}

                {/* Minimum Purchase & Maximum Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Compra mínima ($)
                    </label>
                    <input
                      type="number"
                      value={formData.minimumPurchase}
                      onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                      placeholder="Sin mínimo"
                      min="0"
                    />
                  </div>
                  {formData.type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">
                        Descuento máximo ($)
                      </label>
                      <input
                        type="number"
                        value={formData.maximumDiscount}
                        onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                        placeholder="Sin límite"
                        min="0"
                      />
                    </div>
                  )}
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Límite de usos total
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                      placeholder="Sin límite"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Usos por cliente
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimitPerUser}
                      onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>

                {/* Expiration */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Fecha de expiración
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                  />
                  <p className="text-xs text-[#9CA3AF] mt-1">Deja vacío para sin fecha límite</p>
                </div>

                {/* Customer Eligibility */}
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">
                    Clientes elegibles
                  </label>
                  <select
                    value={formData.customerEligibility}
                    onChange={(e) => setFormData({ ...formData, customerEligibility: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent cursor-pointer"
                  >
                    <option value="all">Todos los clientes</option>
                    <option value="customer_groups">Grupos específicos</option>
                  </select>
                </div>

                {/* Customer Groups */}
                {formData.customerEligibility === 'customer_groups' && (
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">
                      Grupos de clientes
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['vip', 'wholesale', 'influencer'].map((group) => (
                        <button
                          key={group}
                          type="button"
                          onClick={() => {
                            const newGroups = formData.customerGroups.includes(group)
                              ? formData.customerGroups.filter((g) => g !== group)
                              : [...formData.customerGroups, group]
                            setFormData({ ...formData, customerGroups: newGroups })
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            formData.customerGroups.includes(group)
                              ? 'bg-[#111827] text-white'
                              : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                          }`}
                        >
                          {group === 'vip' ? 'VIP' : group === 'wholesale' ? 'Mayorista' : 'Influencer'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isCombinable}
                      onChange={(e) => setFormData({ ...formData, isCombinable: e.target.checked })}
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827] focus:ring-offset-0"
                    />
                    <div>
                      <span className="text-sm text-[#374151] font-medium">Combinable</span>
                      <p className="text-xs text-[#9CA3AF]">Puede usarse con otros descuentos</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827] focus:ring-offset-0"
                    />
                    <div>
                      <span className="text-sm text-[#374151] font-medium">Activo</span>
                      <p className="text-xs text-[#9CA3AF]">El código puede ser utilizado</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] px-6 py-4 flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-xl hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-[#111827] text-white font-semibold text-sm rounded-xl hover:bg-[#1F2937] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingDiscount ? 'Guardar Cambios' : 'Crear Descuento'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside to close menu */}
      {openMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenMenu(null)}
        />
      )}
    </motion.div>
  )
}
