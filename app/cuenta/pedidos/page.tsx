'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Package,
  Search,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Filter,
  ChevronDown,
  Eye,
  RotateCcw,
} from 'lucide-react'

// Mock data - será reemplazado con datos reales
const mockOrders = [
  {
    id: 'ML-2024-001',
    date: '2024-02-08',
    status: 'delivered',
    total: 2450,
    items: [
      { name: 'Hoodie Oversize Black', size: 'L', quantity: 1, price: 1299, image: null },
      { name: 'Tee Gothic Print', size: 'M', quantity: 1, price: 699, image: null },
    ],
    shippingAddress: 'Av. Reforma 123, Col. Centro, CDMX',
    trackingNumber: 'DHL1234567890',
  },
  {
    id: 'ML-2024-002',
    date: '2024-02-05',
    status: 'shipped',
    total: 1890,
    items: [
      { name: 'Cargo Pants Dark', size: '32', quantity: 1, price: 1890, image: null },
    ],
    shippingAddress: 'Calle 5 de Mayo 456, Roma Norte, CDMX',
    trackingNumber: 'FEDEX9876543210',
  },
  {
    id: 'ML-2024-003',
    date: '2024-02-01',
    status: 'processing',
    total: 3200,
    items: [
      { name: 'Jacket Bomber', size: 'M', quantity: 1, price: 2499, image: null },
      { name: 'Beanie Logo', size: 'Única', quantity: 1, price: 399, image: null },
      { name: 'Socks Pack x3', size: 'L', quantity: 1, price: 299, image: null },
    ],
    shippingAddress: 'Av. Reforma 123, Col. Centro, CDMX',
    trackingNumber: null,
  },
  {
    id: 'ML-2024-004',
    date: '2024-01-20',
    status: 'cancelled',
    total: 899,
    items: [
      { name: 'Tee Basic White', size: 'S', quantity: 1, price: 499, image: null },
      { name: 'Cap Snapback', size: 'Única', quantity: 1, price: 399, image: null },
    ],
    shippingAddress: 'Calle Juárez 789, Centro, Guadalajara',
    trackingNumber: null,
  },
]

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
  const [orders] = useState(mockOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
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

  const stats = {
    total: orders.length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
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
                          <div className="w-12 h-12 bg-[#E5E7EB] rounded-lg flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 text-[#9CA3AF]" />
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
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
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
            <p className="text-[#6B7280] font-medium">No se encontraron pedidos</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Intenta con otro filtro o búsqueda</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
