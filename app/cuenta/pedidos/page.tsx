'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Package,
  Search,
  ChevronRight,
  Truck,
  ShoppingBag,
  ChevronDown,
  Eye,
  RotateCcw,
  Loader2,
  MapPin,
  Calendar,
  CreditCard,
  Hash,
  Copy,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  getOrderStatus,
  toneStyles,
  OrderStatusIndicator,
  PaidIndicator,
  IndicatorDivider,
} from '@/components/account/order-status'
import { CenterMorphModal } from '@/components/ui/center-morph-modal'

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
  paymentStatus: string
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
  // Keeps the last order rendered while the modal folds closed
  const lastSelectedOrder = useRef<Order | null>(null)
  if (selectedOrder) lastSelectedOrder.current = selectedOrder
  const modalOrder = selectedOrder ?? lastSelectedOrder.current
  const detailsTriggerRef = useRef<HTMLButtonElement | null>(null)
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

  // Deep link from the summary page: /cuenta/pedidos?pedido=<orderNumber> opens that order
  const deepLinkHandled = useRef(false)
  useEffect(() => {
    if (deepLinkHandled.current || loading || orders.length === 0) return
    deepLinkHandled.current = true
    const target = new URLSearchParams(window.location.search).get('pedido')
    if (!target || !orders.some((order) => order.id === target)) return
    setExpandedOrder(target)
    requestAnimationFrame(() => {
      document.getElementById(`pedido-${target}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [loading, orders])

  const filteredOrders = orders.filter((order) => {
    if (searchQuery && statusFilter === 'all') {
      return (
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    return true
  })

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
          <p className="text-xl sm:text-2xl font-bold tabular-nums text-[#111827]">{stats.total}</p>
          <p className="text-xs sm:text-sm text-[#6B7280]">Total pedidos</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4">
          <p className={cn('text-xl sm:text-2xl font-bold tabular-nums', toneStyles.amber.text)}>{stats.processing}</p>
          <p className="text-xs sm:text-sm text-[#6B7280]">En proceso</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4">
          <p className={cn('text-xl sm:text-2xl font-bold tabular-nums', toneStyles.blue.text)}>{stats.shipped}</p>
          <p className="text-xs sm:text-sm text-[#6B7280]">En camino</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 sm:p-4">
          <p className={cn('text-xl sm:text-2xl font-bold tabular-nums', toneStyles.green.text)}>{stats.delivered}</p>
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
            const statusInfo = getOrderStatus(order.status)
            const isExpanded = expandedOrder === order.id

            return (
              <div
                key={order.id}
                id={`pedido-${order.id}`}
                className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden scroll-mt-24"
              >
                {/* Order Header */}
                <div
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="p-4 sm:p-5 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={cn('p-3 rounded-xl flex-shrink-0', toneStyles[statusInfo.tone].tile)}>
                      <statusInfo.icon className="w-5 h-5" />
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
                        <span className="font-bold text-[#111827]">{order.id}</span>
                        <span className="inline-flex items-center gap-2.5">
                          {order.paymentStatus === 'paid' && (
                            <>
                              <PaidIndicator />
                              <IndicatorDivider />
                            </>
                          )}
                          <OrderStatusIndicator status={order.status} />
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
                        onClick={(event) => {
                          detailsTriggerRef.current = event.currentTarget
                          setSelectedOrder(order)
                        }}
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
      <CenterMorphModal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        labelledBy="order-details-title"
        returnFocusRef={detailsTriggerRef}
      >
        {modalOrder && (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="pr-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF]">Detalles del pedido</p>
              <h2 id="order-details-title" className="mt-1 text-lg font-bold text-[#111827] break-all">
                {modalOrder.id}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {modalOrder.paymentStatus === 'paid' && (
                  <>
                    <PaidIndicator />
                    <IndicatorDivider />
                  </>
                )}
                <OrderStatusIndicator status={modalOrder.status} />
                <IndicatorDivider />
                <span className="inline-flex items-center gap-1.5 text-xs text-[#6B7280]">
                  <Calendar className="w-3.5 h-3.5" />
                  {modalOrder.date}
                </span>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#6B7280]" />
                Productos ({modalOrder.items.length})
              </h3>
              <div className="space-y-2">
                {modalOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-2xl">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#E5E7EB]">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-[#9CA3AF]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111827] truncate">{item.name}</p>
                      <p className="text-xs text-[#6B7280]">
                        Talla {item.size} · Cantidad {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-[#111827]">${item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6B7280]" />
                Dirección de envío
              </h3>
              <div className="p-4 bg-[#F9FAFB] rounded-2xl">
                <p className="text-sm text-[#374151]">{modalOrder.shippingAddress}</p>
              </div>
            </div>

            {/* Tracking Number */}
            {modalOrder.trackingNumber && (
              <div>
                <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#6B7280]" />
                  Número de rastreo
                </h3>
                <div className="p-4 bg-[#F9FAFB] rounded-2xl flex items-center justify-between gap-3">
                  <code className="text-sm font-mono text-[#374151] break-all">{modalOrder.trackingNumber}</code>
                  <button
                    onClick={() => copyToClipboard(modalOrder.trackingNumber!)}
                    className="p-2 hover:bg-white rounded-lg transition-colors flex items-center gap-2 text-sm text-[#6B7280]"
                  >
                    {copied ? (
                      <>
                        <Check className={cn('w-4 h-4', toneStyles.green.text)} />
                        <span className={toneStyles.green.text}>Copiado</span>
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
              <div className="p-4 bg-[#F9FAFB] rounded-2xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span className="text-[#374151] tabular-nums">${modalOrder.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Envío</span>
                  <span className="text-[#374151]">Gratis</span>
                </div>
                <div className="pt-2 border-t border-[#E5E7EB] flex justify-between">
                  <span className="font-semibold text-[#111827]">Total</span>
                  <span className="font-bold text-[#111827] tabular-nums">${modalOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {modalOrder.status === 'delivered' && (
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-full hover:bg-[#1F2937] transition-colors">
                  <RotateCcw className="w-4 h-4" />
                  Reordenar
                </button>
              )}
              {modalOrder.trackingNumber && (
                <button className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-full hover:bg-[#F9FAFB] transition-colors">
                  <Truck className="w-4 h-4" />
                  Rastrear envío
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-full hover:bg-[#F9FAFB] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </CenterMorphModal>
    </motion.div>
  )
}
