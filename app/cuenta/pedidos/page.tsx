'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Search,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  ChevronDown,
  Eye,
  RotateCcw,
  Loader2,
  X,
  MapPin,
  Calendar,
  CreditCard,
  Hash,
  Copy,
  Check,
} from 'lucide-react'

interface OrderItem {
  name: string
  size: string
  quantity: number
  price: number
  image: string | null
}

interface Order {
  id: string
  date: string
  status: string
  total: number
  items: OrderItem[]
  shippingAddress: string
  trackingNumber: string | null
}

interface OrderStats {
  total: number
  processing: number
  shipped: number
  delivered: number
}

const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'processing', label: 'En proceso' },
  { value: 'shipped', label: 'En camino' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({ total: 0, processing: 0, shipped: 0, delivered: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/account/orders?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = orders.filter((order) => {
    if (searchQuery && statusFilter === 'all') {
      return (
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    return true
  })

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'processing':
        return { label: 'En proceso', icon: Clock, color: 'text-amber-600 bg-amber-50', dot: 'bg-amber-500' }
      case 'shipped':
        return { label: 'En camino', icon: Truck, color: 'text-blue-600 bg-blue-50', dot: 'bg-blue-500' }
      case 'delivered':
        return { label: 'Entregado', icon: CheckCircle, color: 'text-green-600 bg-green-50', dot: 'bg-green-500' }
      case 'cancelled':
        return { label: 'Cancelado', icon: XCircle, color: 'text-red-600 bg-red-50', dot: 'bg-red-500' }
      default:
        return { label: status, icon: Package, color: 'text-gray-600 bg-gray-50', dot: 'bg-gray-500' }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B7280]" />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Mis Pedidos</h1>
        <p className="text-[#6B7280] text-sm mt-1">Rastrea y gestiona todos tus pedidos</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-[#111827]">{stats.total}</p>
          <p className="text-xs sm:text-sm text-[#6B7280]">Total pedidos</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.processing}</p>
          <p className="text-xs sm:text-sm text-[#6B7280]">En proceso</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.shipped}</p>
          <p className="text-xs sm:text-sm text-[#6B7280]">En camino</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.delivered}</p>
          <p className="text-xs sm:text-sm text-[#6B7280]">Entregados</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar por número o producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none w-full sm:w-auto px-4 py-2.5 pr-10 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all cursor-pointer"
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>
      </motion.div>

      {/* Orders List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            const isExpanded = expandedOrder === order.id

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden"
              >
                {/* Order Header */}
                <div
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="p-4 sm:p-5 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${statusInfo.color} flex-shrink-0`}>
                      <statusInfo.icon className="w-5 h-5" />
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#111827]">{order.id}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#6B7280] mt-0.5">
                        {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'} • {order.date}
                      </p>
                    </div>

                    {/* Total & Expand */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-bold text-[#111827] hidden sm:block">
                        ${order.total.toLocaleString()}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-[#9CA3AF] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <p className="font-bold text-[#111827] sm:hidden mt-2">
                    ${order.total.toLocaleString()}
                  </p>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#E5E7EB]"
                  >
                    {/* Items */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <h4 className="text-sm font-semibold text-[#111827]">Productos</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                          <div className="w-12 h-12 bg-[#E5E7EB] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-[#9CA3AF]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#111827] truncate">{item.name}</p>
                            <p className="text-xs text-[#6B7280]">Talla: {item.size} • Cantidad: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-[#111827] text-sm">${item.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-[#6B7280] uppercase mb-1">Dirección de envío</h4>
                        <p className="text-sm text-[#111827]">{order.shippingAddress}</p>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <h4 className="text-xs font-semibold text-[#6B7280] uppercase mb-1">Número de rastreo</h4>
                          <p className="text-sm text-[#111827] font-mono">{order.trackingNumber}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalles
                      </button>
                      {order.status === 'delivered' && (
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-xl hover:bg-[#F9FAFB] transition-colors">
                          <RotateCcw className="w-4 h-4" />
                          Reordenar
                        </button>
                      )}
                      {order.trackingNumber && (
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-xl hover:bg-[#F9FAFB] transition-colors">
                          <Truck className="w-4 h-4" />
                          Rastrear envío
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )
          })
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
            <Package className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280] font-medium">
              {searchQuery || statusFilter !== 'all'
                ? 'No se encontraron pedidos'
                : 'No tienes pedidos aún'}
            </p>
            <p className="text-sm text-[#9CA3AF] mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Intenta con otro filtro o búsqueda'
                : 'Cuando hagas tu primer pedido, aparecerá aquí'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Explorar productos
              </Link>
            )}
          </div>
        )}
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">Detalles del Pedido</h2>
                  <p className="text-sm text-[#6B7280]">{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-[#F3F4F6] rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
                {/* Status & Date */}
                <div className="flex flex-wrap items-center gap-4">
                  {(() => {
                    const statusInfo = getStatusInfo(selectedOrder.status)
                    return (
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
                        <statusInfo.icon className="w-4 h-4" />
                        {statusInfo.label}
                      </span>
                    )
                  })()}
                  <span className="inline-flex items-center gap-2 text-sm text-[#6B7280]">
                    <Calendar className="w-4 h-4" />
                    {selectedOrder.date}
                  </span>
                </div>

                {/* Products */}
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#6B7280]" />
                    Productos ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-xl"
                      >
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#E5E7EB]">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-[#9CA3AF]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#111827]">{item.name}</p>
                          <p className="text-sm text-[#6B7280]">Talla: {item.size}</p>
                          <p className="text-sm text-[#6B7280]">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-[#111827]">${item.price.toLocaleString()}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#6B7280]" />
                    Dirección de envío
                  </h3>
                  <div className="p-4 bg-[#F9FAFB] rounded-xl">
                    <p className="text-sm text-[#374151]">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>

                {/* Tracking Number */}
                {selectedOrder.trackingNumber && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#6B7280]" />
                      Número de rastreo
                    </h3>
                    <div className="p-4 bg-[#F9FAFB] rounded-xl flex items-center justify-between gap-3">
                      <code className="text-sm font-mono text-[#374151]">{selectedOrder.trackingNumber}</code>
                      <button
                        onClick={() => copyToClipboard(selectedOrder.trackingNumber!)}
                        className="p-2 hover:bg-white rounded-lg transition-colors flex items-center gap-2 text-sm text-[#6B7280]"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#6B7280]" />
                    Resumen
                  </h3>
                  <div className="p-4 bg-[#F9FAFB] rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Subtotal</span>
                      <span className="text-[#374151]">${selectedOrder.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Envío</span>
                      <span className="text-[#374151]">Gratis</span>
                    </div>
                    <div className="pt-2 border-t border-[#E5E7EB] flex justify-between">
                      <span className="font-semibold text-[#111827]">Total</span>
                      <span className="font-bold text-[#111827]">${selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] px-6 py-4 flex flex-wrap gap-3">
                {selectedOrder.status === 'delivered' && (
                  <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
                    <RotateCcw className="w-4 h-4" />
                    Reordenar
                  </button>
                )}
                {selectedOrder.trackingNumber && (
                  <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-xl hover:bg-[#F9FAFB] transition-colors">
                    <Truck className="w-4 h-4" />
                    Rastrear envío
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-xl hover:bg-[#F9FAFB] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
