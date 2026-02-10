'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Search,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  ChevronDown,
  Loader2,
  Edit,
} from 'lucide-react'

interface InventoryItem {
  id: string
  sku: string
  productId: string
  productName: string
  productSlug: string
  size: string | null
  color: string | null
  stockQuantity: number
  lowStockThreshold: number
}

interface InventoryResponse {
  variants: InventoryItem[]
  total: number
  page: number
  totalPages: number
  stats: {
    totalStock: number
    lowStockCount: number
    outOfStockCount: number
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

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState({ totalStock: 0, lowStockCount: 0, outOfStockCount: 0 })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStock, setFilterStock] = useState('all')

  const fetchInventory = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '50',
        ...(filterStock !== 'all' && { stock: filterStock }),
        ...(searchQuery && { search: searchQuery }),
      })

      const response = await fetch(`/api/inventory?${params}`)
      if (!response.ok) throw new Error('Error fetching inventory')

      const data: InventoryResponse = await response.json()
      setInventory(data.variants)
      setStats(data.stats)
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      })
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, filterStock, searchQuery])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, filterStock])

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
              <p className="text-2xl font-bold text-[#111827]">{stats.totalStock}</p>
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
              <p className="text-2xl font-bold text-[#111827]">{stats.lowStockCount}</p>
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
              <p className="text-2xl font-bold text-[#111827]">{stats.outOfStockCount}</p>
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
              <p className="text-2xl font-bold text-[#111827]">{pagination.total}</p>
              <p className="text-sm text-[#6B7280]">Total Variantes</p>
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
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#111827] animate-spin" />
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
            <p className="text-[#111827] font-medium text-lg">No hay variantes de productos</p>
            <p className="text-[#6B7280] text-sm mt-1">
              Agrega variantes (tallas) a tus productos para gestionar el inventario
            </p>
            <Link href="/admin/products">
              <button className="mt-4 px-4 py-2.5 bg-[#111827] text-white font-semibold rounded-xl text-sm hover:bg-[#1F2937] transition-colors">
                Ir a Productos
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">SKU</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Producto</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Variante</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Stock</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Estado</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {inventory.map((item, index) => {
                  const isLow = item.stockQuantity <= item.lowStockThreshold && item.stockQuantity > 0
                  const isOut = item.stockQuantity === 0
                  const variant = [item.size, item.color].filter(Boolean).join(' / ') || 'Sin variante'

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="p-3 hidden md:table-cell">
                        <span className="text-[#111827] font-mono text-sm font-medium">{item.sku}</span>
                      </td>
                      <td className="p-3">
                        <div className="min-w-0">
                          <span className="text-[#111827] text-sm block truncate">{item.productName}</span>
                          <span className="text-[#9CA3AF] text-xs sm:hidden">{variant}</span>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <span className="px-2.5 py-1 bg-[#F3F4F6] rounded-lg text-[#6B7280] text-sm font-medium">
                          {variant}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold text-sm ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-[#111827]'}`}>
                          {item.stockQuantity}
                        </span>
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
                      <td className="p-3">
                        <Link
                          href={`/admin/products/${item.productId}/edit`}
                          className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors inline-flex"
                          title="Editar producto"
                        >
                          <Edit className="w-4 h-4 text-[#6B7280]" />
                        </Link>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {inventory.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] rounded-b-xl">
            <p className="text-sm text-[#6B7280]">
              Mostrando {inventory.length} de {pagination.total} variantes
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

      {/* Help Text */}
      <motion.div variants={itemVariants} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>¿Cómo agregar stock?</strong> Ve a <Link href="/admin/products" className="underline">Productos</Link>,
          edita un producto y agrega variantes (tallas) con la cantidad de stock deseada.
        </p>
      </motion.div>
    </motion.div>
  )
}
