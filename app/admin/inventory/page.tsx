'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  ChevronDown,
} from 'lucide-react'

// Mock data
const mockInventory = [
  { id: '1', sku: 'HOD-BLK-M', name: 'Hoodie Oversize Black', variant: 'M', stock: 45, reserved: 3, incoming: 50, lowStock: 10 },
  { id: '2', sku: 'HOD-BLK-L', name: 'Hoodie Oversize Black', variant: 'L', stock: 32, reserved: 5, incoming: 50, lowStock: 10 },
  { id: '3', sku: 'HOD-BLK-XL', name: 'Hoodie Oversize Black', variant: 'XL', stock: 8, reserved: 2, incoming: 30, lowStock: 10 },
  { id: '4', sku: 'TEE-GTH-S', name: 'Tee Gothic Print', variant: 'S', stock: 120, reserved: 0, incoming: 0, lowStock: 20 },
  { id: '5', sku: 'TEE-GTH-M', name: 'Tee Gothic Print', variant: 'M', stock: 89, reserved: 4, incoming: 0, lowStock: 20 },
  { id: '6', sku: 'CRG-DRK-M', name: 'Cargo Pants Dark', variant: 'M', stock: 5, reserved: 1, incoming: 25, lowStock: 10 },
  { id: '7', sku: 'CRG-DRK-L', name: 'Cargo Pants Dark', variant: 'L', stock: 0, reserved: 0, incoming: 25, lowStock: 10 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function InventoryPage() {
  const [inventory] = useState(mockInventory)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStock, setFilterStock] = useState('all')

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStock =
      filterStock === 'all' ||
      (filterStock === 'low' && item.stock <= item.lowStock) ||
      (filterStock === 'out' && item.stock === 0) ||
      (filterStock === 'ok' && item.stock > item.lowStock)
    return matchesSearch && matchesStock
  })

  const totalStock = inventory.reduce((acc, item) => acc + item.stock, 0)
  const lowStockCount = inventory.filter((item) => item.stock <= item.lowStock && item.stock > 0).length
  const outOfStockCount = inventory.filter((item) => item.stock === 0).length
  const totalReserved = inventory.reduce((acc, item) => acc + item.reserved, 0)

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
          <h1 className="text-2xl font-bold text-[#111827]">Inventario</h1>
          <p className="text-[#6B7280] mt-1 text-sm">Control de stock en tiempo real</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white font-semibold text-sm rounded-xl hover:bg-[#1F2937] transition-colors">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#111827]/5">
              <Package className="w-5 h-5 text-[#111827]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{totalStock}</p>
              <p className="text-sm text-[#6B7280]">Total en Stock</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{lowStockCount}</p>
              <p className="text-sm text-[#6B7280]">Stock Bajo</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{outOfStockCount}</p>
              <p className="text-sm text-[#6B7280]">Sin Stock</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{totalReserved}</p>
              <p className="text-sm text-[#6B7280]">Reservados</p>
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
            placeholder="Buscar por SKU o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="ok">Stock OK</option>
            <option value="low">Stock Bajo</option>
            <option value="out">Sin Stock</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">SKU</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Producto</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Variante</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Stock</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">Reservado</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">Disponible</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden xl:table-cell">En Camino</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredInventory.map((item, index) => {
                const available = item.stock - item.reserved
                const isLow = item.stock <= item.lowStock && item.stock > 0
                const isOut = item.stock === 0

                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="p-3 hidden md:table-cell">
                      <span className="text-[#111827] font-mono text-sm font-medium">{item.sku}</span>
                    </td>
                    <td className="p-3">
                      <div className="min-w-0">
                        <span className="text-[#111827] text-sm block truncate">{item.name}</span>
                        <span className="text-[#9CA3AF] text-xs sm:hidden">{item.variant}</span>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <span className="px-2.5 py-1 bg-[#F3F4F6] rounded-lg text-[#6B7280] text-sm font-medium">{item.variant}</span>
                    </td>
                    <td className="p-3">
                      <span className={`font-semibold text-sm ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-[#111827]'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-blue-600 text-sm font-medium">{item.reserved}</span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-[#111827] font-medium text-sm">{available}</span>
                    </td>
                    <td className="p-3 hidden xl:table-cell">
                      {item.incoming > 0 ? (
                        <span className="text-green-600 text-sm font-medium">+{item.incoming}</span>
                      ) : (
                        <span className="text-[#D1D5DB] text-sm">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span className="hidden sm:inline">Sin stock</span>
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span className="hidden sm:inline">Stock bajo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="hidden sm:inline">OK</span>
                        </span>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <p className="text-sm text-[#6B7280]">
            Mostrando {filteredInventory.length} de {inventory.length} items
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
