'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Store,
  Mail,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Palette,
  Globe,
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
      className="space-y-3"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl font-bold text-[#E8E4D9]">Configuración</h1>
        <p className="text-[#666] mt-1">Administra la configuración de tu tienda</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#C9A962] text-[#0a0a0a] font-semibold'
                : 'bg-[#0a0a0a] border border-[#1a1a1a] text-[#888] hover:text-[#E8E4D9] hover:border-[#222]'
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
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-3"
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
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[#E8E4D9] mb-2">Información de la Tienda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1">Nombre de la tienda</label>
            <input
              type="text"
              defaultValue="MAAL LINE"
              className="w-full px-3 py-2 bg-[#111] border border-[#222] rounded-xl text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1">Email de contacto</label>
            <input
              type="email"
              defaultValue="hola@maalline.com"
              className="w-full px-3 py-2 bg-[#111] border border-[#222] rounded-xl text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1">Teléfono</label>
            <input
              type="tel"
              defaultValue="+52 55 1234 5678"
              className="w-full px-3 py-2 bg-[#111] border border-[#222] rounded-xl text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#888] mb-1">Moneda</label>
            <select className="w-full px-3 py-2 bg-[#111] border border-[#222] rounded-xl text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]">
              <option value="MXN">MXN - Peso Mexicano</option>
              <option value="USD">USD - Dólar Americano</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[#E8E4D9] mb-2">Logo</h2>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-[#111] border border-[#222] rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6 text-[#444]" />
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#111] border border-[#222] rounded-xl text-xs text-[#E8E4D9] hover:border-[#C9A962] transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Cambiar logo
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962] text-[#0a0a0a] text-xs font-semibold rounded-xl hover:bg-[#d4b76d] transition-colors">
          <Save className="w-3.5 h-3.5" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function PaymentSettings() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-[#E8E4D9]">Métodos de Pago</h2>

      <div className="space-y-2">
        {[
          { name: 'Stripe', description: 'Tarjetas de crédito y débito', enabled: true },
          { name: 'PayPal', description: 'Pagos con PayPal', enabled: false },
          { name: 'Conekta', description: 'OXXO Pay y tarjetas', enabled: true },
          { name: 'MercadoPago', description: 'Pagos en México', enabled: false },
        ].map((method) => (
          <div key={method.name} className="flex items-center justify-between p-2 bg-[#111] rounded-xl">
            <div>
              <p className="text-[#E8E4D9] text-xs font-medium">{method.name}</p>
              <p className="text-[#666] text-xs">{method.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#666] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A962] peer-checked:after:bg-[#0a0a0a]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962] text-[#0a0a0a] text-xs font-semibold rounded-xl hover:bg-[#d4b76d] transition-colors">
          <Save className="w-3.5 h-3.5" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function ShippingSettings() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-[#E8E4D9]">Configuración de Envíos</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#888] mb-1">Costo de envío estándar</label>
          <input
            type="text"
            defaultValue="$99"
            className="w-full px-3 py-2 bg-[#111] border border-[#222] rounded-xl text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#888] mb-1">Envío gratis desde</label>
          <input
            type="text"
            defaultValue="$999"
            className="w-full px-3 py-2 bg-[#111] border border-[#222] rounded-xl text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-medium text-[#E8E4D9]">Carriers</h3>
        {[
          { name: 'DHL Express', enabled: true },
          { name: 'FedEx', enabled: true },
          { name: 'Estafeta', enabled: false },
        ].map((carrier) => (
          <div key={carrier.name} className="flex items-center justify-between p-2 bg-[#111] rounded-xl">
            <span className="text-[#E8E4D9] text-xs">{carrier.name}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={carrier.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#666] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A962] peer-checked:after:bg-[#0a0a0a]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962] text-[#0a0a0a] text-xs font-semibold rounded-xl hover:bg-[#d4b76d] transition-colors">
          <Save className="w-3.5 h-3.5" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-[#E8E4D9]">Notificaciones por Email</h2>

      <div className="space-y-2">
        {[
          { name: 'Nuevo pedido', description: 'Recibe un email cuando hay un nuevo pedido', enabled: true },
          { name: 'Pedido enviado', description: 'Notificar al cliente cuando se envía', enabled: true },
          { name: 'Stock bajo', description: 'Alerta cuando un producto tiene poco stock', enabled: true },
          { name: 'Nueva cuenta', description: 'Email de bienvenida a nuevos clientes', enabled: true },
          { name: 'Carrito abandonado', description: 'Recordatorio de carrito abandonado', enabled: false },
        ].map((notification) => (
          <div key={notification.name} className="flex items-center justify-between p-2 bg-[#111] rounded-xl">
            <div>
              <p className="text-[#E8E4D9] text-xs font-medium">{notification.name}</p>
              <p className="text-[#666] text-xs">{notification.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={notification.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#666] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A962] peer-checked:after:bg-[#0a0a0a]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962] text-[#0a0a0a] text-xs font-semibold rounded-xl hover:bg-[#d4b76d] transition-colors">
          <Save className="w-3.5 h-3.5" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-[#E8E4D9]">Seguridad</h2>

      <div className="space-y-2">
        <div className="p-2 bg-[#111] rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[#E8E4D9] text-xs font-medium">Autenticación de dos factores</p>
              <p className="text-[#666] text-xs">Añade una capa extra de seguridad</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-[#222] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#666] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A962] peer-checked:after:bg-[#0a0a0a]"></div>
            </label>
          </div>
        </div>

        <div className="p-2 bg-[#111] rounded-xl">
          <p className="text-[#E8E4D9] text-xs font-medium mb-2">Cambiar contraseña</p>
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Contraseña actual"
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#222] rounded-xl text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#222] rounded-xl text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#222] rounded-xl text-xs text-[#E8E4D9] focus:outline-none focus:border-[#C9A962]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A962] text-[#0a0a0a] text-xs font-semibold rounded-xl hover:bg-[#d4b76d] transition-colors">
          <Save className="w-3.5 h-3.5" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}
