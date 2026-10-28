'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  ShoppingCart,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Loader2,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Hash,
  Edit2,
  Save,
  RefreshCw,
  Copy,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { toast } from '@/lib/toast'
import { toneStyles, type StatusTone } from '@/components/account/order-status'
import { SwipeableRow, type SwipeAction, type SwipeSide } from '@/components/account/swipeable-list'

interface OrderItem {
  id: string
  name: string
  variant: string | null
  quantity: number
  price: number
  total: number
  image: string | null
}

interface Order {
  id: string
  orderNumber: string
  customer: {
    id: string | null
    name: string
    email: string
  }
  email: string
  phone: string | null
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  subtotal: number
  shippingTotal: number
  discountTotal: number
  total: number
  itemsCount: number
  items: OrderItem[]
  shippingAddress: {
    fullName: string
    phone?: string
    streetLine1: string
    streetLine2?: string
    neighborhood?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  shippingMethod: string | null
  discountCode: string | null
  shipment: {
    id: string
    status: string
    carrier: string | null
    trackingNumber: string | null
    trackingUrl: string | null
  } | null
  customerNotes: string | null
  internalNotes: string | null
  createdAt: string
  confirmedAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
}

interface Stats {
  total: number
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ITEMS_PER_PAGE = 10

// Tones shared with the customer panel's order list (components/account/order-status)
const ORDER_TONES: Record<string, { label: string; tone: StatusTone; icon: LucideIcon }> = {
  pending: { label: 'Pendiente', tone: 'amber', icon: Clock },
  confirmed: { label: 'Confirmado', tone: 'blue', icon: CheckCircle },
  processing: { label: 'Procesando', tone: 'amber', icon: Package },
  shipped: { label: 'Enviado', tone: 'blue', icon: Truck },
  delivered: { label: 'Entregado', tone: 'green', icon: CheckCircle },
  cancelled: { label: 'Cancelado', tone: 'red', icon: XCircle },
  refunded: { label: 'Reembolsado', tone: 'neutral', icon: RefreshCw },
}

const PAYMENT_TONES: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: 'Pago pendiente', tone: 'amber' },
  paid: { label: 'Pagado', tone: 'green' },
  partially_refunded: { label: 'Reembolso parcial', tone: 'amber' },
  refunded: { label: 'Reembolsado', tone: 'neutral' },
  failed: { label: 'Pago fallido', tone: 'red' },
}

