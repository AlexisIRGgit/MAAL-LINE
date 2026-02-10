'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Loader2,
  RefreshCw,
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

interface DashboardData {
  stats: {
    totalSales: {
      value: number
      change: number
      ordersCount: number
    }
    customers: {
      value: number
      newThisPeriod: number
    }
    refunds: {
      value: number
      change: number
    }
    averageOrderValue: number
  }
  salesChart: Array<{ name: string; ventas: number }>
  categoryData: Array<{ name: string; value: number; revenue: number; color: string }>
  recentOrders: Array<{
    id: string
    customer: string
    product: string
    total: string
    status: string
    avatar: string
  }>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const userName = session?.user?.firstName || 'Admin'

  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('7days')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDashboard = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const response = await fetch(`/api/dashboard?period=${period}`)
      if (!response.ok) throw new Error('Error fetching dashboard')

      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [period])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`
    }
    return `$${value.toFixed(2)}`
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  // Stats configuration
  const stats = data ? [
    {
      title: 'Total Ventas',
      value: formatCurrency(data.stats.totalSales.value),
      change: formatChange(data.stats.totalSales.change),
      subtext: `${data.stats.totalSales.ordersCount} pedidos`,
      isPositive: data.stats.totalSales.change >= 0,
      icon: DollarSign,
    },
    {
      title: 'Clientes',
      value: data.stats.customers.value.toLocaleString(),
      change: `+${data.stats.customers.newThisPeriod}`,
      subtext: 'nuevos este período',
      isPositive: true,
      icon: Users,
    },
    {
      title: 'Reembolsos',
      value: data.stats.refunds.value.toString(),
      change: formatChange(data.stats.refunds.change),
      subtext: 'este período',
      isPositive: data.stats.refunds.change <= 0,
      icon: RefreshCw,
    },
  ] : []

  // Calculate total category revenue
  const totalCategoryRevenue = data?.categoryData?.reduce((sum, cat) => sum + (cat.revenue || 0), 0) || 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#111827] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Bienvenido, {userName}</h1>
          <p className="text-[#6B7280] text-sm">Aquí están los datos de tu tienda online</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#111827] cursor-pointer"
          >
            <option value="7days">Últimos 7 días</option>
            <option value="30days">Últimos 30 días</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
          </select>
          <button
            onClick={() => fetchDashboard(true)}
            disabled={isRefreshing}
            className="p-2 bg-white border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 text-[#6B7280] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/products/new"
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded-xl hover:bg-[#1F2937] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Producto</span>
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
              <h2 className="text-base sm:text-lg font-semibold text-[#111827]">Rendimiento de Ventas</h2>
              <p className="text-xs sm:text-sm text-[#6B7280]">
                {data?.salesChart?.length || 0} puntos de datos
              </p>
            </div>
          </div>
          <div className="h-[200px] sm:h-[280px]">
            {data?.salesChart && data.salesChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.salesChart}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ventas']}
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
            ) : (
              <div className="flex items-center justify-center h-full text-[#9CA3AF]">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Sin datos de ventas</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-[#111827]">Top Categorías</h2>
          </div>
          <div className="h-[150px] sm:h-[180px]">
            {data?.categoryData && data.categoryData.length > 0 && data.categoryData[0].name !== 'Sin datos' ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#9CA3AF]">
                <div className="text-center">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sin datos</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#111827]">{formatCurrency(totalCategoryRevenue)}</p>
              <p className="text-xs text-[#6B7280]">Ingresos Totales</p>
            </div>
          </div>
          {data?.categoryData && data.categoryData[0]?.name !== 'Sin datos' && (
            <div className="mt-4 space-y-2">
              {data.categoryData.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-sm text-[#6B7280]">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium text-[#111827]">{category.value}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-[#111827]">Pedidos Recientes</h2>
          <Link href="/admin/orders" className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
            Ver todos →
          </Link>
        </div>
        {data?.recentOrders && data.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-3 sm:px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Pedido</th>
                  <th className="px-3 sm:px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">Cliente</th>
                  <th className="px-3 sm:px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider hidden md:table-cell">Producto</th>
                  <th className="px-3 sm:px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Total</th>
                  <th className="px-3 sm:px-5 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {data.recentOrders.map((order) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-[#9CA3AF]">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay pedidos recientes</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Package, label: 'Nuevo Producto', href: '/admin/products/new', color: '#111827' },
          { icon: ShoppingBag, label: 'Ver Pedidos', href: '/admin/orders', color: '#10B981' },
          { icon: Users, label: 'Clientes', href: '/admin/customers', color: '#3B82F6' },
          { icon: TrendingUp, label: 'Descuentos', href: '/admin/discounts', color: '#F59E0B' },
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
    'Entregado': { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
    'Completado': { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
    'En proceso': { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
    'Procesando': { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
    'Confirmado': { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
    'Enviado': { bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]' },
    'Pendiente': { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
    'Cancelado': { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]' },
    'Reembolsado': { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]' },
  }

  const style = styles[status] || styles['Pendiente']

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {status}
    </span>
  )
}
