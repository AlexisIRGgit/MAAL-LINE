'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Store,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Save,
  Upload,
} from 'lucide-react'

const tabs = [
  { id: 'general', label: 'General', icon: Store },
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
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm ${
              activeTab === tab.id
                ? 'bg-[#111827] text-white font-semibold'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#D1D5DB]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm"
      >
        {activeTab === 'general' && <GeneralSettings />}
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
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#111827] mb-4">Información de la Tienda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <h2 className="text-base font-semibold text-[#111827] mb-4">Logo</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl flex items-center justify-center">
            <Store className="w-8 h-8 text-[#9CA3AF]" />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
            <Upload className="w-4 h-4" />
            Cambiar logo
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function PaymentSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-[#111827]">Métodos de Pago</h2>

      <div className="space-y-3">
        {[
          { name: 'Stripe', description: 'Tarjetas de crédito y débito', enabled: true },
          { name: 'PayPal', description: 'Pagos con PayPal', enabled: false },
          { name: 'Conekta', description: 'OXXO Pay y tarjetas', enabled: true },
          { name: 'MercadoPago', description: 'Pagos en México', enabled: false },
        ].map((method) => (
          <div key={method.name} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl">
            <div>
              <p className="text-[#111827] text-sm font-medium">{method.name}</p>
              <p className="text-[#6B7280] text-sm">{method.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-[#D1D5DB] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111827]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function ShippingSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-[#111827]">Configuración de Envíos</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Costo de envío estándar</label>
          <input
            type="text"
            defaultValue="$99"
            className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Envío gratis desde</label>
          <input
            type="text"
            defaultValue="$999"
            className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[#111827]">Carriers</h3>
        {[
          { name: 'DHL Express', enabled: true },
          { name: 'FedEx', enabled: true },
          { name: 'Estafeta', enabled: false },
        ].map((carrier) => (
          <div key={carrier.name} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl">
            <span className="text-[#111827] text-sm font-medium">{carrier.name}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={carrier.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-[#D1D5DB] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111827]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-[#111827]">Notificaciones por Email</h2>

      <div className="space-y-3">
        {[
          { name: 'Nuevo pedido', description: 'Recibe un email cuando hay un nuevo pedido', enabled: true },
          { name: 'Pedido enviado', description: 'Notificar al cliente cuando se envía', enabled: true },
          { name: 'Stock bajo', description: 'Alerta cuando un producto tiene poco stock', enabled: true },
          { name: 'Nueva cuenta', description: 'Email de bienvenida a nuevos clientes', enabled: true },
          { name: 'Carrito abandonado', description: 'Recordatorio de carrito abandonado', enabled: false },
        ].map((notification) => (
          <div key={notification.name} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl">
            <div>
              <p className="text-[#111827] text-sm font-medium">{notification.name}</p>
              <p className="text-[#6B7280] text-sm">{notification.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={notification.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-[#D1D5DB] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111827]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-base font-semibold text-[#111827]">Seguridad</h2>

      <div className="space-y-4">
        <div className="p-4 bg-[#F9FAFB] rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#111827] text-sm font-medium">Autenticación de dos factores</p>
              <p className="text-[#6B7280] text-sm">Añade una capa extra de seguridad</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-[#D1D5DB] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111827]"></div>
            </label>
          </div>
        </div>

        <div className="p-4 bg-[#F9FAFB] rounded-xl">
          <p className="text-[#111827] text-sm font-medium mb-4">Cambiar contraseña</p>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Contraseña actual"
              className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}
