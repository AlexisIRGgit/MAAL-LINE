'use client'

import { motion } from 'framer-motion'
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

// Mock data - will be replaced with real data
const salesData = [
  { name: 'Ene', ventas: 4000, pedidos: 24 },
  { name: 'Feb', ventas: 3000, pedidos: 18 },
  { name: 'Mar', ventas: 5000, pedidos: 32 },
  { name: 'Abr', ventas: 4500, pedidos: 28 },
  { name: 'May', ventas: 6000, pedidos: 41 },
  { name: 'Jun', ventas: 5500, pedidos: 36 },
  { name: 'Jul', ventas: 7000, pedidos: 48 },
]

const topProducts = [
  { name: 'Hoodie Oversize Black', ventas: 124, revenue: '$12,400' },
  { name: 'Tee Gothic Print', ventas: 98, revenue: '$4,900' },
  { name: 'Cargo Pants Dark', ventas: 76, revenue: '$7,600' },
  { name: 'Jacket Bomber', ventas: 54, revenue: '$8,100' },
]

const recentOrders = [
  { id: 'ML-001', customer: 'Juan Pérez', total: '$2,450', status: 'completed' },
  { id: 'ML-002', customer: 'María García', total: '$1,200', status: 'processing' },
  { id: 'ML-003', customer: 'Carlos López', total: '$890', status: 'pending' },
  { id: 'ML-004', customer: 'Ana Martínez', total: '$3,100', status: 'completed' },
  { id: 'ML-005', customer: 'Roberto Sánchez', total: '$650', status: 'cancelled' },
]

const stats = [
  {
    title: 'Ventas Totales',
    value: '$124,500',
    change: '+12.5%',
    isPositive: true,
    icon: DollarSign,
    color: '#C9A962',
  },
  {
    title: 'Pedidos',
    value: '1,245',
    change: '+8.2%',
    isPositive: true,
    icon: ShoppingBag,
    color: '#22C55E',
  },
  {
    title: 'Clientes',
    value: '892',
    change: '+15.3%',
    isPositive: true,
    icon: Users,
    color: '#3B82F6',
  },
  {
    title: 'Conversión',
    value: '3.24%',
    change: '-0.8%',
    isPositive: false,
    icon: TrendingUp,
    color: '#F59E0B',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export default function AdminDashboard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#E8E4D9]">Dashboard</h1>
          <p className="text-[#666] mt-1">Bienvenido al panel de administración</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-[#111] border border-[#222] rounded-xl text-[#E8E4D9] text-sm focus:outline-none focus:border-[#C9A962]">
            <option>Últimos 7 días</option>
            <option>Últimos 30 días</option>
            <option>Este mes</option>
            <option>Este año</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#C9A962]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl hover:border-[#222] transition-all">
              <div className="flex items-start justify-between">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-[#666] text-sm">{stat.title}</h3>
                <p className="text-2xl font-bold text-[#E8E4D9] mt-1">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#E8E4D9]">Ventas</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#C9A962]" />
                <span className="text-[#666]">Ventas</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A962" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A962" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    color: '#E8E4D9',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#C9A962"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          variants={itemVariants}
          className="p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl"
        >
          <h2 className="text-lg font-semibold text-[#E8E4D9] mb-6">Top Productos</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#111] hover:bg-[#151515] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-[#C9A962] font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#E8E4D9] text-sm font-medium truncate">{product.name}</p>
                  <p className="text-[#666] text-xs">{product.ventas} vendidos</p>
                </div>
                <div className="text-right">
                  <p className="text-[#C9A962] font-semibold">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Orders Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Day */}
        <motion.div
          variants={itemVariants}
          className="p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl"
        >
          <h2 className="text-lg font-semibold text-[#E8E4D9] mb-6">Pedidos por Día</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    border: '1px solid #222',
                    borderRadius: '12px',
                    color: '#E8E4D9',
                  }}
                />
                <Bar dataKey="pedidos" fill="#C9A962" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          variants={itemVariants}
          className="p-6 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#E8E4D9]">Pedidos Recientes</h2>
            <a href="/admin/orders" className="text-[#C9A962] text-sm hover:underline">
              Ver todos
            </a>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-[#111] hover:bg-[#151515] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[#E8E4D9] font-mono text-sm">{order.id}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-[#666] text-sm mt-1">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#E8E4D9] font-semibold">{order.total}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Package, label: 'Nuevo Producto', href: '/admin/products/new', color: '#C9A962' },
          { icon: ShoppingBag, label: 'Ver Pedidos', href: '/admin/orders', color: '#22C55E' },
          { icon: Users, label: 'Clientes', href: '/admin/customers', color: '#3B82F6' },
          { icon: Percent, label: 'Descuentos', href: '/admin/discounts', color: '#F59E0B' },
        ].map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="group p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl hover:border-[#222] transition-all flex items-center gap-4"
          >
            <div
              className="p-3 rounded-xl transition-all group-hover:scale-110"
              style={{ backgroundColor: `${action.color}15` }}
            >
              <action.icon className="w-5 h-5" style={{ color: action.color }} />
            </div>
            <span className="text-[#E8E4D9] font-medium">{action.label}</span>
          </a>
        ))}
      </motion.div>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: { bg: 'bg-green-500/10', text: 'text-green-500', icon: CheckCircle },
    processing: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Clock },
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', icon: Clock },
    cancelled: { bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle },
  }

  const style = styles[status as keyof typeof styles] || styles.pending
  const Icon = style.icon

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${style.bg} ${style.text}`}>
      <Icon className="w-3 h-3" />
      {status}
    </div>
  )
}
