'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Lock, Mail, Eye, EyeOff, AlertCircle, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react'
import { OTPInput, type OTPStatus } from '@/components/ui/otp-input'
import { ThemeToggle } from '@/components/ui/theme-toggle'

function loginErrorMessage(code: string) {
  switch (code) {
    case 'two_factor_invalid':
      return 'Código incorrecto, intenta de nuevo'
    case 'two_factor_locked':
      return 'Demasiados intentos. Espera 15 minutos e intenta de nuevo'
    case 'two_factor_google':
      return 'Esta cuenta usa verificación en dos pasos: inicia sesión con tu correo y contraseña'
    default:
      return 'Credenciales inválidas'
  }
}

export default function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(error ? loginErrorMessage(error) : '')

  // Second step, shown when the account has two-factor auth on
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [otp, setOtp] = useState('')
  const [otpStatus, setOtpStatus] = useState<OTPStatus>('idle')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [backupCode, setBackupCode] = useState('')

  const attemptSignIn = async (secondFactor?: string) => {
    if (isLoading) return
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        ...(secondFactor ? { otp: secondFactor } : {}),
        redirect: false,
      })

      if (result?.code === 'two_factor_required') {
        setStep('otp')
      } else if (result?.code === 'two_factor_invalid' || result?.code === 'two_factor_locked') {
        setOtpStatus('error')
        setErrorMessage(loginErrorMessage(result.code))
        setOtp('')
      } else if (result?.error) {
        // Password changed or wrong: start over from the first step
        setStep('credentials')
        setErrorMessage('Email o contraseña incorrectos')
      } else {
        setOtpStatus('success')
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setErrorMessage('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    attemptSignIn()
  }

  const handleBackupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (backupCode.trim()) attemptSignIn(backupCode)
  }

  const backToCredentials = () => {
    setStep('credentials')
    setOtp('')
    setOtpStatus('idle')
    setBackupCode('')
    setUseBackupCode(false)
    setErrorMessage('')
  }

  return (
    <div className="relative min-h-screen bg-[#F5F5F7] flex">
      <ThemeToggle
        className="absolute right-4 top-4 z-10 w-10 h-10 rounded-full text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB] transition-colors lg:right-[calc(50%+1rem)]"
        iconClassName="w-5 h-5"
      />

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-16 sm:p-8">
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

          {step === 'otp' ? (
            <div>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#F3F4F6] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-[#111827]" />
                </div>
                <h1 className="text-2xl font-bold text-[#111827] mb-2">Verificación en dos pasos</h1>
                <p className="text-[#6B7280]">
                  {useBackupCode
                    ? 'Escribe uno de tus códigos de respaldo. Cada código sirve una sola vez.'
                    : 'Abre tu app autenticadora e ingresa el código de 6 dígitos.'}
                </p>
              </div>

              {useBackupCode ? (
                <form onSubmit={handleBackupSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{errorMessage}</span>
                    </div>
                  )}
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input
                      type="text"
                      value={backupCode}
                      onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                      autoFocus
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      aria-label="Código de respaldo"
                      placeholder="XXXXX-XXXXX"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl font-mono tracking-widest text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !backupCode.trim()}
                    className="w-full py-3.5 bg-[#111827] text-white font-semibold rounded-xl hover:bg-[#1F2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verificando...' : 'Verificar'}
                  </button>
                </form>
              ) : (
                <div className="flex justify-center">
                  <OTPInput
                    value={otp}
                    onChange={(value) => {
                      setOtp(value)
                      if (otpStatus === 'error') setOtpStatus('idle')
                    }}
                    onComplete={(value) => attemptSignIn(value)}
                    status={otpStatus}
                    errorMessage={errorMessage}
                    successMessage="Código verificado"
                    hint={isLoading ? 'Verificando...' : 'El código cambia cada 30 segundos'}
                    disabled={otpStatus === 'success'}
                    autoFocus
                  />
                </div>
              )}

              <div className="mt-8 flex flex-col items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setUseBackupCode((v) => !v)
                    setErrorMessage('')
                    setOtpStatus('idle')
                  }}
                  className="font-medium text-[#111827] hover:underline underline-offset-4"
                >
                  {useBackupCode ? 'Usar la app autenticadora' : 'Usar un código de respaldo'}
                </button>
                <button
                  type="button"
                  onClick={backToCredentials}
                  className="inline-flex items-center gap-1.5 text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </button>
              </div>
            </div>
          ) : (
            <>
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

              {/* Remember */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#D1D5DB] accent-[#111827] dark:accent-[#F5F5F5] focus:ring-[#111827] focus:ring-offset-0"
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

            </>
          )}

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-[#9CA3AF]">
            Acceso exclusivo para personal autorizado
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      {/* gray-900 (= #111827) on purpose: the dark layer remaps bg-[#111827] to a light surface */}
      <div className="hidden lg:flex lg:flex-1 bg-gray-900 dark:bg-[#15171C] dark:border-l dark:border-[#23262E] items-center justify-center p-12">
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
