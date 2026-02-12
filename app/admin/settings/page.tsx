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
  Key,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { usePermissions } from '@/hooks/use-permissions'
import { ROLE_INFO } from '@/lib/permissions'

const tabs = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'team', label: 'Equipo', icon: Users },
  { id: 'apis', label: 'APIs', icon: Key },
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
        {activeTab === 'apis' && <ApisSettings />}
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

function ApisSettings() {
  const [googleClientId, setGoogleClientId] = useState('')
  const [googleClientSecret, setGoogleClientSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testingGoogle, setTestingGoogle] = useState(false)
  const [googleStatus, setGoogleStatus] = useState<'unknown' | 'configured' | 'not_configured'>('unknown')

  // Check if Google is configured on mount
  useState(() => {
    // This would normally check from an API, for now we check env vars existence
    const hasGoogle = process.env.NEXT_PUBLIC_GOOGLE_CONFIGURED === 'true'
    setGoogleStatus(hasGoogle ? 'configured' : 'not_configured')
  })

  const handleSaveGoogle = async () => {
    if (!googleClientId || !googleClientSecret) return
    setSaving(true)
    // In a real implementation, this would save to a secure storage/env
    // For now, we'll show a message about updating .env
    setTimeout(() => {
      setSaving(false)
      alert('Para aplicar los cambios, agrega las siguientes variables a tu archivo .env:\n\nGOOGLE_CLIENT_ID=' + googleClientId + '\nGOOGLE_CLIENT_SECRET=' + googleClientSecret + '\n\nLuego reinicia el servidor.')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#111827]">Integraciones de API</h2>
        <p className="text-sm text-[#6B7280] mt-1">Configura las credenciales de servicios externos</p>
      </div>

      {/* Google OAuth */}
      <div className="p-4 sm:p-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl border border-[#E5E7EB]">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-[#111827]">Google OAuth</h3>
              {googleStatus === 'configured' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Configurado
                </span>
              )}
              {googleStatus === 'not_configured' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  No configurado
                </span>
              )}
            </div>
            <p className="text-sm text-[#6B7280] mb-4">Permite a los usuarios iniciar sesión con su cuenta de Google</p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Client ID</label>
                <input
                  type="text"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  placeholder="xxxxxxxxxx.apps.googleusercontent.com"
                  className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1.5">Client Secret</label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={googleClientSecret}
                    onChange={(e) => setGoogleClientSecret(e.target.value)}
                    placeholder="GOCSPX-xxxxxxxxxx"
                    className="w-full px-4 py-2.5 pr-20 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] hover:text-[#111827]"
                  >
                    {showSecret ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={handleSaveGoogle}
                disabled={saving || !googleClientId || !googleClientSecret}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar credenciales
                  </>
                )}
              </button>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ir a Google Cloud Console
              </a>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-800 font-medium mb-2">Instrucciones:</p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Ve a Google Cloud Console y crea un proyecto</li>
                <li>Habilita la API de Google+ o Google Identity</li>
                <li>Crea credenciales OAuth 2.0</li>
                <li>Agrega como URI de redirección: <code className="bg-blue-100 px-1 rounded">https://tudominio.com/api/auth/callback/google</code></li>
                <li>Copia el Client ID y Client Secret aquí</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Future APIs placeholder */}
      <div className="p-4 sm:p-6 bg-[#F9FAFB] border border-dashed border-[#D1D5DB] rounded-2xl">
        <div className="text-center py-4">
          <Key className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
          <p className="text-sm text-[#6B7280]">Más integraciones próximamente</p>
          <p className="text-xs text-[#9CA3AF] mt-1">Stripe, PayPal, Facebook, etc.</p>
        </div>
      </div>
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
