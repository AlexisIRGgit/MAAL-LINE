'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Store,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Save,
  Upload,
  Users,
  UserPlus,
  Crown,
  UserCog,
  Eye,
  ChevronRight,
} from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'
import { ROLE_INFO } from '@/lib/permissions'

const tabs = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'team', label: 'Equipo', icon: Users },
  { id: 'payments', label: 'Pagos', icon: CreditCard },
  { id: 'shipping', label: 'Envíos', icon: Truck },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'security', label: 'Seguridad', icon: Shield },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-[#111827]">Configuración</h1>
        <p className="text-[#6B7280] mt-1 text-sm">Administra la configuración de tu tienda</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl whitespace-nowrap transition-all text-xs sm:text-sm ${
              activeTab === tab.id
                ? 'bg-[#111827] text-white font-semibold'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#D1D5DB]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-6 shadow-sm"
      >
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'team' && <TeamSettings />}
        {activeTab === 'payments' && <PaymentSettings />}
        {activeTab === 'shipping' && <ShippingSettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'security' && <SecuritySettings />}
      </motion.div>
    </motion.div>
  )
}

function GeneralSettings() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-sm sm:text-base font-semibold text-[#111827] mb-3 sm:mb-4">Información de la Tienda</h2>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Nombre de la tienda</label>
            <input
              type="text"
              defaultValue="MAAL LINE"
              className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Email de contacto</label>
            <input
              type="email"
              defaultValue="hola@maalline.com"
              className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Teléfono</label>
            <input
              type="tel"
              defaultValue="+52 55 1234 5678"
              className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Moneda</label>
            <select className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all">
              <option value="MXN">MXN - Peso Mexicano</option>
              <option value="USD">USD - Dólar Americano</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm sm:text-base font-semibold text-[#111827] mb-3 sm:mb-4">Logo</h2>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl flex items-center justify-center flex-shrink-0">
            <Store className="w-6 sm:w-8 h-6 sm:h-8 text-[#9CA3AF]" />
          </div>
          <button className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            <Upload className="w-4 h-4" />
            Cambiar logo
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function TeamSettings() {
  const { canCreateUsers, canViewUsers } = usePermissions()

  const roles = [
    { key: 'owner', icon: Crown, color: 'text-red-500 bg-red-50' },
    { key: 'admin', icon: Shield, color: 'text-purple-500 bg-purple-50' },
    { key: 'manager', icon: UserCog, color: 'text-amber-500 bg-amber-50' },
    { key: 'employee', icon: Users, color: 'text-green-500 bg-green-50' },
    { key: 'viewer', icon: Eye, color: 'text-blue-500 bg-blue-50' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">Gestión del Equipo</h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">Administra los usuarios que tienen acceso al panel</p>
        </div>
        {canCreateUsers && (
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            Administrar Usuarios
          </Link>
        )}
      </div>

      {/* Quick Access Card */}
      <Link
        href="/admin/users"
        className="block p-4 sm:p-6 bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-2xl text-white hover:from-[#1F2937] hover:to-[#374151] transition-all group"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-white/10 rounded-xl">
              <Users className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg">Panel de Usuarios</h3>
              <p className="text-white/70 text-xs sm:text-sm">Crear, editar y eliminar miembros</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </Link>

      {/* Roles Explanation */}
      <div>
        <h3 className="text-sm font-semibold text-[#111827] mb-3">Roles Disponibles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {roles.map(({ key, icon: Icon, color }) => {
            const info = ROLE_INFO[key as keyof typeof ROLE_INFO]
            return (
              <div key={key} className="p-3 sm:p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${color}`}>
                    <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  </div>
                  <span className="font-semibold text-[#111827] text-xs sm:text-sm">{info.label}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-[#6B7280] line-clamp-2">{info.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Permissions Info */}
      <div className="p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <h3 className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">Acerca de los permisos</h3>
        <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
          <li>• <strong>Dueño:</strong> Acceso total</li>
          <li>• <strong>Admin:</strong> Gestión completa, crear usuarios</li>
          <li>• <strong>Gerente:</strong> Productos, pedidos y clientes</li>
          <li>• <strong>Empleado:</strong> Pedidos e inventario</li>
          <li>• <strong>Visor:</strong> Solo lectura</li>
        </ul>
      </div>

      {!canViewUsers && (
        <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs sm:text-sm text-amber-800">
            <strong>Nota:</strong> No tienes permisos para gestionar usuarios.
          </p>
        </div>
      )}
    </div>
  )
}

function PaymentSettings() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-sm sm:text-base font-semibold text-[#111827]">Métodos de Pago</h2>

      <div className="space-y-2 sm:space-y-3">
        {[
          { name: 'Stripe', description: 'Tarjetas de crédito y débito', enabled: true },
          { name: 'PayPal', description: 'Pagos con PayPal', enabled: false },
          { name: 'Conekta', description: 'OXXO Pay y tarjetas', enabled: true },
          { name: 'MercadoPago', description: 'Pagos en México', enabled: false },
        ].map((method) => (
          <div key={method.name} className="flex items-center justify-between p-3 sm:p-4 bg-[#F9FAFB] rounded-xl gap-3">
            <div className="min-w-0">
              <p className="text-[#111827] text-xs sm:text-sm font-medium">{method.name}</p>
              <p className="text-[#6B7280] text-xs sm:text-sm truncate">{method.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
              <div className="w-10 sm:w-11 h-5 sm:h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-[#D1D5DB] after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-[#111827]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function ShippingSettings() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-sm sm:text-base font-semibold text-[#111827]">Configuración de Envíos</h2>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">Costo de envío estándar</label>
          <input
            type="text"
            defaultValue="$99"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-2">Envío gratis desde</label>
          <input
            type="text"
            defaultValue="$999"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-xs sm:text-sm font-medium text-[#111827]">Carriers</h3>
        {[
          { name: 'DHL Express', enabled: true },
          { name: 'FedEx', enabled: true },
          { name: 'Estafeta', enabled: false },
        ].map((carrier) => (
          <div key={carrier.name} className="flex items-center justify-between p-3 sm:p-4 bg-[#F9FAFB] rounded-xl">
            <span className="text-[#111827] text-xs sm:text-sm font-medium">{carrier.name}</span>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" defaultChecked={carrier.enabled} className="sr-only peer" />
              <div className="w-10 sm:w-11 h-5 sm:h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-[#D1D5DB] after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-[#111827]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-sm sm:text-base font-semibold text-[#111827]">Notificaciones por Email</h2>

      <div className="space-y-2 sm:space-y-3">
        {[
          { name: 'Nuevo pedido', description: 'Recibe un email cuando hay un nuevo pedido', enabled: true },
          { name: 'Pedido enviado', description: 'Notificar al cliente cuando se envía', enabled: true },
          { name: 'Stock bajo', description: 'Alerta cuando un producto tiene poco stock', enabled: true },
          { name: 'Nueva cuenta', description: 'Email de bienvenida a nuevos clientes', enabled: true },
          { name: 'Carrito abandonado', description: 'Recordatorio de carrito abandonado', enabled: false },
        ].map((notification) => (
          <div key={notification.name} className="flex items-center justify-between p-3 sm:p-4 bg-[#F9FAFB] rounded-xl gap-3">
            <div className="min-w-0">
              <p className="text-[#111827] text-xs sm:text-sm font-medium">{notification.name}</p>
              <p className="text-[#6B7280] text-[10px] sm:text-sm truncate">{notification.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" defaultChecked={notification.enabled} className="sr-only peer" />
              <div className="w-10 sm:w-11 h-5 sm:h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-[#D1D5DB] after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-[#111827]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-sm sm:text-base font-semibold text-[#111827]">Seguridad</h2>

      <div className="space-y-3 sm:space-y-4">
        <div className="p-3 sm:p-4 bg-[#F9FAFB] rounded-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[#111827] text-xs sm:text-sm font-medium">Autenticación de dos factores</p>
              <p className="text-[#6B7280] text-[10px] sm:text-sm">Añade una capa extra de seguridad</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-10 sm:w-11 h-5 sm:h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-[#D1D5DB] after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-[#111827]"></div>
            </label>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-[#F9FAFB] rounded-xl">
          <p className="text-[#111827] text-xs sm:text-sm font-medium mb-3 sm:mb-4">Cambiar contraseña</p>
          <div className="space-y-2 sm:space-y-3">
            <input
              type="password"
              placeholder="Contraseña actual"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}
