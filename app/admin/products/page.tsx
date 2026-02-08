'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  status: 'active' | 'draft' | 'archived'
  inventory: number
  category: string | null
  image: string | null
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(searchQuery && { search: searchQuery }),
      })

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error('Error fetching products')

      const data: ProductsResponse = await response.json()
      setProducts(data.products)
      setPagination({
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        total: data.pagination.total,
      })
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, filterStatus, searchQuery])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, filterStatus])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error deleting product')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error al eliminar el producto')
    }
  }

  const toggleProductSelection = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((p) => p.id))
    }
  }

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
          <h1 className="text-xl font-bold text-[#E8E4D9]">Productos</h1>
          <p className="text-[#666] text-xs mt-1">{pagination.total} productos en total</p>
        </div>
        <Link href="/admin/products/new">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#C9A962] text-[#0a0a0a] font-semibold rounded-xl hover:bg-[#d4b76d] transition-colors text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Producto
          </motion.button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666]" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-[#E8E4D9] placeholder-[#666] focus:outline-none focus:border-[#C9A962] transition-colors text-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none px-3 py-2 pr-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-[#E8E4D9] focus:outline-none focus:border-[#C9A962] transition-colors cursor-pointer text-xs"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="draft">Borradores</option>
            <option value="archived">Archivados</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666] pointer-events-none" />
        </div>

        {/* More Filters */}
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-[#E8E4D9] hover:border-[#222] transition-colors text-xs">
          <Filter className="w-3.5 h-3.5" />
          Más filtros
        </button>
      </motion.div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-2 bg-[#C9A962]/10 border border-[#C9A962]/30 rounded-xl"
          >
            <span className="text-[#C9A962] font-medium text-xs">
              {selectedProducts.length} productos seleccionados
            </span>
            <div className="flex-1" />
            <button className="px-3 py-1.5 text-xs text-[#E8E4D9] hover:bg-[#111] rounded-lg transition-colors">
              Cambiar estado
            </button>
            <button className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              Eliminar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <motion.div
        variants={itemVariants}
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#C9A962] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-10 h-10 text-[#444] mx-auto mb-3" />
            <p className="text-[#E8E4D9] font-medium">No hay productos</p>
            <p className="text-[#666] text-xs mt-1">Crea tu primer producto para empezar</p>
            <Link href="/admin/products/new">
              <button className="mt-4 px-4 py-2 bg-[#C9A962] text-[#0a0a0a] font-semibold rounded-xl text-xs">
                Crear producto
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="p-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={toggleAllProducts}
                      className="w-3.5 h-3.5 rounded border-[#333] bg-[#111] accent-[#C9A962]"
                    />
                  </th>
                  <th className="p-2 text-left text-xs font-medium text-[#666]">Producto</th>
                  <th className="p-2 text-left text-xs font-medium text-[#666]">Estado</th>
                  <th className="p-2 text-left text-xs font-medium text-[#666]">Inventario</th>
                  <th className="p-2 text-left text-xs font-medium text-[#666]">Categoría</th>
                  <th className="p-2 text-left text-xs font-medium text-[#666]">Precio</th>
                  <th className="p-2 text-left text-xs font-medium text-[#666]"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors group"
                  >
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-3.5 h-3.5 rounded border-[#333] bg-[#111] accent-[#C9A962]"
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#111] border border-[#222]">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-3.5 h-3.5 text-[#444]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[#E8E4D9] font-medium text-xs">{product.name}</p>
                          <p className="text-[#666] text-xs">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-[#666]" />
                        <span className={`text-xs ${product.inventory < 20 ? 'text-yellow-500' : 'text-[#E8E4D9]'}`}>
                          {product.inventory} en stock
                        </span>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="text-[#888] text-xs">{product.category || '-'}</span>
                    </td>
                    <td className="p-2">
                      <div>
                        <span className="text-[#E8E4D9] font-semibold text-xs">
                          ${product.price.toLocaleString()}
                        </span>
                        {product.compareAtPrice && (
                          <span className="ml-1.5 text-[#666] line-through text-xs">
                            ${product.compareAtPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === product.id ? null : product.id)}
                          className="p-1.5 hover:bg-[#1a1a1a] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-[#666]" />
                        </button>
                        <AnimatePresence>
                          {activeDropdown === product.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-full mt-1 w-36 bg-[#111] border border-[#222] rounded-xl shadow-xl z-50 overflow-hidden"
                            >
                              <Link
                                href={`/producto/${product.slug}`}
                                target="_blank"
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-[#E8E4D9] hover:bg-[#1a1a1a] transition-colors text-xs"
                              >
                                <Eye className="w-3 h-3" />
                                Ver producto
                              </Link>
                              <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-[#E8E4D9] hover:bg-[#1a1a1a] transition-colors text-xs"
                              >
                                <Edit className="w-3 h-3" />
                                Editar
                              </Link>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null)
                                  handleDelete(product.id)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors text-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                                Eliminar
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {products.length > 0 && (
          <div className="flex items-center justify-between p-2 border-t border-[#1a1a1a]">
            <p className="text-xs text-[#666]">
              Mostrando {products.length} de {pagination.total} productos
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-xs text-[#666] hover:text-[#E8E4D9] hover:bg-[#111] rounded-lg transition-colors disabled:opacity-50"
              >
                Anterior
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium ${
                    page === pagination.page
                      ? 'bg-[#C9A962] text-[#0a0a0a]'
                      : 'text-[#666] hover:text-[#E8E4D9] hover:bg-[#111]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 text-xs text-[#666] hover:text-[#E8E4D9] hover:bg-[#111] rounded-lg transition-colors disabled:opacity-50"
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

function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Activo' },
    draft: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Borrador' },
    archived: { bg: 'bg-[#333]/50', text: 'text-[#888]', label: 'Archivado' },
  }

  const style = styles[status as keyof typeof styles] || styles.draft

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}
