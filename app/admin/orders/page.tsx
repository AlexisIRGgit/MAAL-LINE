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
  pending: { label: 'Pendiente', icon: Clock, color: 'yellow' },
  processing: { label: 'Procesando', icon: Package, color: 'blue' },
  shipped: { label: 'Enviado', icon: Truck, color: 'purple' },
  delivered: { label: 'Entregado', icon: CheckCircle, color: 'green' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'red' },
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
    { label: 'Total Pedidos', value: orders.length, icon: Package, color: '#C9A962' },
    { label: 'Pendientes', value: orders.filter((o) => o.status === 'pending').length, icon: Clock, color: '#EAB308' },
    { label: 'En Proceso', value: orders.filter((o) => o.status === 'processing').length, icon: Truck, color: '#3B82F6' },
    { label: 'Entregados', value: orders.filter((o) => o.status === 'delivered').length, icon: CheckCircle, color: '#22C55E' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl font-bold text-[#E8E4D9]">Pedidos</h1>
        <p className="text-[#666] mt-1 text-xs">Gestiona todos los pedidos de la tienda</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl"
          >
            <div className="flex items-center gap-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-lg font-bold text-[#E8E4D9]">{stat.value}</p>
                <p className="text-xs text-[#666]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666]" />
          <input
            type="text"
            placeholder="Buscar por orden, cliente o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-xs text-[#E8E4D9] placeholder-[#666] focus:outline-none focus:border-[#C9A962] transition-colors"
          />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none px-3 py-2 pr-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962] transition-colors cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666] pointer-events-none" />
        </div>

        <button className="inline-flex items-center gap-2 px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-xs text-[#E8E4D9] hover:border-[#222] transition-colors">
          <Filter className="w-3.5 h-3.5" />
          Más filtros
        </button>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        variants={itemVariants}
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a1a]">
                <th className="p-2 text-left text-xs font-medium text-[#666]">Pedido</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Cliente</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Fecha</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Estado</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Pago</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]">Total</th>
                <th className="p-2 text-left text-xs font-medium text-[#666]"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => {
                const status = statusConfig[order.status as keyof typeof statusConfig]
                const StatusIcon = status.icon

                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="p-2">
                      <span className="text-[#E8E4D9] font-mono font-medium text-xs">{order.id}</span>
                    </td>
                    <td className="p-2">
                      <div>
                        <p className="text-[#E8E4D9] font-medium text-xs">{order.customer.name}</p>
                        <p className="text-[#666] text-xs">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1 text-[#888]">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs">{order.date}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-${status.color}-500/10 text-${status.color}-500`}
                        style={{
                          backgroundColor: `var(--${status.color}-bg, rgba(${status.color === 'yellow' ? '234,179,8' : status.color === 'blue' ? '59,130,246' : status.color === 'green' ? '34,197,94' : status.color === 'red' ? '239,68,68' : '168,85,247'}, 0.1))`,
                          color: `var(--${status.color}-text, ${status.color === 'yellow' ? '#EAB308' : status.color === 'blue' ? '#3B82F6' : status.color === 'green' ? '#22C55E' : status.color === 'red' ? '#EF4444' : '#A855F7'})`,
                        }}
                      >
                        <StatusIcon className="w-2.5 h-2.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-500/10 text-green-500'
                            : order.paymentStatus === 'refunded'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        <DollarSign className="w-2.5 h-2.5" />
                        {order.paymentStatus === 'paid' ? 'Pagado' : order.paymentStatus === 'refunded' ? 'Reembolsado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="text-[#E8E4D9] font-semibold text-xs">
                        ${order.total.toLocaleString()}
                      </span>
                      <span className="text-[#666] text-xs ml-1">
                        ({order.items} items)
                      </span>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOrder(order)
                        }}
                        className="p-1 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#666]" />
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-2 border-t border-[#1a1a1a]">
          <p className="text-xs text-[#666]">
            Mostrando {filteredOrders.length} de {orders.length} pedidos
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 text-xs text-[#666] hover:text-[#E8E4D9] hover:bg-[#111] rounded-lg transition-colors disabled:opacity-50" disabled>
              Anterior
            </button>
            <button className="px-3 py-1 text-xs bg-[#C9A962] text-[#0a0a0a] rounded-lg font-medium">
              1
            </button>
            <button className="px-3 py-1 text-xs text-[#666] hover:text-[#E8E4D9] hover:bg-[#111] rounded-lg transition-colors">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3 z-50"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#E8E4D9]">Pedido {selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 hover:bg-[#111] rounded-lg transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5 text-[#666]" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-2 bg-[#111] rounded-xl">
                  <p className="text-[#666] text-xs">Cliente</p>
                  <p className="text-[#E8E4D9] font-medium text-xs">{selectedOrder.customer.name}</p>
                  <p className="text-[#888] text-xs">{selectedOrder.customer.email}</p>
                </div>

                <div className="p-2 bg-[#111] rounded-xl">
                  <p className="text-[#666] text-xs">Dirección de envío</p>
                  <p className="text-[#E8E4D9] text-xs">{selectedOrder.shippingAddress}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-[#111] rounded-xl">
                    <p className="text-[#666] text-xs">Total</p>
                    <p className="text-[#C9A962] text-lg font-bold">${selectedOrder.total.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-[#111] rounded-xl">
                    <p className="text-[#666] text-xs">Items</p>
                    <p className="text-[#E8E4D9] text-lg font-bold">{selectedOrder.items}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-2 bg-[#111] border border-[#222] text-[#E8E4D9] font-medium text-xs rounded-xl hover:bg-[#1a1a1a] transition-colors">
                    Ver detalles
                  </button>
                  <button className="flex-1 py-2 bg-[#C9A962] text-[#0a0a0a] font-semibold text-xs rounded-xl hover:bg-[#d4b76d] transition-colors">
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
