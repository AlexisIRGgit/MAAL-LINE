'use client'

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
import { TrendingUp, Package } from 'lucide-react'

interface SalesChartProps {
  data: Array<{ name: string; ventas: number }>
}

export function SalesChart({ data }: SalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#9CA3AF]">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Sin datos de ventas</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#111827" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
        <YAxis
          stroke="#9CA3AF"
          fontSize={12}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
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
  )
}

interface CategoryChartProps {
  data: Array<{ name: string; value: number; revenue: number; color: string }>
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (!data || data.length === 0 || data[0]?.name === 'Sin datos') {
    return (
      <div className="flex items-center justify-center h-full text-[#9CA3AF]">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Sin datos</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={70}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
