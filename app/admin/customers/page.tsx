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
      className="space-y-3"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#E8E4D9]">Clientes</h1>
          <p className="text-[#666] mt-1 text-xs">Gestiona tu base de clientes</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-[#C9A962] text-[#0a0a0a] font-semibold rounded-xl hover:bg-[#d4b76d] transition-colors text-xs">
          <UserPlus className="w-3.5 h-3.5" />
          Nuevo Cliente
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#C9A962]/10">
              <Users className="w-4 h-4 text-[#C9A962]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#E8E4D9]">{totalCustomers}</p>
              <p className="text-xs text-[#666]">Total Clientes</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Crown className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#E8E4D9]">{vipCustomers}</p>
              <p className="text-xs text-[#666]">Clientes VIP</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-green-500/10">
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#E8E4D9]">${(totalRevenue / 1000).toFixed(1)}k</p>
              <p className="text-xs text-[#666]">Ingresos Totales</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#E8E4D9]">${avgOrderValue.toFixed(0)}</p>
              <p className="text-xs text-[#666]">Ticket Promedio</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666]" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-[#E8E4D9] placeholder-[#666] focus:outline-none focus:border-[#C9A962] transition-colors text-xs"
          />
        </div>
        <div className="relative">
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="appearance-none px-3 py-2 pr-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-[#E8E4D9] focus:outline-none focus:border-[#C9A962] transition-colors cursor-pointer text-xs"
          >
            <option value="all">Todos los grupos</option>
            <option value="vip">VIP</option>
            <option value="standard">Standard</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666] pointer-events-none" />
        </div>
      </motion.div>

      {/* Customers Table */}
      <motion.div
        variants={itemVariants}
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="p-2 text-left text-xs font-medium text-[#666]">Cliente</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Grupo</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Pedidos</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Total Gastado</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Registrado</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors"
                >
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A962] to-[#8B7355] flex items-center justify-center text-[#0a0a0a] font-bold text-xs">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[#E8E4D9] font-medium text-xs">{customer.name}</p>
                        <p className="text-[#666] text-xs flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" />
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    {customer.group === 'vip' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium">
                        <Crown className="w-2.5 h-2.5" />
                        VIP
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 bg-[#1a1a1a] text-[#888] rounded-full text-xs font-medium">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    <span className="text-[#E8E4D9] text-xs">{customer.orders}</span>
                  </td>
                  <td className="p-2">
                    <span className="text-[#C9A962] font-semibold text-xs">${customer.spent.toLocaleString()}</span>
                  </td>
                  <td className="p-2">
                    <span className="text-[#666] text-xs">{customer.createdAt}</span>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-[#1a1a1a] rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5 text-[#666]" />
                      </button>
                      <button className="p-1 hover:bg-[#1a1a1a] rounded-lg transition-colors">
                        <MoreVertical className="w-3.5 h-3.5 text-[#666]" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
