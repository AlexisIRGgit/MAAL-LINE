'use client'

import { useState } from 'react'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { ROLE_INFO } from '@/lib/permissions'
import { toast } from '@/lib/toast'

interface TeamMember {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: string
  status: string
  employeeDetails: {
    department: string | null
    position: string | null
  } | null
}

interface UserFormProps {
  user?: TeamMember | null
  onSuccess: () => void
  onCancel: () => void
}

const AVAILABLE_ROLES = ['viewer', 'employee', 'manager', 'admin'] as const

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    role: user?.role || 'employee',
    status: user?.status || 'active',
    password: '',
    department: user?.employeeDetails?.department || '',
    position: user?.employeeDetails?.position || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const url = user ? `/api/users/${user.id}` : '/api/users'
      const method = user ? 'PUT' : 'POST'

      // Only send password if it's set (for new users or password change)
      const dataToSend = { ...formData }
      if (!dataToSend.password) {
        delete (dataToSend as Record<string, unknown>).password
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar usuario')
      }

      toast.success(user ? 'Usuario actualizado' : 'Usuario creado')
      onSuccess()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar usuario'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-[#374151] mb-2">
            Nombre *
          </label>
          <input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            placeholder="Juan"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-[#374151] mb-2">
            Apellido *
          </label>
          <input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            placeholder="Pérez"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-2">
          Email *
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          placeholder="juan@ejemplo.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-[#374151] mb-2">
          Teléfono
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          placeholder="+52 55 1234 5678"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-2">
          {user ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!user}
            minLength={8}
            className="w-full px-4 py-2.5 pr-12 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            placeholder="Mínimo 8 caracteres"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-[#374151] mb-2">
          Rol *
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
        >
          {AVAILABLE_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_INFO[role].label} - {ROLE_INFO[role].description}
            </option>
          ))}
        </select>
      </div>

      {user && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-[#374151] mb-2">
            Estado
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-[#374151] mb-2">
            Puesto
          </label>
          <input
            id="position"
            type="text"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            placeholder="Ej: Vendedor"
          />
        </div>
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-[#374151] mb-2">
            Departamento
          </label>
          <input
            id="department"
            type="text"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
            placeholder="Ej: Ventas"
          />
        </div>
      </div>

      {/* Role description */}
      <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-4">
        <p className="text-sm font-medium text-[#374151] mb-2">
          Permisos del rol: {ROLE_INFO[formData.role as keyof typeof ROLE_INFO]?.label}
        </p>
        <p className="text-xs text-[#6B7280]">
          {formData.role === 'viewer' && 'Solo lectura - puede ver dashboard, productos, pedidos, clientes, descuentos y reportes básicos.'}
          {formData.role === 'employee' && 'Tareas operativas - puede ver/editar productos, procesar pedidos, ver clientes y ajustar inventario.'}
          {formData.role === 'manager' && 'Operaciones diarias - todo lo de empleado más crear productos, cancelar pedidos, editar clientes y ver reportes.'}
          {formData.role === 'admin' && 'Gestión completa - todo lo de gerente más eliminar productos/clientes, gestionar usuarios y configuración parcial.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm text-[#374151] border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </>
          ) : (
            user ? 'Guardar cambios' : 'Crear usuario'
          )}
        </button>
      </div>
    </form>
  )
}
