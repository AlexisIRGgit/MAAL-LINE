'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
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
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setErrorMessage('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <Image
              src="/images/logo-maal-negro.png"
              alt="MAAL Line"
              width={100}
              height={40}
              className="mx-auto invert"
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
          <h1 className="text-xl font-bold text-[#E8E4D9] text-center mb-1">
            Bienvenido
          </h1>
          <p className="text-[#666666] text-sm text-center mb-6">
            Inicia sesión en tu cuenta
          </p>

          {/* Google Sign In - Round Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-white text-[#1F1F1F] text-sm font-medium rounded-xl hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-5 h-5 relative">
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
            </div>
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-[#333333]"></div>
            <span className="px-4 text-xs text-[#666666]">o</span>
            <div className="flex-1 border-t border-[#333333]"></div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2.5 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#E8E4D9] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-[#0A0A0A] border border-[#333333] rounded-xl text-sm text-[#E8E4D9] placeholder-[#666666] focus:outline-none focus:border-[#C9A962] transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#E8E4D9] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0A0A0A] border border-[#333333] rounded-xl text-sm text-[#E8E4D9] placeholder-[#666666] focus:outline-none focus:border-[#C9A962] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#E8E4D9] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-[#888888] cursor-pointer">
                <input type="checkbox" className="mr-2 accent-[#C9A962] w-3.5 h-3.5 rounded" />
                Recordarme
              </label>
              <Link href="/forgot-password" className="text-[#C9A962] hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#E8E4D9] text-[#0A0A0A] text-sm font-semibold rounded-xl hover:bg-[#C9A962] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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

          {/* Register Link */}
          <p className="mt-5 text-center text-sm text-[#888888]">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-[#C9A962] hover:underline font-medium">
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#666666]">
          Al continuar, aceptas nuestros{' '}
          <Link href="/terms" className="text-[#888888] hover:underline">Términos</Link>
          {' '}y{' '}
          <Link href="/privacy" className="text-[#888888] hover:underline">Privacidad</Link>
        </p>
      </div>
    </div>
  )
}
