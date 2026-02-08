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
  XCircle,
  Clock,
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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#E8E4D9]">Descuentos</h1>
          <p className="text-[#666] mt-1">Gestiona códigos de descuento y promociones</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#C9A962] text-[#0a0a0a] font-semibold rounded-xl hover:bg-[#d4b76d] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Descuento
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#C9A962]/10">
              <Tag className="w-6 h-6 text-[#C9A962]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#E8E4D9]">{discounts.length}</p>
              <p className="text-sm text-[#666]">Total Códigos</p>
            </div>
          </div>
        </div>
        <div className="p-5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#E8E4D9]">{activeCount}</p>
              <p className="text-sm text-[#666]">Activos</p>
            </div>
          </div>
        </div>
        <div className="p-5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#E8E4D9]">{totalUsage}</p>
              <p className="text-sm text-[#666]">Usos Totales</p>
            </div>
          </div>
        </div>
        <div className="p-5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Percent className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#E8E4D9]">$45.2k</p>
              <p className="text-sm text-[#666]">Ahorro Clientes</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
        <input
          type="text"
          placeholder="Buscar código..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-[#E8E4D9] placeholder-[#666] focus:outline-none focus:border-[#C9A962] transition-colors"
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
            className="p-5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl hover:border-[#222] transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${discount.status === 'active' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {discount.type === 'percentage' ? (
                    <Percent className={`w-5 h-5 ${discount.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                  ) : discount.type === 'shipping' ? (
                    <Tag className={`w-5 h-5 ${discount.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                  ) : (
                    <Tag className={`w-5 h-5 ${discount.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  discount.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {discount.status === 'active' ? 'Activo' : 'Expirado'}
                </span>
              </div>
              <button className="p-1 hover:bg-[#1a1a1a] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4 text-[#666]" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <code className="text-lg font-mono font-bold text-[#C9A962]">{discount.code}</code>
              <button
                onClick={() => copyCode(discount.code)}
                className="p-1 hover:bg-[#1a1a1a] rounded transition-colors"
              >
                <Copy className="w-4 h-4 text-[#666]" />
              </button>
            </div>

            <p className="text-[#E8E4D9] text-xl font-bold mb-4">
              {discount.type === 'percentage' ? `${discount.value}% OFF` :
               discount.type === 'shipping' ? 'Envío Gratis' :
               `$${discount.value} OFF`}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-[#666]">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Usos
                </span>
                <span className="text-[#E8E4D9]">
                  {discount.usageCount}{discount.usageLimit ? ` / ${discount.usageLimit}` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#666]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Expira
                </span>
                <span className="text-[#E8E4D9]">
                  {discount.expiresAt || 'Sin límite'}
                </span>
              </div>
            </div>

            {discount.usageLimit && (
              <div className="mt-4">
                <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C9A962] to-[#d4b76d] rounded-full transition-all"
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
