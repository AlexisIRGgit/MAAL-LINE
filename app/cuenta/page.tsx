'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Package,
  MapPin,
  Heart,
  ChevronRight,
  ShoppingBag,
  Loader2,
  ArrowUpRight,
  Copy,
  Eye,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { toast } from '@/lib/toast'
import { getOrderStatus, toneStyles, type StatusTone } from '@/components/account/order-status'
import { walletSurface, walletToneTile, WalletDecor, trackSpotlight } from '@/components/account/wallet-surface'
import { SwipeableRow, type SwipeAction, type SwipeSide } from '@/components/account/swipeable-list'

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
  const [openRow, setOpenRow] = useState<{ id: string; side: SwipeSide } | null>(null)
  const [statusLine, setStatusLine] = useState<string | null>(null)
  const router = useRouter()
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

  const getActionConfig = (type: string): { href: string; label: string; icon: typeof Package; tone: StatusTone } => {
    switch (type) {
      case 'orders':
        return { href: '/cuenta/pedidos', label: 'Mis Pedidos', icon: Package, tone: 'blue' }
      case 'addresses':
        return { href: '/cuenta/direcciones', label: 'Direcciones', icon: MapPin, tone: 'green' }
      case 'wishlist':
        return { href: '/wishlist', label: 'Lista de Deseos', icon: Heart, tone: 'red' }
      default:
        return { href: '/', label: type, icon: Package, tone: 'neutral' }
    }
  }

  const copyOrderId = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId)
      setStatusLine(`Copiado ${orderId}`)
      toast.success('Número de pedido copiado')
    } catch {
      toast.error('No se pudo copiar')
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
              onMouseMove={trackSpotlight}
              className={cn(
                walletSurface,
                'group block rounded-[20px] p-4 transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3D00]/60'
              )}
            >
              <WalletDecor />
              <div className="relative flex items-start justify-between mb-3">
                <div className={cn('h-10 w-10 flex items-center justify-center rounded-xl border', walletToneTile[config.tone])}>
                  <config.icon className="w-5 h-5" />
                </div>
                {action.count > 0 && (
                  <span className="min-w-[24px] px-1.5 py-0.5 text-center rounded-full bg-white/10 ring-1 ring-white/10 text-xs font-mono font-semibold tabular-nums">
                    {action.count}
                  </span>
                )}
              </div>
              <div className="relative flex items-center justify-between gap-2">
                <p className="font-display font-semibold text-sm truncate">{config.label}</p>
                <ArrowUpRight className="w-4 h-4 flex-shrink-0 text-white/30 transition-all duration-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          )
        })}
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        variants={itemVariants}
        className="rounded-[2rem] border border-[#E5E7EB] bg-[#F9FAFB] p-3 shadow-sm dark:shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 px-2 pt-1 pb-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#111827]">Pedidos Recientes</h2>
            <p className="text-xs text-[#6B7280] truncate">
              {statusLine ?? (recentOrders.length > 0 ? 'Desliza un pedido para ver acciones' : 'Tus últimos pedidos')}
            </p>
          </div>
          <Link
            href="/cuenta/pedidos"
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#111827] hover:bg-white transition-colors"
          >
            Ver todos
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentOrders.map((order) => {
              const orderHref = `/cuenta/pedidos?pedido=${encodeURIComponent(order.id)}`
              const status = getOrderStatus(order.status)
              const rightActions: SwipeAction[] = [
                { id: 'copy', label: 'Copiar número', icon: Copy, tone: 'neutral', onAction: () => copyOrderId(order.id) },
                { id: 'view', label: 'Ver pedido', icon: Eye, tone: 'primary', onAction: () => router.push(orderHref) },
              ]
              const leftActions: SwipeAction[] =
                order.status === 'shipped'
                  ? [{ id: 'track', label: 'Rastrear envío', icon: Truck, tone: 'success', onAction: () => router.push(orderHref) }]
                  : []

              return (
                <SwipeableRow
                  key={order.id}
                  label={`Pedido ${order.id}`}
                  openSide={openRow?.id === order.id ? openRow.side : null}
                  onOpenChange={(side) => setOpenRow(side ? { id: order.id, side } : null)}
                  leftActions={leftActions}
                  rightActions={rightActions}
                  onSelect={() => router.push(orderHref)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]">
                      <status.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111827] truncate">{order.id}</p>
                      <p className="text-xs text-[#6B7280] truncate">
                        <span className={toneStyles[status.tone].text}>{status.label}</span>
                        {' · '}
                        {order.items} {order.items === 1 ? 'artículo' : 'artículos'} · {order.date}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-medium tabular-nums text-[#6B7280]">
                      ${order.total.toLocaleString()}
                    </span>
                  </div>
                </SwipeableRow>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
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

        {recentOrders.length > 0 && (
          <div className="flex items-center justify-between px-2 pt-3 pb-1 text-xs text-[#6B7280]">
            <span>
              {recentOrders.length} {recentOrders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
            <span>Último: {recentOrders[0].date}</span>
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
              <div className={cn('p-2 rounded-lg', toneStyles.green.tile)}>
                <MapPin className="w-4 h-4" />
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
              <div className={cn('p-2 rounded-lg', toneStyles.neutral.tile)}>
                <MapPin className="w-4 h-4" />
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
        className="bg-gradient-to-r from-[#111827] to-[#374151] dark:from-[#1C1F26] dark:via-[#13151A] dark:to-[#0E0F13] dark:ring-1 dark:ring-white/10 rounded-2xl p-5 sm:p-6 text-white"
      >
        <h3 className="font-semibold text-lg mb-1">¿Necesitas ayuda?</h3>
        <p className="text-white/70 text-sm mb-4">
          Nuestro equipo está disponible 24/7 para ayudarte con cualquier duda.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/contacto"
            className="px-4 py-2 bg-white text-[#111827] dark:bg-[#F5F5F5] dark:text-[#0A0A0A] dark:hover:bg-white text-sm font-semibold rounded-xl hover:bg-[#F3F4F6] transition-colors"
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
