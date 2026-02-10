'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

export function AdminHeader() {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const userName = session?.user?.firstName || session?.user?.email?.split('@')[0] || 'Admin'

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] pl-14 pr-4 lg:pl-6 lg:pr-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search - Hidden on mobile, shown on larger screens */}
      <div className="hidden sm:block flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar productos, órdenes..."
            className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="sm:hidden flex-1" />

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-[#F3F4F6] rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5 text-[#6B7280]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#10B981] rounded-full" />
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg z-50 overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB]">
                  <h3 className="font-semibold text-[#111827]">Notificaciones</h3>
                </div>
                <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  <div className="flex gap-3 p-2 hover:bg-[#F9FAFB] rounded-lg cursor-pointer">
                    <div className="w-8 h-8 bg-[#10B981]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">📦</span>
                    </div>
                    <div>
                      <p className="text-sm text-[#111827]">Nuevo pedido #ML-006</p>
                      <p className="text-xs text-[#6B7280]">Hace 5 minutos</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-2 hover:bg-[#F9FAFB] rounded-lg cursor-pointer">
                    <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">⚠️</span>
                    </div>
                    <div>
                      <p className="text-sm text-[#111827]">Stock bajo: Hoodie Black M</p>
                      <p className="text-xs text-[#6B7280]">Hace 2 horas</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-[#E5E7EB]">
                  <button className="w-full text-center text-sm text-[#10B981] hover:underline">
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F3F4F6] rounded-xl transition-colors"
          >
            <div className="w-8 h-8 bg-[#111827] rounded-full flex items-center justify-center">
              {session?.user?.avatarUrl ? (
                <Image
                  src={session.user.avatarUrl}
                  alt={userName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-[#111827]">{userName}</p>
              <p className="text-xs text-[#6B7280] capitalize">{session?.user?.role || 'Admin'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#6B7280] hidden md:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg z-50 overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB]">
                  <p className="font-medium text-[#111827]">{userName}</p>
                  <p className="text-sm text-[#6B7280]">{session?.user?.email}</p>
                </div>
                <div className="p-2">
                  <a
                    href="/admin/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-[#374151] hover:bg-[#F9FAFB] rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </a>
                  <a
                    href="/admin/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-[#374151] hover:bg-[#F9FAFB] rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Configuración
                  </a>
                </div>
                <div className="p-2 border-t border-[#E5E7EB]">
                  <button
                    onClick={() => signOut({ callbackUrl: '/admin/login' })}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
