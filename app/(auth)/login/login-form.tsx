'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-3">
      <div className="w-full max-w-xs">
        {/* Logo */}
        <div className="text-center mb-4">
          <Link href="/">
            <Image
              src="/images/logo-maal-negro.png"
              alt="MAAL Line"
              width={80}
              height={32}
              className="mx-auto invert"
              priority
            />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#222222] rounded-lg p-5">
          <h1 className="text-lg font-bold text-[#E8E4D9] text-center mb-4">
            Iniciar Sesión
          </h1>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg mb-4 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#E8E4D9] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-sm text-[#E8E4D9] placeholder-[#666666] focus:outline-none focus:border-[#C9A962] transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#E8E4D9] mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-lg text-sm text-[#E8E4D9] placeholder-[#666666] focus:outline-none focus:border-[#C9A962] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-[#888888]">
                <input type="checkbox" className="mr-1.5 accent-[#C9A962] w-3 h-3" />
                Recordarme
              </label>
              <Link href="/forgot-password" className="text-[#C9A962] hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-[#E8E4D9] text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[#C9A962] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-[#333333]"></div>
            <span className="px-3 text-xs text-[#666666]">o continúa con</span>
            <div className="flex-1 border-t border-[#333333]"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-2 bg-[#0A0A0A] border border-[#333333] text-[#E8E4D9] text-sm font-medium rounded-lg hover:border-[#C9A962] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          {/* Register Link */}
          <p className="mt-4 text-center text-xs text-[#888888]">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-[#C9A962] hover:underline font-medium">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
