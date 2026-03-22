'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuthModalStore } from '@/lib/store/auth-modal-store'
import { cn } from '@/lib/utils/cn'

// ============================================
// LOGIN VIEW
// ============================================

function LoginView() {
  const router = useRouter()
  const { closeAuthModal, switchView } = useAuthModalStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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
        closeAuthModal()
        router.refresh()
      }
    } catch {
      setErrorMessage('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <>
      {/* Logo */}
      <div className="text-center mb-6">
        <Image
          src="/images/logo-maal-negro.png"
          alt="MAAL Line"
          width={100}
          height={40}
          className="mx-auto object-contain"
          priority
        />
      </div>

      {/* Header */}
      <h2 className="text-xl font-bold text-[#111827] text-center mb-1">
        Bienvenido
      </h2>
      <p className="text-[#6B7280] text-sm text-center mb-6">
        Inicia sesión en tu cuenta
      </p>

      {/* Google Sign In */}
      <button
        onClick={handleGoogleSignIn}
        className="w-full py-3 bg-white text-[#111827] text-sm font-medium rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors flex items-center justify-center gap-3 mb-4"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continuar con Google
      </button>

      {/* Divider */}
      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-[#E5E7EB]" />
        <span className="px-4 text-xs text-[#9CA3AF]">o</span>
        <div className="flex-1 border-t border-[#E5E7EB]" />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-xs font-medium text-[#374151] mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-medium text-[#374151] mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center text-[#6B7280] cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 accent-[#FF3D00] w-3.5 h-3.5 rounded"
            />
            Recordarme
          </label>
          <Link
            href="/forgot-password"
            onClick={() => closeAuthModal()}
            className="text-[#6B7280] hover:text-[#111827] hover:underline transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-[#FF3D00] text-white text-sm font-bold tracking-wider rounded-xl hover:bg-[#E63600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Iniciando sesión...</span>
            </>
          ) : (
            'INICIAR SESIÓN'
          )}
        </button>
      </form>

      {/* Register Link */}
      <p className="mt-5 text-center text-sm text-[#6B7280]">
        ¿No tienes cuenta?{' '}
        <button
          onClick={() => switchView('register')}
          className="text-[#FF3D00] hover:underline font-medium"
        >
          Regístrate
        </button>
      </p>
    </>
  )
}

// ============================================
// REGISTER VIEW
// ============================================

function RegisterView() {
  const router = useRouter()
  const { closeAuthModal, switchView } = useAuthModalStore()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres')
      setIsLoading(false)
      return
    }

    if (!acceptTerms) {
      setErrorMessage('Debes aceptar los términos y condiciones')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || 'Error al crear la cuenta')
        setIsLoading(false)
        return
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        switchView('login')
      } else {
        closeAuthModal()
        router.refresh()
      }
    } catch {
      setErrorMessage('Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' })
  }

  return (
    <>
      {/* Logo */}
      <div className="text-center mb-4">
        <Image
          src="/images/logo-maal-negro.png"
          alt="MAAL Line"
          width={80}
          height={32}
          className="mx-auto object-contain"
          priority
        />
      </div>

      {/* Header */}
      <h2 className="text-lg font-bold text-[#111827] text-center mb-4">
        Crear Cuenta
      </h2>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="reg-firstName" className="block text-xs font-medium text-[#374151] mb-1">
              Nombre
            </label>
            <input
              id="reg-firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
              placeholder="Juan"
            />
          </div>
          <div>
            <label htmlFor="reg-lastName" className="block text-xs font-medium text-[#374151] mb-1">
              Apellido
            </label>
            <input
              id="reg-lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
              placeholder="Pérez"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-xs font-medium text-[#374151] mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              id="reg-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-xs font-medium text-[#374151] mb-1">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-0.5 text-[10px] text-[#9CA3AF]">Mínimo 8 caracteres</p>
        </div>

        <div>
          <label htmlFor="reg-confirmPassword" className="block text-xs font-medium text-[#374151] mb-1">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              id="reg-confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#FF3D00]/20 focus:border-[#FF3D00] transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="reg-terms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 mr-1.5 accent-[#FF3D00] w-3.5 h-3.5"
          />
          <label htmlFor="reg-terms" className="text-[10px] text-[#6B7280] leading-tight">
            Acepto los{' '}
            <Link href="/terms" onClick={() => closeAuthModal()} className="text-[#FF3D00] hover:underline">
              términos
            </Link>{' '}
            y la{' '}
            <Link href="/privacy" onClick={() => closeAuthModal()} className="text-[#FF3D00] hover:underline">
              privacidad
            </Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-[#FF3D00] text-white text-sm font-bold tracking-wider rounded-xl hover:bg-[#E63600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creando cuenta...</span>
            </>
          ) : (
            'CREAR CUENTA'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-4">
        <div className="flex-1 border-t border-[#E5E7EB]" />
        <span className="px-3 text-xs text-[#9CA3AF]">o continúa con</span>
        <div className="flex-1 border-t border-[#E5E7EB]" />
      </div>

      {/* Google Sign In */}
      <button
        onClick={handleGoogleSignIn}
        className="w-full py-2.5 bg-white text-[#111827] text-sm font-medium rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors flex items-center justify-center gap-3"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google
      </button>

      {/* Login Link */}
      <p className="mt-4 text-center text-xs text-[#6B7280]">
        ¿Ya tienes cuenta?{' '}
        <button
          onClick={() => switchView('login')}
          className="text-[#FF3D00] hover:underline font-medium"
        >
          Inicia sesión
        </button>
      </p>
    </>
  )
}

// ============================================
// AUTH MODAL
// ============================================

export function AuthModal() {
  const { isOpen, view, closeAuthModal } = useAuthModalStore()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [closeAuthModal])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal Container - Centered with Flexbox */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl pointer-events-auto"
            >
              {/* Close Button */}
              <button
                onClick={closeAuthModal}
                className="absolute top-4 right-4 z-10 p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-6">
                {view === 'login' ? <LoginView /> : <RegisterView />}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
