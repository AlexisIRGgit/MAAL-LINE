'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, ShieldOff, Smartphone, Copy, Check, Download, RefreshCw, Loader2 } from 'lucide-react'
import { OTPInput, type OTPStatus } from '@/components/ui/otp-input'

type Status = { enabled: boolean; backupCodesRemaining: number; hasPassword: boolean }
type Setup = { qrSvg: string; secret: string }
// What the panel is showing besides the status row
type Mode = 'idle' | 'setup' | 'codes' | 'disable' | 'regenerate'

const easeOut = [0.16, 1, 0.3, 1] as const

async function post2fa(body: Record<string, string>) {
  const res = await fetch('/api/admin/security/2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Algo salió mal, intenta de nuevo')
  return data
}

export function TwoFactorSettings() {
  const [status, setStatus] = useState<Status | null>(null)
  const [mode, setMode] = useState<Mode>('idle')
  const [setup, setSetup] = useState<Setup | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [code, setCode] = useState('')
  const [codeStatus, setCodeStatus] = useState<OTPStatus>('idle')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState<'secret' | 'codes' | null>(null)

  const loadStatus = useCallback(async () => {
    const res = await fetch('/api/admin/security/2fa')
    if (res.ok) setStatus(await res.json())
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const reset = (next: Mode = 'idle') => {
    setMode(next)
    setCode('')
    setCodeStatus('idle')
    setPassword('')
    setError('')
  }

  const fail = (err: unknown) => {
    setError(err instanceof Error ? err.message : 'Algo salió mal')
    setCodeStatus('error')
    setCode('')
  }

  const startSetup = async () => {
    setBusy(true)
    reset('setup')
    try {
      setSetup(await post2fa({ action: 'setup' }))
    } catch (err) {
      setMode('idle')
      setError(err instanceof Error ? err.message : 'Algo salió mal')
    } finally {
      setBusy(false)
    }
  }

  const confirmSetup = async (value: string) => {
    if (busy) return
    setBusy(true)
    try {
      const data = await post2fa({ action: 'enable', code: value })
      setCodeStatus('success')
      setBackupCodes(data.backupCodes)
      setSetup(null)
      await loadStatus()
      setTimeout(() => reset('codes'), 600)
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  const regenerate = async (value: string) => {
    if (busy) return
    setBusy(true)
    try {
      const data = await post2fa({ action: 'regenerate', code: value })
      setCodeStatus('success')
      setBackupCodes(data.backupCodes)
      await loadStatus()
      setTimeout(() => reset('codes'), 600)
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  const disable = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await post2fa({ action: 'disable', code, password })
      await loadStatus()
      reset()
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  const copy = async (text: string, what: 'secret' | 'codes') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  const downloadCodes = () => {
    const text = `MAAL LINE - Códigos de respaldo\nCada código sirve una sola vez.\n\n${backupCodes.join('\n')}\n`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'maal-line-codigos-respaldo.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  const otpField = (onComplete: (value: string) => void, hint: string) => (
    <OTPInput
      value={code}
      onChange={(value) => {
        setCode(value)
        if (codeStatus === 'error') {
          setCodeStatus('idle')
          setError('')
        }
      }}
      onComplete={onComplete}
      status={codeStatus}
      errorMessage={error}
      successMessage="Código verificado"
      hint={busy ? 'Verificando...' : hint}
      // Not disabled while verifying: that would drop focus and the soft keyboard
      disabled={codeStatus === 'success'}
      slotClassName="h-12 w-10 sm:h-14 sm:w-12"
      autoFocus
    />
  )

  return (
    <div className="p-3 sm:p-4 bg-[#F9FAFB] rounded-xl">
      {/* Status row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2 rounded-lg flex-shrink-0 ${
              status?.enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[#E5E7EB] text-[#6B7280]'
            }`}
          >
            {status?.enabled ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[#111827] text-xs sm:text-sm font-medium">Verificación en dos pasos</p>
              {status && (
                <span className={`text-xs font-medium ${status.enabled ? 'text-emerald-600' : 'text-[#6B7280]'}`}>
                  {status.enabled ? 'Activa' : 'Inactiva'}
                </span>
              )}
            </div>
            <p className="text-[#6B7280] text-[11px] sm:text-sm mt-0.5">
              {status?.enabled
                ? `Al iniciar sesión se pide un código de tu app autenticadora. Te quedan ${status.backupCodesRemaining} códigos de respaldo.`
                : 'Pide un código de 6 dígitos de una app como Google Authenticator al iniciar sesión.'}
            </p>
          </div>
        </div>

        {status && mode === 'idle' && !status.enabled && (
          <button
            onClick={startSetup}
            disabled={busy || !status.hasPassword}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-[#111827] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#1F2937] disabled:opacity-50 transition-colors"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Activar
          </button>
        )}
      </div>

      {status && !status.hasPassword && !status.enabled && (
        <p className="mt-3 text-xs text-amber-700">
          Tu cuenta entra con Google y no tiene contraseña; agrega una para poder activar la verificación en dos pasos.
        </p>
      )}

      {status?.enabled && mode === 'idle' && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => reset('regenerate')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-xs sm:text-sm rounded-xl hover:bg-[#F3F4F6] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Nuevos códigos de respaldo
          </button>
          <button
            onClick={() => reset('disable')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 text-xs sm:text-sm rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <ShieldOff className="w-4 h-4" />
            Desactivar
          </button>
        </div>
      )}

      {error && mode === 'idle' && <p className="mt-3 text-xs text-red-500">{error}</p>}

      <AnimatePresence mode="wait" initial={false}>
        {mode !== 'idle' && (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: easeOut } }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
            className="mt-4 pt-4 border-t border-[#E5E7EB]"
          >
            {/* Setup: scan, then confirm with the first code */}
            {mode === 'setup' && (
              <div className="space-y-5">
                <ol className="space-y-1 text-xs sm:text-sm text-[#374151] list-decimal list-inside">
                  <li>Abre Google Authenticator, Authy o 1Password en tu celular.</li>
                  <li>Escanea el código QR o escribe la clave manualmente.</li>
                  <li>Ingresa el código de 6 dígitos que te muestra la app.</li>
                </ol>

                {setup ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* QR stays black on white in both themes so phone cameras read it */}
                    <div
                      className="w-44 h-44 flex-shrink-0 rounded-xl p-2 ring-1 ring-black/5 [&_svg]:w-full [&_svg]:h-full"
                      style={{ backgroundColor: '#FFFFFF' }}
                      dangerouslySetInnerHTML={{ __html: setup.qrSvg }}
                    />
                    <div className="min-w-0 w-full">
                      <p className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        ¿No puedes escanear? Escribe esta clave:
                      </p>
                      <button
                        onClick={() => copy(setup.secret.replace(/\s/g, ''), 'secret')}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl font-mono text-xs sm:text-sm text-[#111827] text-left break-all hover:border-[#D1D5DB] transition-colors"
                      >
                        <span>{setup.secret}</span>
                        {copied === 'secret' ? (
                          <Check className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4 flex-shrink-0 text-[#9CA3AF]" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#9CA3AF]" />
                  </div>
                )}

                {setup && (
                  <div className="flex justify-center">{otpField(confirmSetup, 'Código de tu app autenticadora')}</div>
                )}

                <div className="flex justify-center">
                  <button onClick={() => reset()} className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Backup codes, shown once right after enabling or regenerating */}
            {mode === 'codes' && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Guarda tus códigos de respaldo</p>
                  <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                    Si pierdes tu celular, cada código te deja entrar una vez. Solo se muestran ahora.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3 bg-white border border-[#E5E7EB] rounded-xl">
                  {backupCodes.map((backup) => (
                    <code key={backup} className="font-mono text-xs sm:text-sm text-[#111827] text-center py-1">
                      {backup}
                    </code>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => copy(backupCodes.join('\n'), 'codes')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-xs sm:text-sm rounded-xl hover:bg-[#F3F4F6] transition-colors"
                  >
                    {copied === 'codes' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    Copiar
                  </button>
                  <button
                    onClick={downloadCodes}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-xs sm:text-sm rounded-xl hover:bg-[#F3F4F6] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>
                  <button
                    onClick={() => {
                      setBackupCodes([])
                      reset()
                    }}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 bg-[#111827] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#1F2937] transition-colors"
                  >
                    Ya los guardé
                  </button>
                </div>
              </div>
            )}

            {mode === 'regenerate' && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-[#6B7280] text-center">
                  Ingresa un código de tu app. Los códigos de respaldo anteriores dejarán de funcionar.
                </p>
                <div className="flex justify-center">{otpField(regenerate, 'Código de tu app autenticadora')}</div>
                <div className="flex justify-center">
                  <button onClick={() => reset()} className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Disable needs the password and a code, so a hijacked session alone can't turn it off */}
            {mode === 'disable' && (
              <form onSubmit={disable} className="space-y-4">
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  Confirma con tu contraseña y un código de tu app para desactivar la verificación en dos pasos.
                </p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent transition-all"
                />
                <div className="flex justify-center">
                  <OTPInput
                    value={code}
                    onChange={(value) => {
                      setCode(value)
                      if (codeStatus === 'error') {
                        setCodeStatus('idle')
                        setError('')
                      }
                    }}
                    status={codeStatus}
                    errorMessage={error}
                    hint="Código de tu app autenticadora"
                    slotClassName="h-12 w-10 sm:h-14 sm:w-12"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="px-3 py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={busy || !password || code.length !== 6}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                    Desactivar
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
