'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'

const ITEMS_PER_PAGE = 10
import Image from 'next/image'
import { usePermissions } from '@/hooks/use-permissions'
import { toast } from '@/lib/toast'

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
  const { canCreateProducts, canEditProducts, canDeleteProducts } = usePermissions()
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDropdown && !(e.target as Element).closest('.dropdown-trigger')) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [activeDropdown])

  const handleDropdownToggle = (productId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (activeDropdown === productId) {
      setActiveDropdown(null)
      setDropdownPosition(null)
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 160, // 160px is dropdown width
      })
      setActiveDropdown(productId)
    }
  }

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
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
      toast.success('Producto eliminado')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Error al eliminar el producto')
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
      className="space-y-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Productos</h1>
          <p className="text-[#6B7280] text-sm mt-1">{pagination.total} productos en total</p>
        </div>
{canCreateProducts && (
          <Link href="/admin/products/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </motion.button>
          </Link>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all cursor-pointer text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="draft">Borradores</option>
            <option value="archived">Archivados</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>

        {/* More Filters */}
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[#374151] hover:bg-[#F9FAFB] transition-colors text-sm">
          <Filter className="w-4 h-4" />
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
            className="flex items-center gap-3 p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl"
          >
            <span className="text-[#166534] font-medium text-sm">
              {selectedProducts.length} productos seleccionados
            </span>
            <div className="flex-1" />
            <button className="px-3 py-1.5 text-sm text-[#374151] hover:bg-white rounded-lg transition-colors">
              Cambiar estado
            </button>
            <button className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Eliminar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#111827] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
            <p className="text-[#111827] font-medium text-lg">No hay productos</p>
            <p className="text-[#6B7280] text-sm mt-1">
              {canCreateProducts ? 'Crea tu primer producto para empezar' : 'No hay productos disponibles'}
            </p>
            {canCreateProducts && (
              <Link href="/admin/products/new">
                <button className="mt-4 px-4 py-2.5 bg-[#111827] text-white font-semibold rounded-xl text-sm hover:bg-[#1F2937] transition-colors">
                  Crear producto
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="p-3 text-left hidden sm:table-cell">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={toggleAllProducts}
                      className="w-4 h-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827] focus:ring-offset-0"
                    />
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Producto</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Estado</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">Inventario</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">Categoría</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Precio</th>
                  <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[#F9FAFB] transition-colors group"
                  >
                    <td className="p-3 hidden sm:table-cell">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="w-4 h-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827] focus:ring-offset-0"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] flex-shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-[#9CA3AF]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#111827] font-medium text-sm truncate">{product.name}</p>
                          <p className="text-[#9CA3AF] text-xs truncate sm:hidden">
                            ${product.price.toLocaleString()}
                          </p>
                          <p className="text-[#9CA3AF] text-xs truncate hidden sm:block">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#9CA3AF]" />
                        <span className={`text-sm ${product.inventory < 20 ? 'text-amber-600 font-medium' : 'text-[#374151]'}`}>
                          {product.inventory} en stock
                        </span>
                      </div>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-[#6B7280] text-sm">{product.category || '-'}</span>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <div>
                        <span className="text-[#111827] font-semibold text-sm">
                          ${product.price.toLocaleString()}
                        </span>
                        {product.compareAtPrice && (
                          <span className="ml-2 text-[#9CA3AF] line-through text-sm">
                            ${product.compareAtPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={(e) => handleDropdownToggle(product.id, e)}
                        className="dropdown-trigger p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        <MoreVertical className="w-4 h-4 text-[#6B7280]" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Fixed Dropdown Menu */}
        <AnimatePresence>
          {activeDropdown && dropdownPosition && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              }}
              className="w-40 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-[100] overflow-hidden"
            >
              {products.find(p => p.id === activeDropdown) && (
                <>
                  <Link
                    href={`/producto/${products.find(p => p.id === activeDropdown)?.slug}`}
                    target="_blank"
                    onClick={() => setActiveDropdown(null)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[#374151] hover:bg-[#F9FAFB] transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver producto
                  </Link>
                  {canEditProducts && (
                    <Link
                      href={`/admin/products/${activeDropdown}/edit`}
                      onClick={() => setActiveDropdown(null)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-[#374151] hover:bg-[#F9FAFB] transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Link>
                  )}
                  {canDeleteProducts && (
                    <button
                      onClick={() => {
                        const id = activeDropdown
                        setActiveDropdown(null)
                        handleDelete(id)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {products.length > 0 && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] rounded-b-xl">
            <p className="text-sm text-[#6B7280]">
              Mostrando {((pagination.page - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)} de {pagination.total} productos
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (pagination.totalPages <= 5) return true
                  if (page === 1 || page === pagination.totalPages) return true
                  if (Math.abs(page - pagination.page) <= 1) return true
                  return false
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 text-[#9CA3AF]">...</span>
                      )}
                      <button
                        onClick={() => setPagination((prev) => ({ ...prev, page }))}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === pagination.page
                            ? 'bg-[#111827] text-white'
                            : 'hover:bg-white text-[#374151]'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  )
                })}

              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
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
    active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', label: 'Activo' },
    draft: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Borrador' },
    archived: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Archivado' },
  }

  const style = styles[status as keyof typeof styles] || styles.draft

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}
