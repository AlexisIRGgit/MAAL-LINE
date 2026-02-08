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
  Percent,
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
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

export default function AdminDashboard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#E8E4D9]">Dashboard</h1>
          <p className="text-[#666] text-xs">Bienvenido al panel de administración</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 bg-[#111] border border-[#222] rounded-lg text-[#E8E4D9] text-xs focus:outline-none focus:border-[#C9A962]">
            <option>Últimos 7 días</option>
            <option>Últimos 30 días</option>
            <option>Este mes</option>
            <option>Este año</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#C9A962]/10 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl hover:border-[#222] transition-all">
              <div className="flex items-start justify-between">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-[#666] text-xs">{stat.title}</h3>
                <p className="text-lg font-bold text-[#E8E4D9]">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Sales Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#E8E4D9]">Ventas</h2>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#C9A962]" />
                <span className="text-[#666]">Ventas</span>
              </div>
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A962" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A962" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    border: '1px solid #222',
                    borderRadius: '8px',
                    color: '#E8E4D9',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#C9A962"
                  strokeWidth={1.5}
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
          className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl"
        >
          <h2 className="text-sm font-semibold text-[#E8E4D9] mb-3">Top Productos</h2>
          <div className="space-y-2">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-2 p-2 rounded-lg bg-[#111] hover:bg-[#151515] transition-colors"
              >
                <div className="w-5 h-5 rounded bg-[#1a1a1a] flex items-center justify-center text-[#C9A962] font-bold text-xs">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#E8E4D9] text-xs font-medium truncate">{product.name}</p>
                  <p className="text-[#666] text-[10px]">{product.ventas} vendidos</p>
                </div>
                <div className="text-right">
                  <p className="text-[#C9A962] text-xs font-semibold">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Orders Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Orders by Day */}
        <motion.div
          variants={itemVariants}
          className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl"
        >
          <h2 className="text-sm font-semibold text-[#E8E4D9] mb-3">Pedidos por Día</h2>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    border: '1px solid #222',
                    borderRadius: '8px',
                    color: '#E8E4D9',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="pedidos" fill="#C9A962" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          variants={itemVariants}
          className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#E8E4D9]">Pedidos Recientes</h2>
            <a href="/admin/orders" className="text-[#C9A962] text-xs hover:underline">
              Ver todos
            </a>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-[#111] hover:bg-[#151515] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[#E8E4D9] font-mono text-xs">{order.id}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-[#666] text-[10px] mt-0.5">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#E8E4D9] text-xs font-semibold">{order.total}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { icon: Package, label: 'Nuevo Producto', href: '/admin/products/new', color: '#C9A962' },
          { icon: ShoppingBag, label: 'Ver Pedidos', href: '/admin/orders', color: '#22C55E' },
          { icon: Users, label: 'Clientes', href: '/admin/customers', color: '#3B82F6' },
          { icon: Percent, label: 'Descuentos', href: '/admin/discounts', color: '#F59E0B' },
        ].map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="group p-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl hover:border-[#222] transition-all flex items-center gap-2"
          >
            <div
              className="p-1.5 rounded-lg transition-all group-hover:scale-110"
              style={{ backgroundColor: `${action.color}15` }}
            >
              <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
            </div>
            <span className="text-[#E8E4D9] text-xs font-medium">{action.label}</span>
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
    <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${style.bg} ${style.text}`}>
      <Icon className="w-2.5 h-2.5" />
      {status}
    </div>
  )
}
