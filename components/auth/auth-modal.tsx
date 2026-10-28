'use client'

// Styled after uiarc.dev/components/blocks/login (centered login): a quiet ring backdrop that drifts with the
// pointer, a card whose height glides between steps, steps that rise out of a small blur, and a mode switch
// whose labels cross-fade in place. Auth itself is unchanged: credentials + Google through NextAuth.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionStyle,
  type Transition,
  type Variants,
} from 'framer-motion'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthModalStore } from '@/lib/store/auth-modal-store'
import { useModalA11y } from '@/hooks/use-modal-a11y'
import { cn } from '@/lib/utils/cn'

type Step = 'login' | 'register' | 'done'
type StepCustom = { direction: number; reduce: boolean }

const EASE_ENTER = [0.16, 1, 0.3, 1] as const
const EASE_STANDARD = [0.22, 1, 0.36, 1] as const
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const
const SPRING_SMOOTH = { type: 'spring', visualDuration: 0.4, bounce: 0 } as const

/** Steps rise into place out of a small blur; going back, they settle down from above */
const stepMotion: Variants = {
  enter: ({ direction, reduce }: StepCustom) => (reduce ? { opacity: 0 } : { opacity: 0, y: direction * 12, filter: 'blur(4px)' }),
  center: ({ reduce }: StepCustom) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: reduce
      ? { duration: 0.12 }
      : { y: SPRING_SMOOTH, opacity: { duration: 0.24, ease: EASE_ENTER, delay: 0.06 }, filter: { duration: 0.24, ease: EASE_ENTER, delay: 0.04 } },
  }),
  exit: ({ direction, reduce }: StepCustom) =>
    reduce
      ? { opacity: 0, transition: { duration: 0 } }
      : { opacity: 0, y: direction * -8, filter: 'blur(4px)', transition: { duration: 0.18, ease: EASE_STANDARD } },
}

/** Short swaps for status and error lines */
const swap = (reduce: boolean) => ({
  initial: reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, filter: 'blur(2px)', transition: { duration: 0.16 } },
  transition: (reduce ? { duration: 0.12 } : { duration: 0.24, ease: EASE_ENTER }) as Transition,
})

/** Both switch labels share one cell and cross-fade, so the control never changes width */
const labelState = (active: boolean, reduce: boolean) =>
  active ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: reduce ? 0 : -6, filter: `blur(${reduce ? 0 : 2}px)` }
const labelTransition = (reduce: boolean): Transition => (reduce ? { duration: 0.12 } : { duration: 0.24, ease: EASE_ENTER })

/** Concentric rings behind the card; outer rings drift further, so the set reads as depth */
const RINGS = Array.from({ length: 12 }, (_, index) => ({ r: 240 + index * 64, k: 1 + index * 0.34, major: index % 3 === 2 }))

/** The card follows its content on a spring only while the step changes; otherwise it stays auto */
function useViewHeight(view: string, reduce: boolean) {
  const track = useRef<HTMLDivElement>(null)
  const height = useMotionValue<number | 'auto'>('auto')
  const measured = useRef(0)
  const gliding = useRef(false)
  const lastView = useRef(view)
  const glide = useCallback(
    (to: number) => {
      gliding.current = true
      animate(height, to, {
        ...SPRING_SMOOTH,
        onComplete: () => {
          gliding.current = false
          height.jump('auto')
        },
      })
    },
    [height]
  )
  useEffect(() => {
    const node = track.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      measured.current = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight
      if (gliding.current) glide(measured.current)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [glide])
  useLayoutEffect(() => {
    if (lastView.current === view) return
    lastView.current = view
    const current = height.get()
    const from = typeof current === 'number' ? current : measured.current
    const to = track.current?.offsetHeight ?? 0
    if (reduce || !from || !to) {
      gliding.current = false
      height.jump('auto')
      return
    }
    if (current === 'auto') height.jump(from)
    glide(to)
  }, [view, reduce, height, glide])
  return { track, height }
}

/** Pointer drift for the ring backdrop: fine pointers only, never under reduced motion */
function useDrift(reduce: boolean) {
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const x = useSpring(pointerX, { visualDuration: 0.9, bounce: 0 })
  const y = useSpring(pointerY, { visualDuration: 0.9, bounce: 0 })
  const dx = useTransform(x, (value) => `${value.toFixed(2)}px`)
  const dy = useTransform(y, (value) => `${value.toFixed(2)}px`)
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduce || event.pointerType !== 'mouse') return
    const box = event.currentTarget.getBoundingClientRect()
    pointerX.set(((event.clientX - box.left) / box.width - 0.5) * -14)
    pointerY.set(((event.clientY - box.top) / box.height - 0.5) * -14)
  }
  return { style: { '--dx': dx, '--dy': dy } as MotionStyle, onPointerMove }
}

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

