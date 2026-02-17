'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Users,
  Crown,
  ShoppingBag,
  DollarSign,
  ChevronDown,
  MoreVertical,
  Eye,
  UserPlus,
  Loader2,
  X,
  Mail,
  Calendar,
  TrendingUp,
  ExternalLink,
  MapPin,
  Key,
  Phone,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from '@/lib/toast'

interface Address {
  id: string
  type: string
  isDefault: boolean
  fullName: string
  phone: string | null
  streetLine1: string
  streetLine2: string | null
  neighborhood: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  orders: number
  spent: number
  group: string
  createdAt: string
  addresses: Address[]
}

interface CustomersResponse {
  customers: Customer[]
  total: number
  page: number
  totalPages: number
  stats: {
    totalCustomers: number
    vipCustomers: number
    totalRevenue: number
    avgOrderValue: number
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState({
    totalCustomers: 0,
    vipCustomers: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
  })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGroup, setFilterGroup] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [showGroupSelector, setShowGroupSelector] = useState(false)
  const [isChangingGroup, setIsChangingGroup] = useState(false)
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false)
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [newCustomerPassword, setNewCustomerPassword] = useState<string | null>(null)
  const [newCustomerForm, setNewCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    group: 'standard',
  })

  const handleResetPassword = async (customerId: string) => {
    if (!confirm('¿Estás seguro de generar una nueva contraseña temporal para este cliente?')) return

    setIsResettingPassword(true)
    setTempPassword(null)

    try {
      const response = await fetch(`/api/customers/${customerId}/reset-password`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Error al resetear contraseña')

      const data = await response.json()
      setTempPassword(data.tempPassword)
      toast.success('Contraseña temporal generada')
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('Error al generar la contraseña temporal')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPassword(true)
    toast.success('Copiado al portapapeles')
    setTimeout(() => setCopiedPassword(false), 2000)
  }

  const handleCreateCustomer = async () => {
    if (!newCustomerForm.email) {
      toast.warning('El email es requerido')
      return
    }

    setIsCreatingCustomer(true)
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomerForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear cliente')
      }

      // Show the temp password
      setNewCustomerPassword(data.tempPassword)

      // Add customer to list
      setCustomers([data.customer, ...customers])

      // Reset form
      setNewCustomerForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        group: 'standard',
      })

      toast.success('Cliente creado exitosamente')
      // Refresh stats
      fetchCustomers()
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el cliente')
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  const closeNewCustomerModal = () => {
    setShowNewCustomerModal(false)
    setNewCustomerPassword(null)
    setNewCustomerForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      group: 'standard',
    })
  }

  const handleChangeGroup = async (customerId: string, newGroup: string) => {
    setIsChangingGroup(true)
    try {
      const response = await fetch(`/api/customers/${customerId}/group`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: newGroup }),
      })

      if (!response.ok) throw new Error('Error al cambiar grupo')

      // Update local state
      setCustomers(customers.map(c =>
        c.id === customerId ? { ...c, group: newGroup } : c
      ))
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer({ ...selectedCustomer, group: newGroup })
      }
      setShowGroupSelector(false)

      toast.success('Grupo actualizado')
      // Update stats if needed
      fetchCustomers()
    } catch (error) {
      console.error('Error changing group:', error)
      toast.error('Error al cambiar el grupo del cliente')
    } finally {
      setIsChangingGroup(false)
    }
  }

  const closeModal = () => {
    setSelectedCustomer(null)
    setTempPassword(null)
    setCopiedPassword(false)
    setShowGroupSelector(false)
  }

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...(filterGroup !== 'all' && { group: filterGroup }),
        ...(searchQuery && { search: searchQuery }),
      })

      const response = await fetch(`/api/customers?${params}`)
      if (!response.ok) throw new Error('Error fetching customers')

      const data: CustomersResponse = await response.json()
      setCustomers(data.customers)
      setStats(data.stats)
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      })
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, filterGroup, searchQuery])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, filterGroup])

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
          <h1 className="text-2xl font-bold text-[#111827]">Clientes</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Gestiona tu base de clientes</p>
        </div>
        <button
          onClick={() => setShowNewCustomerModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937] transition-colors text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#111827]/5">
              <Users className="w-5 h-5 text-[#111827]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{stats.totalCustomers}</p>
              <p className="text-sm text-[#6B7280]">Total Clientes</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50">
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{stats.vipCustomers}</p>
              <p className="text-sm text-[#6B7280]">Clientes VIP</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-50">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">
                ${stats.totalRevenue >= 1000 ? `${(stats.totalRevenue / 1000).toFixed(1)}k` : stats.totalRevenue.toFixed(0)}
              </p>
              <p className="text-sm text-[#6B7280]">Ingresos Totales</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">${stats.avgOrderValue.toFixed(0)}</p>
              <p className="text-sm text-[#6B7280]">Ticket Promedio</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all cursor-pointer text-sm"
          >
            <option value="all">Todos los grupos</option>
            <option value="vip">VIP</option>
            <option value="standard">Standard</option>
            <option value="wholesale">Mayorista</option>
            <option value="influencer">Influencer</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>
      </motion.div>

      {/* Customers Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#111827] animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
            <p className="text-[#111827] font-medium text-lg">No hay clientes</p>
            <p className="text-[#6B7280] text-sm mt-1">
              {searchQuery || filterGroup !== 'all'
                ? 'No se encontraron clientes con los filtros seleccionados'
                : 'Los clientes que se registren aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Cliente</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Grupo</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">Pedidos</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">Registrado</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {customers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#111827] to-[#374151] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[#111827] font-medium text-sm truncate">{customer.name}</p>
                            {customer.group === 'vip' && (
                              <Crown className="w-3 h-3 text-purple-600 sm:hidden flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[#9CA3AF] text-xs truncate">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      {customer.group === 'vip' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          VIP
                        </span>
                      ) : customer.group === 'wholesale' ? (
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          Mayorista
                        </span>
                      ) : customer.group === 'influencer' ? (
                        <span className="inline-flex items-center px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
                          Influencer
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="text-[#111827] text-sm font-medium">{customer.orders}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-[#111827] font-semibold text-sm">${customer.spent.toLocaleString()}</span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-[#6B7280] text-sm">{customer.createdAt}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCustomer(customer)
                          }}
                          className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-[#6B7280]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCustomer(customer)
                          }}
                          className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                          title="Más opciones"
                        >
                          <MoreVertical className="w-4 h-4 text-[#6B7280]" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {customers.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
            <p className="text-sm text-[#6B7280]">
              Mostrando {customers.length} de {pagination.total} clientes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#111827] hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    page === pagination.page
                      ? 'bg-[#111827] text-white'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#111827] hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
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
              className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#111827]">Detalles del Cliente</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Header */}
                <div className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#111827] to-[#374151] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[#111827] font-semibold text-lg truncate">{selectedCustomer.name}</h3>
                      {selectedCustomer.group === 'vip' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#6B7280] mt-1">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm truncate">{selectedCustomer.email}</span>
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-1.5 text-[#6B7280] mt-0.5">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{selectedCustomer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[#F9FAFB] rounded-xl text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[#6B7280] mb-1">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-bold text-[#111827]">{selectedCustomer.orders}</p>
                    <p className="text-xs text-[#6B7280]">Pedidos</p>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-xl text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[#6B7280] mb-1">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-bold text-[#111827]">${selectedCustomer.spent.toLocaleString()}</p>
                    <p className="text-xs text-[#6B7280]">Total Gastado</p>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-xl text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[#6B7280] mb-1">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-bold text-[#111827]">
                      ${selectedCustomer.orders > 0 ? Math.round(selectedCustomer.spent / selectedCustomer.orders).toLocaleString() : 0}
                    </p>
                    <p className="text-xs text-[#6B7280]">Ticket Prom.</p>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#F9FAFB] rounded-xl">
                    <p className="text-[#6B7280] text-xs uppercase tracking-wider mb-1">Grupo</p>
                    <p className="text-[#111827] font-medium capitalize">
                      {selectedCustomer.group === 'vip' ? 'VIP' :
                       selectedCustomer.group === 'wholesale' ? 'Mayorista' :
                       selectedCustomer.group === 'influencer' ? 'Influencer' : 'Standard'}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-xl">
                    <div className="flex items-center gap-1.5 text-[#6B7280] mb-1">
                      <Calendar className="w-3 h-3" />
                      <p className="text-xs uppercase tracking-wider">Registrado</p>
                    </div>
                    <p className="text-[#111827] font-medium">{selectedCustomer.createdAt}</p>
                  </div>
                </div>

                {/* Addresses */}
                <div className="p-4 bg-[#F9FAFB] rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-[#6B7280]" />
                    <p className="text-[#6B7280] text-xs uppercase tracking-wider font-semibold">Direcciones</p>
                  </div>
                  {selectedCustomer.addresses.length === 0 ? (
                    <p className="text-[#9CA3AF] text-sm">Sin direcciones guardadas</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedCustomer.addresses.map((addr) => (
                        <div key={addr.id} className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#111827] font-medium text-sm">{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                Principal
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              {addr.type === 'shipping' ? 'Envío' : 'Facturación'}
                            </span>
                          </div>
                          <p className="text-[#6B7280] text-sm">
                            {addr.streetLine1}
                            {addr.streetLine2 && `, ${addr.streetLine2}`}
                          </p>
                          <p className="text-[#6B7280] text-sm">
                            {addr.neighborhood && `${addr.neighborhood}, `}
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          {addr.phone && (
                            <p className="text-[#9CA3AF] text-xs mt-1">Tel: {addr.phone}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Password Reset */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-amber-600" />
                    <p className="text-amber-800 text-xs uppercase tracking-wider font-semibold">Resetear Contraseña</p>
                  </div>
                  {tempPassword ? (
                    <div className="space-y-2">
                      <p className="text-amber-700 text-sm">Contraseña temporal generada:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-[#111827] font-mono text-sm">
                          {tempPassword}
                        </code>
                        <button
                          onClick={() => copyToClipboard(tempPassword)}
                          className="p-2 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
                          title="Copiar"
                        >
                          {copiedPassword ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-amber-600" />
                          )}
                        </button>
                      </div>
                      <p className="text-amber-600 text-xs">Comparte esta contraseña con el cliente de forma segura.</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-amber-700 text-sm">Genera una contraseña temporal si el cliente no puede acceder.</p>
                      <button
                        onClick={() => handleResetPassword(selectedCustomer.id)}
                        disabled={isResettingPassword}
                        className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isResettingPassword ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Key className="w-4 h-4" />
                        )}
                        Generar
                      </button>
                    </div>
                  )}
                </div>

                {/* Group Selector */}
                {showGroupSelector && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <p className="text-purple-800 text-xs uppercase tracking-wider font-semibold">Cambiar Grupo</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'standard', label: 'Standard', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
                        { value: 'vip', label: 'VIP', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
                        { value: 'wholesale', label: 'Mayorista', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
                        { value: 'influencer', label: 'Influencer', color: 'bg-pink-100 text-pink-700 hover:bg-pink-200' },
                      ].map((group) => (
                        <button
                          key={group.value}
                          onClick={() => handleChangeGroup(selectedCustomer.id, group.value)}
                          disabled={isChangingGroup || selectedCustomer.group === group.value}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            selectedCustomer.group === group.value
                              ? 'ring-2 ring-purple-500 ' + group.color
                              : group.color
                          }`}
                        >
                          {isChangingGroup ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : (
                            <>
                              {group.label}
                              {selectedCustomer.group === group.value && ' ✓'}
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowGroupSelector(false)}
                      className="w-full mt-3 py-1.5 text-sm text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <div className="flex gap-3">
                    <button className="flex-1 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-xl hover:bg-[#F9FAFB] transition-colors inline-flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Ver Pedidos
                    </button>
                    <button
                      onClick={() => setShowGroupSelector(!showGroupSelector)}
                      className={`flex-1 py-2.5 font-semibold text-sm rounded-xl transition-colors inline-flex items-center justify-center gap-2 ${
                        showGroupSelector
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-[#111827] text-white hover:bg-[#1F2937]'
                      }`}
                    >
                      <Crown className="w-4 h-4" />
                      Cambiar Grupo
                    </button>
                  </div>
                  <a
                    href={`mailto:${selectedCustomer.email}`}
                    className="w-full py-2.5 bg-white border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-xl hover:bg-[#F9FAFB] transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Enviar Email
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Customer Modal */}
      <AnimatePresence>
        {showNewCustomerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeNewCustomerModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#111827]">Nuevo Cliente</h2>
                <button
                  onClick={closeNewCustomerModal}
                  className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              {newCustomerPassword ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <Check className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-semibold">Cliente creado exitosamente</p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-800 text-sm font-medium mb-2">Contraseña temporal:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-[#111827] font-mono text-sm">
                        {newCustomerPassword}
                      </code>
                      <button
                        onClick={() => copyToClipboard(newCustomerPassword)}
                        className="p-2 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
                        title="Copiar"
                      >
                        {copiedPassword ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-amber-600" />
                        )}
                      </button>
                    </div>
                    <p className="text-amber-600 text-xs mt-2">Comparte esta contraseña con el cliente de forma segura.</p>
                  </div>

                  <button
                    onClick={closeNewCustomerModal}
                    className="w-full py-2.5 bg-[#111827] text-white font-semibold text-sm rounded-xl hover:bg-[#1F2937] transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">Nombre</label>
                      <input
                        type="text"
                        value={newCustomerForm.firstName}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, firstName: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#374151] mb-1.5">Apellido</label>
                      <input
                        type="text"
                        value={newCustomerForm.lastName}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, lastName: e.target.value })}
                        className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                        placeholder="Pérez"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={newCustomerForm.email}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                      placeholder="cliente@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Teléfono</label>
                    <input
                      type="tel"
                      value={newCustomerForm.phone}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1.5">Grupo</label>
                    <select
                      value={newCustomerForm.group}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, group: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent cursor-pointer"
                    >
                      <option value="standard">Standard</option>
                      <option value="vip">VIP</option>
                      <option value="wholesale">Mayorista</option>
                      <option value="influencer">Influencer</option>
                    </select>
                  </div>

                  <div className="p-3 bg-[#F9FAFB] rounded-xl">
                    <p className="text-sm text-[#6B7280]">
                      Se generará una contraseña temporal que podrás compartir con el cliente.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeNewCustomerModal}
                      className="flex-1 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-xl hover:bg-[#F9FAFB] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateCustomer}
                      disabled={isCreatingCustomer || !newCustomerForm.email}
                      className="flex-1 py-2.5 bg-[#111827] text-white font-semibold text-sm rounded-xl hover:bg-[#1F2937] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      {isCreatingCustomer ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      Crear Cliente
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
