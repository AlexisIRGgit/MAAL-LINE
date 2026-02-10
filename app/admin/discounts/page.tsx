'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
} from 'lucide-react'

// Mock data
const mockDiscounts = [
  { id: '1', code: 'WELCOME20', type: 'percentage', value: 20, usageCount: 156, usageLimit: 500, status: 'active', expiresAt: '2024-03-31' },
  { id: '2', code: 'FLASH50', type: 'fixed', value: 500, usageCount: 45, usageLimit: 100, status: 'active', expiresAt: '2024-02-15' },
  { id: '3', code: 'VIP30', type: 'percentage', value: 30, usageCount: 28, usageLimit: null, status: 'active', expiresAt: null },
  { id: '4', code: 'SUMMER10', type: 'percentage', value: 10, usageCount: 892, usageLimit: 1000, status: 'expired', expiresAt: '2024-01-31' },
  { id: '5', code: 'FREESHIP', type: 'shipping', value: 0, usageCount: 234, usageLimit: null, status: 'active', expiresAt: '2024-12-31' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function DiscountsPage() {
  const [discounts] = useState(mockDiscounts)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDiscounts = discounts.filter((discount) =>
    discount.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeCount = discounts.filter((d) => d.status === 'active').length
  const totalUsage = discounts.reduce((acc, d) => acc + d.usageCount, 0)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
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
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Descuento
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#111827]/5">
              <Tag className="w-5 h-5 text-[#111827]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{discounts.length}</p>
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
              <p className="text-2xl font-bold text-[#111827]">{activeCount}</p>
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
              <p className="text-2xl font-bold text-[#111827]">{totalUsage}</p>
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
              <p className="text-2xl font-bold text-[#111827]">$45.2k</p>
              <p className="text-sm text-[#6B7280]">Ahorro Clientes</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Buscar código..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all text-sm"
        />
      </motion.div>

      {/* Discounts Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDiscounts.map((discount, index) => (
          <motion.div
            key={discount.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${discount.status === 'active' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {discount.type === 'percentage' ? (
                    <Percent className={`w-4 h-4 ${discount.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                  ) : discount.type === 'shipping' ? (
                    <Tag className={`w-4 h-4 ${discount.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                  ) : (
                    <Tag className={`w-4 h-4 ${discount.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  discount.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {discount.status === 'active' ? 'Activo' : 'Expirado'}
                </span>
              </div>
              <button className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <code className="text-base font-mono font-bold text-[#111827]">{discount.code}</code>
              <button
                onClick={() => copyCode(discount.code)}
                className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-[#9CA3AF]" />
              </button>
            </div>

            <p className="text-[#111827] text-lg font-bold mb-3">
              {discount.type === 'percentage' ? `${discount.value}% OFF` :
               discount.type === 'shipping' ? 'Envío Gratis' :
               `$${discount.value} OFF`}
            </p>

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
                  {discount.expiresAt || 'Sin límite'}
                </span>
              </div>
            </div>

            {discount.usageLimit && (
              <div className="mt-4">
                <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#111827] to-[#374151] rounded-full transition-all"
                    style={{ width: `${(discount.usageCount / discount.usageLimit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
