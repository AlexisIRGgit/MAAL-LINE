'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Users,
  Crown,
  Mail,
  ShoppingBag,
  DollarSign,
  ChevronDown,
  MoreVertical,
  Eye,
  UserPlus,
} from 'lucide-react'

// Mock data
const mockCustomers = [
  { id: '1', name: 'Juan Pérez', email: 'juan@email.com', orders: 12, spent: 24500, group: 'vip', createdAt: '2024-01-15' },
  { id: '2', name: 'María García', email: 'maria@email.com', orders: 8, spent: 15200, group: 'standard', createdAt: '2024-01-20' },
  { id: '3', name: 'Carlos López', email: 'carlos@email.com', orders: 3, spent: 4890, group: 'standard', createdAt: '2024-02-01' },
  { id: '4', name: 'Ana Martínez', email: 'ana@email.com', orders: 25, spent: 52000, group: 'vip', createdAt: '2023-11-10' },
  { id: '5', name: 'Roberto Sánchez', email: 'roberto@email.com', orders: 5, spent: 8650, group: 'standard', createdAt: '2024-02-05' },
  { id: '6', name: 'Laura Torres', email: 'laura@email.com', orders: 1, spent: 1299, group: 'standard', createdAt: '2024-02-08' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function CustomersPage() {
  const [customers] = useState(mockCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGroup, setFilterGroup] = useState('all')

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = filterGroup === 'all' || customer.group === filterGroup
    return matchesSearch && matchesGroup
  })

  const totalCustomers = customers.length
  const vipCustomers = customers.filter((c) => c.group === 'vip').length
  const totalRevenue = customers.reduce((acc, c) => acc + c.spent, 0)
  const avgOrderValue = totalRevenue / customers.reduce((acc, c) => acc + c.orders, 0)

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
              <p className="text-2xl font-bold text-[#111827]">{totalCustomers}</p>
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
              <p className="text-2xl font-bold text-[#111827]">{vipCustomers}</p>
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
              <p className="text-2xl font-bold text-[#111827]">${(totalRevenue / 1000).toFixed(1)}k</p>
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
              <p className="text-2xl font-bold text-[#111827]">${avgOrderValue.toFixed(0)}</p>
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
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>
      </motion.div>

      {/* Customers Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Cliente</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Grupo</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Pedidos</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total Gastado</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Registrado</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-[#F9FAFB] transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#111827] to-[#374151] flex items-center justify-center text-white font-bold text-sm">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[#111827] font-medium text-sm">{customer.name}</p>
                        <p className="text-[#9CA3AF] text-xs flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {customer.group === 'vip' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                        <Crown className="w-3 h-3" />
                        VIP
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="text-[#111827] text-sm font-medium">{customer.orders}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-[#111827] font-semibold text-sm">${customer.spent.toLocaleString()}</span>
                  </td>
                  <td className="p-3">
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

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <p className="text-sm text-[#6B7280]">
            Mostrando {filteredCustomers.length} de {customers.length} clientes
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#111827] hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Anterior
            </button>
            <button className="px-3 py-1.5 text-sm bg-[#111827] text-white rounded-lg font-medium">
              1
            </button>
            <button className="px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#111827] hover:bg-white rounded-lg transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
