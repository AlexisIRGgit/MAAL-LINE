'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(error ? 'Credenciales inválidas' : '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setErrorMessage('Email o contraseña incorrectos')
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setErrorMessage('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/images/logo-maal-negro.png"
              alt="MAAL Line"
              width={120}
              height={48}
              className="mb-2"
              priority
            />
            <p className="text-[#6B7280] text-sm">Panel de Administración</p>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#111827] mb-2">
              Bienvenido de nuevo
            </h1>
            <p className="text-[#6B7280]">
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                  placeholder="admin@maalline.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#D1D5DB] text-[#111827] focus:ring-[#111827] focus:ring-offset-0"
                />
                <span className="text-sm text-[#6B7280]">Recordar sesión</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-[#9CA3AF]">
            Acceso exclusivo para personal autorizado
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-[#111827] items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Lock className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Panel Administrativo
          </h2>
          <p className="text-[#9CA3AF] text-lg">
            Gestiona productos, inventario, órdenes y más desde un solo lugar.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-xs text-[#9CA3AF]">Disponibilidad</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">SSL</div>
              <div className="text-xs text-[#9CA3AF]">Seguro</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">2FA</div>
              <div className="text-xs text-[#9CA3AF]">Protegido</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
