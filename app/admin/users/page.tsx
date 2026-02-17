'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  UserCog,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Shield,
  Eye,
  Users,
  UserCheck,
  Crown,
  Mail,
  Phone,
  Calendar,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ROLE_INFO } from '@/lib/permissions'
import { toast } from '@/lib/toast'
import { UserForm } from '@/components/admin/user-form'

interface TeamMember {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  avatarUrl: string | null
  role: string
  status: string
  createdAt: string
  lastLoginAt: string | null
  employeeDetails: {
    department: string | null
    position: string | null
  } | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export default function UsersPage() {
  const [users, setUsers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = () => {
    setSelectedUser(null)
    setShowModal(true)
  }

  const handleEditUser = (user: TeamMember) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id))
        setShowDeleteConfirm(null)
        toast.success('Usuario eliminado')
      } else {
        toast.error('Error al eliminar usuario')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al eliminar usuario')
    }
  }

  const handleFormSuccess = () => {
    setShowModal(false)
    setSelectedUser(null)
    fetchUsers()
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    admins: users.filter((u) => u.role === 'admin' || u.role === 'owner').length,
  }

  const getRoleBadge = (role: string) => {
    const info = ROLE_INFO[role as keyof typeof ROLE_INFO]
    const colorClasses: Record<string, string> = {
      gray: 'bg-gray-100 text-gray-700',
      blue: 'bg-blue-50 text-blue-700',
      green: 'bg-green-50 text-green-700',
      amber: 'bg-amber-50 text-amber-700',
      purple: 'bg-purple-50 text-purple-700',
      red: 'bg-red-50 text-red-700',
    }
    return (
      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', colorClasses[info?.color || 'gray'])}>
        {info?.label || role}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      active: 'bg-green-50 text-green-700',
      inactive: 'bg-gray-100 text-gray-600',
      suspended: 'bg-amber-50 text-amber-700',
      banned: 'bg-red-50 text-red-700',
    }
    const labels: Record<string, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
      banned: 'Baneado',
    }
    return (
      <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', classes[status])}>
        {labels[status] || status}
      </span>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-red-500" />
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-500" />
      case 'manager':
        return <UserCheck className="w-4 h-4 text-amber-500" />
      case 'employee':
        return <Users className="w-4 h-4 text-green-500" />
      case 'viewer':
        return <Eye className="w-4 h-4 text-blue-500" />
      default:
        return <UserCog className="w-4 h-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#111827]" />
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Equipo</h1>
          <p className="text-sm text-[#6B7280]">Gestiona los usuarios del panel de administración</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111827] text-white text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar usuario
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F3F4F6] rounded-lg">
              <Users className="w-5 h-5 text-[#6B7280]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{stats.total}</p>
              <p className="text-xs text-[#6B7280]">Total usuarios</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{stats.active}</p>
              <p className="text-xs text-[#6B7280]">Activos</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{stats.admins}</p>
              <p className="text-xs text-[#6B7280]">Administradores</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
        >
          <option value="all">Todos los roles</option>
          <option value="owner">Dueño</option>
          <option value="admin">Administrador</option>
          <option value="manager">Gerente</option>
          <option value="employee">Empleado</option>
          <option value="viewer">Visor</option>
        </select>
      </motion.div>

      {/* Users List */}
      <motion.div variants={itemVariants} className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserCog className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280] font-medium">No hay usuarios</p>
            <p className="text-sm text-[#9CA3AF]">Agrega usuarios para gestionar el equipo</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#111827] to-[#374151] flex items-center justify-center text-white font-bold text-lg">
                        {user.firstName?.[0] || user.email[0].toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {getRoleIcon(user.role)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#111827] text-sm sm:text-base">
                        {user.firstName} {user.lastName}
                      </h3>
                      {getRoleBadge(user.role)}
                      <span className="hidden sm:inline">{getStatusBadge(user.status)}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-[#6B7280]">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </span>
                      {user.phone && (
                        <span className="items-center gap-1 hidden md:flex">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          {user.phone}
                        </span>
                      )}
                    </div>
                    {user.employeeDetails?.position && (
                      <p className="text-xs text-[#9CA3AF] mt-1 hidden sm:block">
                        {user.employeeDetails.position}
                        {user.employeeDetails.department && ` • ${user.employeeDetails.department}`}
                      </p>
                    )}
                  </div>

                  {/* Last login */}
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-[#9CA3AF]">Último acceso</p>
                    <p className="text-sm text-[#6B7280]">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Nunca'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user.role !== 'owner' && (
                      <button
                        onClick={() => setShowDeleteConfirm(user.id)}
                        className="p-2 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Delete confirmation */}
                {showDeleteConfirm === user.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
                    <p className="text-sm text-red-700">
                      ¿Eliminar a {user.firstName} {user.lastName}?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1.5 text-xs text-[#6B7280] hover:bg-white rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg bg-white sm:rounded-2xl shadow-xl overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111827]">
                {selectedUser ? 'Editar usuario' : 'Nuevo usuario'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <UserForm
                user={selectedUser}
                onSuccess={handleFormSuccess}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
