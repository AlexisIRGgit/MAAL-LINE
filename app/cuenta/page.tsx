'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Package,
  MapPin,
  Heart,
  ChevronRight,
  Clock,
  Truck,
  CheckCircle,
  ShoppingBag,
  Loader2,
} from 'lucide-react'

interface RecentOrder {
  id: string
  date: string
  status: string
  total: number
  items: number
  image: string | null
}

interface QuickAction {
  type: string
  count: number
}

interface DefaultAddress {
  id: string
  label: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface SummaryData {
  recentOrders: RecentOrder[]
  quickActions: QuickAction[]
  defaultAddress: DefaultAddress | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AccountPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const userName = session?.user?.firstName || session?.user?.name?.split(' ')[0] || 'Usuario'

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/account/summary')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Error fetching summary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'processing':
        return { label: 'En proceso', icon: Clock, color: 'text-amber-600 bg-amber-50' }
      case 'shipped':
        return { label: 'En camino', icon: Truck, color: 'text-blue-600 bg-blue-50' }
      case 'delivered':
        return { label: 'Entregado', icon: CheckCircle, color: 'text-green-600 bg-green-50' }
      default:
        return { label: status, icon: Package, color: 'text-gray-600 bg-gray-50' }
    }
  }

  const getActionConfig = (type: string) => {
    switch (type) {
      case 'orders':
        return { href: '/cuenta/pedidos', label: 'Mis Pedidos', icon: Package, color: 'bg-blue-50 text-blue-600' }
      case 'addresses':
        return { href: '/cuenta/direcciones', label: 'Direcciones', icon: MapPin, color: 'bg-green-50 text-green-600' }
      case 'wishlist':
        return { href: '/wishlist', label: 'Lista de Deseos', icon: Heart, color: 'bg-red-50 text-red-600' }
      default:
        return { href: '/', label: type, icon: Package, color: 'bg-gray-50 text-gray-600' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B7280]" />
      </div>
    )
  }

  const recentOrders = data?.recentOrders || []
  const quickActions = data?.quickActions || []
  const defaultAddress = data?.defaultAddress

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
          Hola, {userName}
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Bienvenido a tu cuenta. Aquí puedes gestionar tus pedidos y preferencias.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {quickActions.map((action) => {
          const config = getActionConfig(action.type)
          return (
            <Link
              key={action.type}
              href={config.href}
              className="group bg-white border border-[#E5E7EB] rounded-2xl p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${config.color}`}>
                  <config.icon className="w-5 h-5" />
                </div>
                {action.count > 0 && (
                  <span className="px-2 py-0.5 bg-[#111827] text-white text-xs font-bold rounded-full">
                    {action.count}
                  </span>
                )}
              </div>
              <p className="font-semibold text-[#111827] text-sm group-hover:text-[#374151] transition-colors">
                {config.label}
              </p>
            </Link>
          )
        })}
      </motion.div>

      {/* Recent Orders */}
      <motion.div variants={itemVariants} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#111827]">Pedidos Recientes</h2>
            <p className="text-xs sm:text-sm text-[#6B7280]">Tus últimos pedidos</p>
          </div>
          <Link
            href="/cuenta/pedidos"
            className="text-sm text-[#6B7280] hover:text-[#111827] flex items-center gap-1 transition-colors"
          >
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-[#E5E7EB]">
            {recentOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              return (
                <Link
                  key={order.id}
                  href={`/cuenta/pedidos/${order.id}`}
                  className="flex items-center gap-4 p-4 sm:p-5 hover:bg-[#F9FAFB] transition-colors"
                >
                  {/* Order Image */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F3F4F6] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {order.image ? (
                      <img
                        src={order.image}
                        alt={`Pedido ${order.id}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-[#9CA3AF]" />
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#111827] text-sm">{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <statusInfo.icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{statusInfo.label}</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
                      {order.items} {order.items === 1 ? 'artículo' : 'artículos'} • {order.date}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[#111827] text-sm sm:text-base">
                      ${order.total.toLocaleString()}
                    </p>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF] ml-auto mt-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280] font-medium">No tienes pedidos aún</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Cuando hagas tu primer pedido, aparecerá aquí</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Explorar productos
            </Link>
          </div>
        )}
      </motion.div>

      {/* Default Address Card */}
      <motion.div variants={itemVariants}>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#111827] text-sm">Dirección Principal</h3>
            <Link href="/cuenta/direcciones" className="text-xs text-[#6B7280] hover:text-[#111827]">
              {defaultAddress ? 'Editar' : 'Agregar'}
            </Link>
          </div>
          {defaultAddress ? (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-sm">
                <p className="text-[#111827] font-medium">{defaultAddress.label}</p>
                <p className="text-[#6B7280] text-xs mt-0.5">
                  {defaultAddress.street}<br />
                  {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-sm">
                <p className="text-[#6B7280]">No tienes una dirección principal</p>
                <Link
                  href="/cuenta/direcciones"
                  className="text-[#111827] font-medium text-xs hover:underline"
                >
                  Agregar dirección
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Help Banner */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-[#111827] to-[#374151] rounded-2xl p-5 sm:p-6 text-white"
      >
        <h3 className="font-semibold text-lg mb-1">¿Necesitas ayuda?</h3>
        <p className="text-white/70 text-sm mb-4">
          Nuestro equipo está disponible 24/7 para ayudarte con cualquier duda.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/contacto"
            className="px-4 py-2 bg-white text-[#111827] text-sm font-semibold rounded-xl hover:bg-[#F3F4F6] transition-colors"
          >
            Contactar soporte
          </Link>
          <Link
            href="/faq"
            className="px-4 py-2 bg-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors"
          >
            Ver FAQ
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
