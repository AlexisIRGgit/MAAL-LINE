'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  orders: number
  spent: number
  group: string
  createdAt: string
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
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937] transition-colors text-sm">
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
                    className="hover:bg-[#F9FAFB] transition-colors"
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
                        <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-[#6B7280]" />
                        </button>
                        <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
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
    </motion.div>
  )
}
