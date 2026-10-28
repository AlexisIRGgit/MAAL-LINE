'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Filter,
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

import Image from 'next/image'
import { usePermissions } from '@/hooks/use-permissions'
import { toast } from '@/lib/toast'
import { toneStyles, type StatusTone } from '@/components/account/order-status'
import { SwipeableRow, type SwipeAction, type SwipeSide } from '@/components/account/swipeable-list'

const ITEMS_PER_PAGE = 10

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
  const [openRow, setOpenRow] = useState<{ id: string; side: SwipeSide } | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

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

      {/* Products list (same swipeable card list as the account's recent orders) */}
      <motion.div
        variants={itemVariants}
        className="rounded-[2rem] border border-[#E5E7EB] bg-[#F9FAFB] p-3 shadow-sm dark:shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 px-2 pt-1 pb-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#111827]">Catálogo</h2>
            <p className="text-xs text-[#6B7280] truncate">
              {products.length > 0 ? 'Desliza un producto para ver acciones' : 'Tus productos'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#111827] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
            <Package className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280] font-medium">No hay productos</p>
            <p className="text-sm text-[#9CA3AF] mt-1">
              {canCreateProducts ? 'Crea tu primer producto para empezar' : 'No hay productos disponibles'}
            </p>
            {canCreateProducts && (
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear producto
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {products.map((product) => {
              const status = PRODUCT_STATUS[product.status] ?? PRODUCT_STATUS.draft
              const editHref = `/admin/products/${product.id}/edit`
              const storeHref = `/producto/${product.slug}`
              const rightActions: SwipeAction[] = [
                { id: 'view', label: 'Ver en tienda', icon: Eye, tone: 'neutral', onAction: () => window.open(storeHref, '_blank') },
                ...(canEditProducts
                  ? [{ id: 'edit', label: 'Editar', icon: Edit, tone: 'primary' as const, onAction: () => router.push(editHref) }]
                  : []),
              ]
              const leftActions: SwipeAction[] = canDeleteProducts
                ? [{ id: 'delete', label: 'Eliminar', icon: Trash2, tone: 'danger', onAction: () => handleDelete(product.id) }]
                : []

              return (
                <SwipeableRow
                  key={product.id}
                  label={`Producto ${product.name}`}
                  openSide={openRow?.id === product.id ? openRow.side : null}
                  onOpenChange={(side) => setOpenRow(side ? { id: product.id, side } : null)}
                  leftActions={leftActions}
                  rightActions={rightActions}
                  onSelect={() => (canEditProducts ? router.push(editHref) : window.open(storeHref, '_blank'))}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" draggable={false} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111827] truncate">{product.name}</p>
                      <p className="text-xs text-[#6B7280] truncate">
                        <span className={toneStyles[status.tone].text}>{status.label}</span>
                        {' · '}
                        <span className={product.inventory < 20 ? toneStyles.amber.text : undefined}>
                          {product.inventory} en stock
                        </span>
                        {product.category && ` · ${product.category}`}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs font-medium tabular-nums text-[#111827]">${product.price.toLocaleString()}</p>
                      {product.compareAtPrice && (
                        <p className="text-[11px] tabular-nums text-[#9CA3AF] line-through">
                          ${product.compareAtPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </SwipeableRow>
              )
            })}
          </div>
        )}

        {products.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-2 pt-3 pb-1 text-xs text-[#6B7280]">
            <span>
              {pagination.totalPages > 1
                ? `${(pagination.page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(pagination.page * ITEMS_PER_PAGE, pagination.total)} de ${pagination.total} productos`
                : `${pagination.total} ${pagination.total === 1 ? 'producto' : 'productos'}`}
            </span>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  aria-label="Página anterior"
                  className="p-1.5 rounded-full border border-[#E5E7EB] hover:bg-white hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 tabular-nums">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  aria-label="Página siguiente"
                  className="p-1.5 rounded-full border border-[#E5E7EB] hover:bg-white hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

const PRODUCT_STATUS: Record<Product['status'], { label: string; tone: StatusTone }> = {
  active: { label: 'Activo', tone: 'green' },
  draft: { label: 'Borrador', tone: 'amber' },
  archived: { label: 'Archivado', tone: 'neutral' },
}
