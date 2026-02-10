'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Save,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Check,
  Loader2,
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [saved, setSaved] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    firstName: session?.user?.firstName || '',
    lastName: session?.user?.lastName || '',
    email: session?.user?.email || '',
    phone: '',
    birthDate: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
  })

  const handleSaveProfile = async () => {
    setIsLoading(true)
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const userInitial = formData.firstName?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || 'U'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Mi Perfil</h1>
        <p className="text-[#6B7280] text-sm mt-1">Gestiona tu información personal y preferencias</p>
      </motion.div>

      {/* Profile Photo Section */}
      <motion.div variants={itemVariants} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#111827] to-[#374151] rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
              {userInitial}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-[#111827] text-white rounded-full hover:bg-[#1F2937] transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-[#111827]">
              {formData.firstName || 'Usuario'} {formData.lastName}
            </h2>
            <p className="text-sm text-[#6B7280]">{formData.email}</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Miembro desde Enero 2024</p>
          </div>
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div variants={itemVariants} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6">
        <h3 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#6B7280]" />
          Información Personal
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Nombre</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Apellido</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
              placeholder="Tu apellido"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                placeholder="+52 55 1234 5678"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[#374151] mb-2">Fecha de nacimiento</label>
            <div className="relative max-w-xs">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-[#E5E7EB]">
          <button
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </motion.div>

      {/* Security Section */}
      <motion.div variants={itemVariants} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6">
        <h3 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#6B7280]" />
          Seguridad
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Contraseña actual</label>
            <div className="relative max-w-md">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 pr-10 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 pr-10 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Confirmar contraseña</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <p className="text-xs text-[#6B7280]">
            La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
          </p>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-[#E5E7EB]">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors">
            <Shield className="w-4 h-4" />
            Cambiar contraseña
          </button>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div variants={itemVariants} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-6">
        <h3 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#6B7280]" />
          Notificaciones
        </h3>

        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Notificaciones por email', description: 'Recibe actualizaciones en tu correo' },
            { key: 'smsNotifications', label: 'Notificaciones SMS', description: 'Recibe mensajes de texto' },
            { key: 'orderUpdates', label: 'Actualizaciones de pedidos', description: 'Estado de envío y entrega' },
            { key: 'promotions', label: 'Promociones y ofertas', description: 'Descuentos exclusivos y novedades' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 sm:p-4 bg-[#F9FAFB] rounded-xl">
              <div>
                <p className="text-sm font-medium text-[#111827]">{item.label}</p>
                <p className="text-xs text-[#6B7280]">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences[item.key as keyof typeof preferences]}
                  onChange={(e) =>
                    setPreferences({ ...preferences, [item.key]: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-10 sm:w-11 h-5 sm:h-6 bg-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-[#D1D5DB] after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-[#111827]"></div>
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants} className="bg-white border border-red-200 rounded-2xl p-4 sm:p-6">
        <h3 className="text-base font-semibold text-red-600 mb-2">Zona de peligro</h3>
        <p className="text-sm text-[#6B7280] mb-4">
          Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, estás seguro.
        </p>
        <button className="px-4 py-2.5 border border-red-300 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors">
          Eliminar mi cuenta
        </button>
      </motion.div>
    </motion.div>
  )
}
