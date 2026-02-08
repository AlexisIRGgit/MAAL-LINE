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
      className="space-y-3"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#E8E4D9]">Inventario</h1>
          <p className="text-[#666] mt-1 text-xs">Control de stock en tiempo real</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-[#111] border border-[#222] text-[#E8E4D9] font-medium text-xs rounded-xl hover:bg-[#1a1a1a] transition-colors">
          <Download className="w-3.5 h-3.5" />
          Exportar
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#C9A962]/10">
              <Package className="w-4 h-4 text-[#C9A962]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#E8E4D9]">{totalStock}</p>
              <p className="text-xs text-[#666]">Total en Stock</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-yellow-500/10">
              <TrendingDown className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#E8E4D9]">{lowStockCount}</p>
              <p className="text-xs text-[#666]">Stock Bajo</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/10">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#E8E4D9]">{outOfStockCount}</p>
              <p className="text-xs text-[#666]">Sin Stock</p>
            </div>
          </div>
        </div>
        <div className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#E8E4D9]">{totalReserved}</p>
              <p className="text-xs text-[#666]">Reservados</p>
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
            placeholder="Buscar por SKU o nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-xs text-[#E8E4D9] placeholder-[#666] focus:outline-none focus:border-[#C9A962] transition-colors"
          />
        </div>
        <div className="relative">
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="appearance-none px-3 py-2 pr-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962] transition-colors cursor-pointer"
          >
            <option value="all">Todos</option>
            <option value="ok">Stock OK</option>
            <option value="low">Stock Bajo</option>
            <option value="out">Sin Stock</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666] pointer-events-none" />
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-xs text-[#E8E4D9] hover:border-[#222] transition-colors">
          <Filter className="w-3.5 h-3.5" />
          Filtros
        </button>
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        variants={itemVariants}
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="p-2 text-left text-xs font-medium text-[#666]">SKU</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Producto</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Variante</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">En Stock</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Reservado</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Disponible</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">En Camino</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Estado</th>
              </tr>
            </thead>
            <tbody>
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
                    className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors"
                  >
                    <td className="p-2">
                      <span className="text-[#E8E4D9] font-mono text-xs">{item.sku}</span>
                    </td>
                    <td className="p-2">
                      <span className="text-[#E8E4D9] text-xs">{item.name}</span>
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-[#1a1a1a] rounded text-[#888] text-xs">{item.variant}</span>
                    </td>
                    <td className="p-2">
                      <span className={`font-semibold text-xs ${isOut ? 'text-red-500' : isLow ? 'text-yellow-500' : 'text-[#E8E4D9]'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="text-blue-400 text-xs">{item.reserved}</span>
                    </td>
                    <td className="p-2">
                      <span className="text-[#E8E4D9] font-medium text-xs">{available}</span>
                    </td>
                    <td className="p-2">
                      {item.incoming > 0 ? (
                        <span className="text-green-500 text-xs">+{item.incoming}</span>
                      ) : (
                        <span className="text-[#444] text-xs">-</span>
                      )}
                    </td>
                    <td className="p-2">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          Sin stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs">
                          <TrendingDown className="w-3 h-3" />
                          Stock bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs">
                          OK
                        </span>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