const INPUT =
  'h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-[border-color,box-shadow] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/[0.06] dark:bg-white/[0.04] dark:focus:border-white/40 dark:focus:ring-white/[0.06]'
const PRIMARY =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#111827] text-sm font-semibold text-white transition-colors hover:bg-[#1F2937] disabled:opacity-60'
const SECONDARY =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:opacity-60 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]'

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-[#374151]">
        {label}
      </label>
      {children}
    </div>
  )
}

function PasswordInput({
  id,
  name,
  value,
  onChange,
  autoComplete,
}: {
  id: string
  name?: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  autoComplete: string
}) {
  const [shown, setShown] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={shown ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        placeholder="••••••••"
        className={cn(INPUT, 'pr-11')}
      />
      <button
        type="button"
        onClick={() => setShown(!shown)}
        aria-label={shown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#9CA3AF] transition-colors hover:text-[#374151]"
      >
        {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function ErrorLine({ message, reduce }: { message: string; reduce: boolean }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {message && (
        <motion.p key={message} role="alert" {...swap(reduce)} className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-rose-400/10 dark:text-rose-300">
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

export function AuthModal() {
  const router = useRouter()
  const { isOpen, view, closeAuthModal, switchView } = useAuthModalStore()
  const reduce = !!useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const [direction, setDirection] = useState(1)
  const [done, setDone] = useState<null | 'login' | 'register'>(null)
  const [busy, setBusy] = useState<null | 'form' | 'google'>(null)
  const [error, setError] = useState('')
  const [login, setLogin] = useState({ email: '', password: '' })
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [acceptTerms, setAcceptTerms] = useState(false)

  const step: Step = done ? 'done' : view
  const { track, height } = useViewHeight(step, reduce)
  const drift = useDrift(reduce)
  const custom: StepCustom = { direction, reduce }
  const signingUp = view === 'register'

  useModalA11y({ open: isOpen, panelRef, onClose: closeAuthModal })

  // Each opening starts clean
  useEffect(() => {
    if (!isOpen) return
    setDone(null)
    setBusy(null)
    setError('')
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const switchMode = () => {
    if (busy) return
    setError('')
    setDirection(signingUp ? -1 : 1)
    switchView(signingUp ? 'login' : 'register')
  }

  const finish = (kind: 'login' | 'register') => {
    setDirection(1)
    setDone(kind)
    router.refresh()
    window.setTimeout(closeAuthModal, 1400)
  }

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    setBusy('form')
    setError('')
    try {
      const result = await signIn('credentials', { email: login.email, password: login.password, redirect: false })
      if (result?.code === 'two_factor_required') {
        // Staff accounts with 2FA finish signing in on the admin login, which asks for the code
        setError('Esta cuenta usa verificación en dos pasos. Inicia sesión desde maalline.com/admin/login')
      } else if (result?.error) {
        setError('Email o contraseña incorrectos')
      } else {
        finish('login')
      }
    } catch {
      setError('No pudimos iniciar sesión. Intenta de nuevo.')
    } finally {
      setBusy(null)
    }
  }

  const submitRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    setError('')
    if (form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres')
    if (form.password !== form.confirmPassword) return setError('Las contraseñas no coinciden')
    if (!acceptTerms) return setError('Acepta los términos y el aviso de privacidad para continuar')
    setBusy('form')
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName }),
      })
      const data = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) {
        setError(data.error || 'No pudimos crear la cuenta')
        return
      }
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      if (result?.error) {
        setDirection(-1)
        switchView('login')
        setLogin({ email: form.email, password: '' })
      } else {
        finish('register')
      }
    } catch {
      setError('No pudimos crear la cuenta. Intenta de nuevo.')
    } finally {
      setBusy(null)
    }
  }

  const google = () => {
    if (busy) return
    setBusy('google')
    signIn('google', { callbackUrl: window.location.pathname || '/' })
  }

  const googleButton = (
    <button type="button" onClick={google} disabled={!!busy} className={SECONDARY}>
      {busy === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleLogo />}
      Continuar con Google
    </button>
  )
  const divider = (
    <div className="my-5 flex items-center gap-3 text-xs text-[#9CA3AF] before:h-px before:flex-1 before:bg-[#E5E7EB] after:h-px after:flex-1 after:bg-[#E5E7EB]">
      o con tu correo
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth"
          className="fixed inset-0 z-[400] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.1 : 0.24, ease: EASE_ENTER }}
          onPointerMove={drift.onPointerMove}
        >
          {/* Backdrop with the drifting rings */}
          <button
            type="button"
            tabIndex={-1}
            aria-label="Cerrar"
            onClick={closeAuthModal}
            className="absolute inset-0 cursor-default bg-[#F5F5F7]/80 backdrop-blur-md dark:bg-black/70"
          />
          <motion.div
            aria-hidden
            style={drift.style}
            className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_75%_at_50%_50%,#000_35%,transparent_100%)]"
          >
            <svg className="absolute inset-0 h-full w-full overflow-visible">
              <svg x="50%" y="50%" overflow="visible">
                <line x1="-2400" x2="2400" y1="0" y2="0" className="fill-none stroke-black/[0.06] dark:stroke-white/[0.06]" style={{ transform: 'translate(var(--dx), var(--dy))' }} />
                <line x1="0" x2="0" y1="-2400" y2="2400" className="fill-none stroke-black/[0.06] dark:stroke-white/[0.06]" style={{ transform: 'translate(var(--dx), var(--dy))' }} />
                {RINGS.map((ring) => (
                  <circle
                    key={ring.r}
                    r={ring.r}
                    cx="0"
                    cy="0"
                    className={cn('fill-none', ring.major ? 'stroke-black/[0.1] dark:stroke-white/[0.1]' : 'stroke-black/[0.05] dark:stroke-white/[0.05]')}
                    style={{ '--k': ring.k, transform: 'translate(calc(var(--dx) * var(--k)), calc(var(--dy) * var(--k)))' } as CSSProperties}
                  />
                ))}
              </svg>
            </svg>
          </motion.div>

          {/* Card */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={signingUp ? 'Crear cuenta' : 'Iniciar sesión'}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98, filter: 'blur(4px)' }}
            transition={reduce ? { duration: 0.12 } : { y: SPRING_SMOOTH, scale: SPRING_SMOOTH, opacity: { duration: 0.24, ease: EASE_ENTER }, filter: { duration: 0.24, ease: EASE_ENTER } }}
            className="relative w-full max-w-[420px] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-[28px] border border-[#E5E7EB] bg-white shadow-[0_24px_60px_-24px_rgba(17,24,39,0.35)] outline-none dark:bg-[#16181D] dark:border-white/10 dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.8)]"
          >
            {/* Top bar: logo and the mode switch */}
            <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] px-5 py-3.5">
              <Image src="/images/logo-maal-negro.png" alt="MAAL Line" width={64} height={26} className="object-contain" priority />
              <div className="flex items-center gap-1">
                {step !== 'done' && (
                  <p className="flex items-center gap-1 text-sm text-[#6B7280]">
                    <span className="hidden sm:inline-grid justify-items-end">
                      {(['login', 'register'] as const).map((option) => (
                        <motion.span key={option} className="[grid-area:1/1]" aria-hidden={option !== view || undefined} initial={false} animate={labelState(option === view, reduce)} transition={labelTransition(reduce)}>
                          {option === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                        </motion.span>
                      ))}
                    </span>
                    <button
                      type="button"
                      onClick={switchMode}
                      aria-label={signingUp ? 'Iniciar sesión' : 'Crear cuenta'}
                      className="relative inline-grid h-8 items-center justify-items-center rounded-full px-3 font-medium text-[#111827] transition-colors hover:bg-[#F3F4F6] dark:hover:bg-white/[0.08]"
                    >
                      {(['login', 'register'] as const).map((option) => (
                        <motion.span key={option} className="[grid-area:1/1]" aria-hidden="true" initial={false} animate={labelState(option === view, reduce)} transition={labelTransition(reduce)}>
                          {option === 'login' ? 'Regístrate' : 'Inicia sesión'}
                        </motion.span>
                      ))}
                    </button>
                  </p>
                )}
                <button
                  type="button"
                  onClick={closeAuthModal}
                  aria-label="Cerrar"
                  className="grid h-8 w-8 place-items-center rounded-full text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827] dark:hover:bg-white/[0.08]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Steps: the viewport clips the leaving step while the height glides */}
            <motion.div className="overflow-hidden" style={{ height }}>
              <div ref={track} className="relative">
                <AnimatePresence mode="popLayout" initial={false} custom={custom}>
                  {step === 'login' && (
                    <motion.div key="login" className="grid p-6 sm:p-7" custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                      <div className="mb-6 grid gap-1.5">
                        <h2 className="font-body text-2xl font-bold tracking-tight text-[#111827]">Inicia sesión</h2>
                        <p className="text-sm text-[#6B7280]">Sigue tus pedidos, guarda direcciones y compra más rápido.</p>
                      </div>
                      {googleButton}
                      {divider}
                      <form onSubmit={submitLogin} className="grid gap-4" noValidate={false}>
                        <Field id="login-email" label="Email">
                          <input
                            id="login-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            required
                            value={login.email}
                            onChange={(e) => setLogin({ ...login, email: e.target.value })}
                            placeholder="tu@email.com"
                            className={INPUT}
                          />
                        </Field>
                        <Field id="login-password" label="Contraseña">
                          <PasswordInput id="login-password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} autoComplete="current-password" />
                        </Field>
                        <ErrorLine message={error} reduce={reduce} />
                        <button type="submit" disabled={!!busy} className={PRIMARY}>
                          {busy === 'form' && <Loader2 className="h-4 w-4 animate-spin" />}
                          Iniciar sesión
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {step === 'register' && (
                    <motion.div key="register" className="grid p-6 sm:p-7" custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                      <div className="mb-6 grid gap-1.5">
                        <h2 className="font-body text-2xl font-bold tracking-tight text-[#111827]">Crea tu cuenta</h2>
                        <p className="text-sm text-[#6B7280]">Guarda tus direcciones, sigue tus pedidos y compra más rápido.</p>
                      </div>
                      {googleButton}
                      {divider}
                      <form onSubmit={submitRegister} className="grid gap-4">
                        <div className="grid grid-cols-2 gap-3">
                          <Field id="reg-firstName" label="Nombre">
                            <input id="reg-firstName" autoComplete="given-name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Juan" className={INPUT} />
                          </Field>
                          <Field id="reg-lastName" label="Apellido">
                            <input id="reg-lastName" autoComplete="family-name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Pérez" className={INPUT} />
                          </Field>
                        </div>
                        <Field id="reg-email" label="Email">
                          <input
                            id="reg-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="tu@email.com"
                            className={INPUT}
                          />
                        </Field>
                        <Field id="reg-password" label="Contraseña · mínimo 8 caracteres">
                          <PasswordInput id="reg-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
                        </Field>
                        <Field id="reg-confirm" label="Confirmar contraseña">
                          <PasswordInput id="reg-confirm" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} autoComplete="new-password" />
                        </Field>
                        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-[#6B7280]">
                          <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#111827]" />
                          <span>
                            Acepto los{' '}
                            <Link href="/terminos" onClick={closeAuthModal} className="font-medium text-[#111827] underline underline-offset-2">
                              términos
                            </Link>{' '}
                            y el{' '}
                            <Link href="/privacidad" onClick={closeAuthModal} className="font-medium text-[#111827] underline underline-offset-2">
                              aviso de privacidad
                            </Link>
                          </span>
                        </label>
                        <ErrorLine message={error} reduce={reduce} />
                        <button type="submit" disabled={!!busy} className={PRIMARY}>
                          {busy === 'form' && <Loader2 className="h-4 w-4 animate-spin" />}
                          Crear cuenta
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {step === 'done' && (
                    <motion.div key="done" className="grid p-6 sm:p-7" custom={custom} variants={stepMotion} initial="enter" animate="center" exit="exit">
                      <svg className="mb-6 h-12 w-12 overflow-visible text-emerald-500" viewBox="0 0 48 48" aria-hidden="true">
                        <g transform="rotate(-90 24 24)">
                          <motion.circle
                            cx="24"
                            cy="24"
                            r="22.25"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ pathLength: { duration: 0.48, ease: EASE_IN_OUT, delay: 0.16 }, opacity: { duration: 0.12, delay: 0.16 } }}
                          />
                        </g>
                        <motion.path
                          d="M15.5 24.5l5.5 5.5 11.5-12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ pathLength: { duration: 0.32, ease: EASE_ENTER, delay: 0.52 }, opacity: { duration: 0.12, delay: 0.52 } }}
                        />
                      </svg>
                      <div className="grid gap-1.5">
                        <h2 className="font-body text-2xl font-bold tracking-tight text-[#111827]">
                          {done === 'register' ? 'Bienvenido a MAAL' : 'Bienvenido de vuelta'}
                        </h2>
                        <p className="text-sm text-[#6B7280]">{done === 'register' ? 'Tu cuenta está lista.' : 'Ya iniciaste sesión.'}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Footer: legal links */}
            <div className="flex items-center justify-between gap-3 border-t border-[#E5E7EB] px-5 py-3 text-xs text-[#9CA3AF]">
              <span>Envíos desde Guadalajara</span>
              <nav aria-label="Legal" className="flex gap-1">
                <Link href="/terminos" onClick={closeAuthModal} className="rounded-full px-2 py-1 transition-colors hover:bg-[#F3F4F6] hover:text-[#111827] dark:hover:bg-white/[0.08]">
                  Términos
                </Link>
                <Link href="/privacidad" onClick={closeAuthModal} className="rounded-full px-2 py-1 transition-colors hover:bg-[#F3F4F6] hover:text-[#111827] dark:hover:bg-white/[0.08]">
                  Privacidad
                </Link>
              </nav>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
