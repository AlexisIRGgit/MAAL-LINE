'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Search, ChevronDown, User, Settings, LogOut, Menu } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { UserAvatar } from '@/components/ui/user-avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NotificationsBell } from '@/components/admin/notifications-bell'

export function AdminHeader({
  onMenuClick,
  menuTriggerRef,
  isMenuOpen,
}: {
  onMenuClick: () => void
  menuTriggerRef: React.RefObject<HTMLButtonElement>
  isMenuOpen: boolean
}) {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const userName = session?.user?.firstName || session?.user?.email?.split('@')[0] || 'Admin'

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] px-4 lg:px-6 flex items-center justify-between gap-3 sticky top-0 z-30">
      {/* Mobile menu trigger (the desktop sidebar has its own collapse control) */}
      <button
        ref={menuTriggerRef}
        onClick={onMenuClick}
        aria-label="Abrir menú"
        aria-expanded={isMenuOpen}
        className="lg:hidden p-2 -ml-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

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
        {/* Notifications (polled live) */}
        <NotificationsBell />

        {/* Theme */}
        <ThemeToggle
          className="p-2 rounded-xl text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
          iconClassName="w-5 h-5"
        />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F3F4F6] rounded-xl transition-colors"
          >
            <UserAvatar
              seed={session?.user?.email || session?.user?.id || userName}
              name={userName}
              avatarUrl={session?.user?.avatarUrl}
              size={32}
            />
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
