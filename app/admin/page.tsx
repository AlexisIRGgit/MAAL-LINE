'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Plus,
  Eye,
  MoreHorizontal,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// Mock data - will be replaced with real data
const salesData = [
  { name: 'Ene', ventas: 4000 },
  { name: 'Feb', ventas: 3000 },
  { name: 'Mar', ventas: 5000 },
  { name: 'Abr', ventas: 4500 },
  { name: 'May', ventas: 6000 },
  { name: 'Jun', ventas: 5500 },
  { name: 'Jul', ventas: 7000 },
]

const categoryData = [
  { name: 'Hoodies', value: 35, color: '#111827' },
  { name: 'Tees', value: 30, color: '#6B7280' },
  { name: 'Pants', value: 20, color: '#D1D5DB' },
  { name: 'Accessories', value: 15, color: '#E5E7EB' },
]

const recentOrders = [
  { id: 'ML-001', customer: 'Juan Pérez', product: 'Hoodie Oversize', total: '$2,450', status: 'Completado', avatar: 'JP' },
  { id: 'ML-002', customer: 'María García', product: 'Tee Gothic', total: '$1,200', status: 'En proceso', avatar: 'MG' },
  { id: 'ML-003', customer: 'Carlos López', product: 'Cargo Pants', total: '$890', status: 'Pendiente', avatar: 'CL' },
  { id: 'ML-004', customer: 'Ana Martínez', product: 'Jacket Bomber', total: '$3,100', status: 'Completado', avatar: 'AM' },
]

const stats = [
  {
    title: 'Total Sales',
    value: '$9,328.55',
    change: '+15.8%',
    subtext: 'this week',
    isPositive: true,
    icon: DollarSign,
  },
  {
    title: 'Visitors',
    value: '12,302',
    change: '+12.7%',
    subtext: 'Avg. time 4:30s',
    isPositive: true,
    icon: Eye,
  },
  {
    title: 'Refunds',
    value: '963',
    change: '-12.7%',
    subtext: '213 disputed',
    isPositive: false,
    icon: TrendingUp,
  },
]

export default function AdminDashboard() {
  const { data: session } = useSession()
  const userName = session?.user?.firstName || 'Admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Welcome back, {userName}</h1>
          <p className="text-[#6B7280] text-sm">Here&apos;s today&apos;s data from your online store!</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#111827]">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This month</option>
            <option>This year</option>
          </select>
          <Link
            href="/admin/products/new"
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-xl hover:bg-[#1F2937] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Nuevo</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white p-5 rounded-2xl border border-[#E5E7EB] hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-[#6B7280]">{stat.title}</span>
                  <div className={`flex items-center gap-0.5 text-xs ${stat.isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#111827]">{stat.value}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">{stat.subtext}</p>
              </div>
              <div className="p-2 bg-[#F3F4F6] rounded-xl">
                <stat.icon className="w-5 h-5 text-[#6B7280]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Performance */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#111827]">Sales Performance</h2>
              <p className="text-xs sm:text-sm text-[#6B7280]">Export data</p>
            </div>
            <select className="px-3 py-1.5 text-sm border border-[#E5E7EB] rounded-lg text-[#6B7280] w-full sm:w-auto">
              <option>Last 14 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[200px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#111827"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-[#111827]">Top Categories</h2>
            <button className="p-1 hover:bg-[#F3F4F6] rounded-lg">
              <MoreHorizontal className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
          <div className="h-[150px] sm:h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#111827]">$6.2k</p>
              <p className="text-xs text-[#6B7280]">Total Revenue</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-sm text-[#6B7280]">{category.name}</span>
                </div>
                <span className="text-sm font-medium text-[#111827]">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-[#111827]">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-3 sm:px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Order</th>
                <th className="px-3 sm:px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Customer</th>
                <th className="px-3 sm:px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden md:table-cell">Product</th>
                <th className="px-3 sm:px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Total</th>
                <th className="px-3 sm:px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-5 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm font-medium text-[#111827]">{order.id}</span>
                      <p className="text-xs text-[#9CA3AF] sm:hidden">{order.customer}</p>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F3F4F6] rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-[#6B7280]">{order.avatar}</span>
                      </div>
                      <span className="text-sm text-[#374151]">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                    <span className="text-sm text-[#6B7280]">{order.product}</span>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-[#111827]">{order.total}</span>
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap text-right hidden sm:table-cell">
                    <button className="p-1 hover:bg-[#F3F4F6] rounded-lg">
                      <MoreHorizontal className="w-5 h-5 text-[#6B7280]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Package, label: 'New Product', href: '/admin/products/new', color: '#111827' },
          { icon: ShoppingBag, label: 'View Orders', href: '/admin/orders', color: '#10B981' },
          { icon: Users, label: 'Customers', href: '/admin/customers', color: '#3B82F6' },
          { icon: TrendingUp, label: 'Analytics', href: '/admin/settings', color: '#F59E0B' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group p-4 bg-white border border-[#E5E7EB] rounded-2xl hover:shadow-lg transition-all flex items-center gap-3"
          >
            <div
              className="p-2.5 rounded-xl transition-all group-hover:scale-110"
              style={{ backgroundColor: `${action.color}10` }}
            >
              <action.icon className="w-5 h-5" style={{ color: action.color }} />
            </div>
            <span className="text-sm font-medium text-[#374151]">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    'Completado': { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
    'En proceso': { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
    'Pendiente': { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
    'Cancelado': { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]' },
  }

  const style = styles[status] || styles['Pendiente']

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {status}
    </span>
  )
}
