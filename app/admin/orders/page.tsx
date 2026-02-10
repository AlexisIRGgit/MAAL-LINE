'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Calendar,
  DollarSign,
  X,
} from 'lucide-react'

// Mock data
const mockOrders = [
  {
    id: 'ML-2024-001',
    customer: { name: 'Juan Pérez', email: 'juan@email.com' },
    date: '2024-02-08',
    items: 3,
    total: 2450,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: 'Col. Roma Norte, CDMX',
  },
  {
    id: 'ML-2024-002',
    customer: { name: 'María García', email: 'maria@email.com' },
    date: '2024-02-08',
    items: 1,
    total: 1200,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: 'Col. Condesa, CDMX',
  },
  {
    id: 'ML-2024-003',
    customer: { name: 'Carlos López', email: 'carlos@email.com' },
    date: '2024-02-07',
    items: 2,
    total: 890,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: 'Monterrey, NL',
  },
  {
    id: 'ML-2024-004',
    customer: { name: 'Ana Martínez', email: 'ana@email.com' },
    date: '2024-02-07',
    items: 4,
    total: 3100,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: 'Guadalajara, JAL',
  },
  {
    id: 'ML-2024-005',
    customer: { name: 'Roberto Sánchez', email: 'roberto@email.com' },
    date: '2024-02-06',
    items: 1,
    total: 650,
    status: 'cancelled',
    paymentStatus: 'refunded',
    shippingAddress: 'Puebla, PUE',
  },
]

const statusConfig = {
  pending: { label: 'Pendiente', icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  processing: { label: 'Procesando', icon: Package, bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  shipped: { label: 'Enviado', icon: Truck, bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  delivered: { label: 'Entregado', icon: CheckCircle, bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  cancelled: { label: 'Cancelado', icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
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

export default function OrdersPage() {
  const [orders] = useState(mockOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = [
    { label: 'Total Pedidos', value: orders.length, icon: Package, color: '#111827' },
    { label: 'Pendientes', value: orders.filter((o) => o.status === 'pending').length, icon: Clock, color: '#D97706' },
    { label: 'En Proceso', value: orders.filter((o) => o.status === 'processing').length, icon: Truck, color: '#2563EB' },
    { label: 'Entregados', value: orders.filter((o) => o.status === 'delivered').length, icon: CheckCircle, color: '#16A34A' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-[#111827]">Pedidos</h1>
        <p className="text-[#6B7280] mt-1 text-sm">Gestiona todos los pedidos de la tienda</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl"
                style={{ backgroundColor: `${stat.color}10` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{stat.value}</p>
                <p className="text-sm text-[#6B7280]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar por orden, cliente o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none px-4 py-2.5 pr-10 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
          <Filter className="w-4 h-4" />
          Más filtros
        </button>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Pedido</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Cliente</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">Fecha</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Estado</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">Pago</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total</th>
                <th className="p-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredOrders.map((order, index) => {
                const status = statusConfig[order.status as keyof typeof statusConfig]
                const StatusIcon = status.icon

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-3">
                      <div>
                        <span className="text-[#111827] font-mono font-medium text-sm">{order.id}</span>
                        <p className="text-[#9CA3AF] text-xs sm:hidden">{order.customer.name}</p>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <div>
                        <p className="text-[#111827] font-medium text-sm">{order.customer.name}</p>
                        <p className="text-[#9CA3AF] text-xs">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-[#6B7280]">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{order.date}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        <span className="hidden sm:inline">{status.label}</span>
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-50 text-green-700'
                            : order.paymentStatus === 'refunded'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        <DollarSign className="w-3 h-3" />
                        {order.paymentStatus === 'paid' ? 'Pagado' : order.paymentStatus === 'refunded' ? 'Reembolsado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[#111827] font-semibold text-sm">
                        ${order.total.toLocaleString()}
                      </span>
                      <span className="text-[#9CA3AF] text-xs ml-1.5 hidden sm:inline">
                        ({order.items} items)
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOrder(order)
                        }}
                        className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-[#6B7280]" />
                      </button>
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
            Mostrando {filteredOrders.length} de {orders.length} pedidos
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

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-auto sm:w-full sm:max-w-lg bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6 z-50 shadow-xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#111827]">Pedido {selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#F9FAFB] rounded-xl">
                  <p className="text-[#6B7280] text-xs uppercase tracking-wider mb-1">Cliente</p>
                  <p className="text-[#111827] font-medium">{selectedOrder.customer.name}</p>
                  <p className="text-[#6B7280] text-sm">{selectedOrder.customer.email}</p>
                </div>

                <div className="p-4 bg-[#F9FAFB] rounded-xl">
                  <p className="text-[#6B7280] text-xs uppercase tracking-wider mb-1">Dirección de envío</p>
                  <p className="text-[#111827]">{selectedOrder.shippingAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F9FAFB] rounded-xl">
                    <p className="text-[#6B7280] text-xs uppercase tracking-wider mb-1">Total</p>
                    <p className="text-[#111827] text-2xl font-bold">${selectedOrder.total.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-[#F9FAFB] rounded-xl">
                    <p className="text-[#6B7280] text-xs uppercase tracking-wider mb-1">Items</p>
                    <p className="text-[#111827] text-2xl font-bold">{selectedOrder.items}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] font-medium text-sm rounded-xl hover:bg-[#F9FAFB] transition-colors">
                    Ver detalles
                  </button>
                  <button className="flex-1 py-2.5 bg-[#111827] text-white font-semibold text-sm rounded-xl hover:bg-[#1F2937] transition-colors">
                    Actualizar estado
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