// Quick action on the left rail: move the order one step forward
const NEXT_STATUS: Record<string, { status: string; label: string; icon: LucideIcon }> = {
  confirmed: { status: 'shipped', label: 'Marcar como enviado', icon: Truck },
  processing: { status: 'shipped', label: 'Marcar como enviado', icon: Truck },
  shipped: { status: 'delivered', label: 'Marcar como entregado', icon: CheckCircle },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [openRow, setOpenRow] = useState<{ id: string; side: SwipeSide } | null>(null)

  // Tracking form
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('')
  const [showTrackingForm, setShowTrackingForm] = useState(false)

  // Notes form
  const [internalNotes, setInternalNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)

  const fetchOrders = async (page: number = currentPage) => {
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', ITEMS_PER_PAGE.toString())
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)

      const response = await fetch(`/api/admin/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setStats(data.stats)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // ?search= prefills the box (links from the ntfy "Pago confirmado" push)
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('search')
    if (fromUrl) setSearch(fromUrl)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    fetchOrders(1)
  }, [search, statusFilter])

  useEffect(() => {
    fetchOrders(currentPage)
  }, [currentPage])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatShortDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

  const copyOrderNumber = async (orderNumber: string) => {
    try {
      await navigator.clipboard.writeText(orderNumber)
      toast.success('Número copiado', undefined, 1500)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchOrders()
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null)
        }
        toast.success('Estado actualizado')
      } else {
        toast.error('Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error al actualizar estado')
    } finally {
      setUpdating(false)
    }
  }

  const handlePaymentStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus }),
      })

      if (response.ok) {
        await fetchOrders()
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, paymentStatus: newStatus } : null)
        }
        toast.success('Estado de pago actualizado')
      } else {
        toast.error('Error al actualizar estado de pago')
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('Error al actualizar estado de pago')
    } finally {
      setUpdating(false)
    }
  }

  const handleAddTracking = async () => {
    if (!selectedOrder || !trackingNumber) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber, carrier }),
      })

      if (response.ok) {
        await fetchOrders()
        setShowTrackingForm(false)
        setTrackingNumber('')
        setCarrier('')
        toast.success('Número de rastreo guardado')
      } else {
        toast.error('Error al guardar tracking')
      }
    } catch (error) {
      console.error('Error adding tracking:', error)
      toast.error('Error al guardar tracking')
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedOrder) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes }),
      })

      if (response.ok) {
        setSelectedOrder((prev) => prev ? { ...prev, internalNotes } : null)
        setEditingNotes(false)
        toast.success('Notas guardadas')
      } else {
        toast.error('Error al guardar notas')
      }
    } catch (error) {
      console.error('Error saving notes:', error)
      toast.error('Error al guardar notas')
    } finally {
      setUpdating(false)
    }
  }

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order)
    setInternalNotes(order.internalNotes || '')
    setShowTrackingForm(false)
    setEditingNotes(false)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#111827]" />
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Pedidos</h1>
          <p className="text-[#6B7280] text-sm mt-1">Gestiona todos los pedidos de la tienda</p>
        </div>
      </motion.div>

      {/* Stats Bar */}
      {stats && (
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#6B7280] mr-1">Filtrar:</span>
          {[
            { key: '', label: 'Todos', value: stats.total, icon: ShoppingCart },
            { key: 'pending', label: 'Pendientes', value: stats.pending, icon: Clock, dot: 'bg-yellow-500' },
            { key: 'processing', label: 'Procesando', value: stats.processing, icon: Package, dot: 'bg-purple-500' },
            { key: 'shipped', label: 'Enviados', value: stats.shipped, icon: Truck, dot: 'bg-indigo-500' },
            { key: 'delivered', label: 'Entregados', value: stats.delivered, icon: CheckCircle, dot: 'bg-green-500' },
            { key: 'cancelled', label: 'Cancelados', value: stats.cancelled, icon: XCircle, dot: 'bg-red-500' },
          ].map((stat) => {
            const Icon = stat.icon
            const isActive = statusFilter === stat.key
            return (
              <button
                key={stat.label}
                onClick={() => setStatusFilter(stat.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[#111827] text-white'
                    : 'bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#111827]'
                )}
              >
                {stat.dot && !isActive && (
                  <span className={cn('w-2 h-2 rounded-full', stat.dot)} />
                )}
                {!stat.dot && <Icon className="w-3.5 h-3.5" />}
                {stat.label}
                <span className={cn(
                  'ml-0.5 px-1.5 py-0.5 text-xs rounded-full',
                  isActive ? 'bg-white/20' : 'bg-[#F3F4F6]'
                )}>
                  {stat.value}
                </span>
              </button>
            )
          })}
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar por número de orden, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>

          <button
            onClick={() => fetchOrders()}
            className="p-2.5 bg-white border border-[#E5E7EB] rounded-xl hover:bg-[#F3F4F6] transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>
      </motion.div>

      {/* Orders list (same swipeable card list as the account's recent orders) */}
      <motion.div
        variants={itemVariants}
        className="rounded-[2rem] border border-[#E5E7EB] bg-[#F9FAFB] p-3 shadow-sm dark:shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 px-2 pt-1 pb-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#111827]">Pedidos</h2>
            <p className="text-xs text-[#6B7280] truncate">
              {orders.length > 0 ? 'Desliza un pedido para ver acciones' : 'Pedidos de la tienda'}
            </p>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="flex flex-col gap-2">
            {orders.map((order) => {
              const status = ORDER_TONES[order.status] ?? { label: order.status, tone: 'neutral' as const, icon: Package }
              const payment = PAYMENT_TONES[order.paymentStatus] ?? { label: order.paymentStatus, tone: 'neutral' as const }
              const next = NEXT_STATUS[order.status]
              const rightActions: SwipeAction[] = [
                { id: 'copy', label: 'Copiar número', icon: Copy, tone: 'neutral', onAction: () => copyOrderNumber(order.orderNumber) },
                { id: 'view', label: 'Ver pedido', icon: Eye, tone: 'primary', onAction: () => openOrderModal(order) },
              ]
              const leftActions: SwipeAction[] = next
                ? [{ id: 'advance', label: next.label, icon: next.icon, tone: 'success', onAction: () => handleStatusChange(order.id, next.status) }]
                : []

              return (
                <SwipeableRow
                  key={order.id}
                  label={`Pedido ${order.orderNumber}`}
                  openSide={openRow?.id === order.id ? openRow.side : null}
                  onOpenChange={(side) => setOpenRow(side ? { id: order.id, side } : null)}
                  leftActions={leftActions}
                  rightActions={rightActions}
                  onSelect={() => openOrderModal(order)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]">
                      <status.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111827] truncate">{order.orderNumber}</p>
                      <p className="text-xs text-[#6B7280] truncate">
                        <span className={toneStyles[status.tone].text}>{status.label}</span>
                        {' · '}
                        <span className={toneStyles[payment.tone].text}>{payment.label}</span>
                        {' · '}
                        {order.customer.name}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs font-medium tabular-nums text-[#111827]">{formatPrice(order.total)}</p>
                      <p className="text-[11px] tabular-nums text-[#9CA3AF]">{formatShortDate(order.createdAt)}</p>
                    </div>
                  </div>
                </SwipeableRow>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
            <ShoppingCart className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280] font-medium">No hay pedidos</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Los pedidos aparecerán aquí cuando se realicen</p>
          </div>
        )}

        {orders.length > 0 && pagination && (
          <div className="flex items-center justify-between gap-3 px-2 pt-3 pb-1 text-xs text-[#6B7280]">
            <span>
              {pagination.totalPages > 1
                ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} de ${pagination.total} pedidos`
                : `${pagination.total} ${pagination.total === 1 ? 'pedido' : 'pedidos'}`}
            </span>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  aria-label="Página anterior"
                  className="p-1.5 rounded-full border border-[#E5E7EB] hover:bg-white hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 tabular-nums">
                  {currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
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

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="fixed inset-0 bg-black/50 transition-opacity"
              />

              {/* Trick to center modal */}
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block w-full max-w-4xl my-8 text-left align-middle bg-white rounded-2xl shadow-xl overflow-hidden relative"
              >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">Pedido {selectedOrder.orderNumber}</h2>
                  <p className="text-sm text-[#6B7280]">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Status Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Status */}
                  <div className="p-4 bg-[#F9FAFB] rounded-xl">
                    <label className="block text-sm font-medium text-[#374151] mb-2">Estado del Pedido</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      disabled={updating}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] disabled:opacity-50"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="processing">Procesando</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div className="p-4 bg-[#F9FAFB] rounded-xl">
                    <label className="block text-sm font-medium text-[#374151] mb-2">Estado del Pago</label>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(selectedOrder.id, e.target.value)}
                      disabled={updating}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827] disabled:opacity-50"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="paid">Pagado</option>
                      <option value="failed">Fallido</option>
                      <option value="refunded">Reembolsado</option>
                    </select>
                  </div>
                </div>

                {/* Tracking Section */}
                <div className="p-4 bg-[#F9FAFB] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-[#374151]">Información de Envío</label>
                    {!showTrackingForm && (
                      <button
                        onClick={() => setShowTrackingForm(true)}
                        className="text-sm text-[#111827] hover:underline"
                      >
                        {selectedOrder.shipment?.trackingNumber ? 'Editar' : 'Agregar tracking'}
                      </button>
                    )}
                  </div>

                  {selectedOrder.shipment?.trackingNumber && !showTrackingForm ? (
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm text-[#6B7280]">Paquetería</p>
                        <p className="font-medium text-[#111827]">{selectedOrder.shipment.carrier || 'No especificada'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#6B7280]">Número de rastreo</p>
                        <p className="font-mono font-medium text-[#111827]">{selectedOrder.shipment.trackingNumber}</p>
                      </div>
                    </div>
                  ) : showTrackingForm ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Paquetería (ej: DHL, Fedex)"
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]"
                        />
                        <input
                          type="text"
                          placeholder="Número de rastreo"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddTracking}
                          disabled={updating || !trackingNumber}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-xl hover:bg-[#1F2937] disabled:opacity-50 transition-colors"
                        >
                          {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setShowTrackingForm(false)
                            setTrackingNumber('')
                            setCarrier('')
                          }}
                          className="px-4 py-2 text-sm text-[#6B7280] hover:bg-white rounded-xl transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#9CA3AF]">No hay información de envío todavía</p>
                  )}
                </div>

                {/* Customer & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Info */}
                  <div className="p-4 border border-[#E5E7EB] rounded-xl">
                    <h3 className="font-medium text-[#111827] mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Cliente
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-[#111827] font-medium">{selectedOrder.customer.name}</p>
                      <p className="text-[#6B7280] flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        {selectedOrder.email}
                      </p>
                      {selectedOrder.phone && (
                        <p className="text-[#6B7280] flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" />
                          {selectedOrder.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="p-4 border border-[#E5E7EB] rounded-xl">
                    <h3 className="font-medium text-[#111827] mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Dirección de Envío
                    </h3>
                    <div className="text-sm text-[#6B7280]">
                      <p className="text-[#111827] font-medium">{selectedOrder.shippingAddress.fullName}</p>
                      <p>{selectedOrder.shippingAddress.streetLine1}</p>
                      {selectedOrder.shippingAddress.streetLine2 && (
                        <p>{selectedOrder.shippingAddress.streetLine2}</p>
                      )}
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                        {selectedOrder.shippingAddress.postalCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-medium text-[#111827] mb-3">Productos ({selectedOrder.itemsCount})</h3>
                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center gap-4 p-4',
                          index < selectedOrder.items.length - 1 && 'border-b border-[#E5E7EB]'
                        )}
                      >
                        <div className="w-16 h-16 bg-[#F3F4F6] rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-[#9CA3AF]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#111827]">{item.name}</p>
                          {item.variant && (
                            <p className="text-sm text-[#6B7280]">Talla: {item.variant}</p>
                          )}
                          <p className="text-sm text-[#6B7280]">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#111827]">{formatPrice(item.total)}</p>
                          <p className="text-xs text-[#6B7280]">{formatPrice(item.price)} c/u</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-4 bg-[#F9FAFB] rounded-xl">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Subtotal</span>
                      <span className="text-[#111827]">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Envío ({selectedOrder.shippingMethod || 'estándar'})</span>
                      <span className="text-[#111827]">
                        {selectedOrder.shippingTotal === 0 ? 'Gratis' : formatPrice(selectedOrder.shippingTotal)}
                      </span>
                    </div>
                    {selectedOrder.discountTotal > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento {selectedOrder.discountCode && `(${selectedOrder.discountCode})`}</span>
                        <span>-{formatPrice(selectedOrder.discountTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-[#E5E7EB] font-semibold">
                      <span className="text-[#111827]">Total</span>
                      <span className="text-[#111827] text-lg">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="p-4 border border-[#E5E7EB] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-[#111827]">Notas Internas</h3>
                    {!editingNotes ? (
                      <button
                        onClick={() => setEditingNotes(true)}
                        className="text-sm text-[#111827] hover:underline flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Editar
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveNotes}
                          disabled={updating}
                          className="text-sm text-[#111827] hover:underline flex items-center gap-1"
                        >
                          {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingNotes(false)
                            setInternalNotes(selectedOrder.internalNotes || '')
                          }}
                          className="text-sm text-[#6B7280] hover:underline"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                  {editingNotes ? (
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#111827]"
                      placeholder="Agregar notas internas sobre este pedido..."
                    />
                  ) : (
                    <p className="text-sm text-[#6B7280]">
                      {selectedOrder.internalNotes || 'Sin notas internas'}
                    </p>
                  )}
                </div>

                {/* Customer Notes */}
                {selectedOrder.customerNotes && (
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl">
                    <h3 className="font-medium text-yellow-800 mb-2">Notas del Cliente</h3>
                    <p className="text-sm text-yellow-700">{selectedOrder.customerNotes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
