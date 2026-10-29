'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { toast } from '@/lib/toast'

/**
 * Email signup for the Drop 001 waitlist. Rendered on a dark surface by default;
 * `adaptive` follows the site theme (light in light mode, dark in dark mode).
 */
export function WaitlistForm({ source, className, adaptive = false }: { source: 'home' | 'drop'; className?: string; adaptive?: boolean }) {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle')

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'saving') return
    setStatus('saving')
    try {
      const res = await fetch('/api/drop/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, website }),
      })
      const data = (await res.json().catch(() => ({}))) as { already?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error || 'No pudimos guardarte. Intenta de nuevo.')
      setStatus('done')
      toast.success(
        data.already ? 'Ya estabas en la lista' : 'Estás en la lista',
        'Te avisamos antes que a nadie cuando salga el Drop 001.',
        2500
      )
    } catch (error) {
      setStatus('idle')
      toast.error(error instanceof Error ? error.message : 'No pudimos guardarte. Intenta de nuevo.')
    }
  }

  if (status === 'done') {
    return (
      <div
        role="status"
        className={cn(
          'mx-auto flex max-w-lg items-center justify-center gap-3 rounded-2xl border px-5 py-4',
          adaptive
            ? 'border-black/10 bg-white text-[#111827] shadow-sm dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:shadow-none'
            : 'border-white/15 bg-white/[0.06] text-white',
          className
        )}
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FF3D00]">
          <Check className="h-4 w-4 text-white" />
        </span>
        <p className={cn('text-sm', adaptive ? 'text-[#374151] dark:text-white/80' : 'text-white/80')}>
          <strong className={adaptive ? 'text-[#111827] dark:text-white' : 'text-white'}>{email}</strong> ya está en la lista de espera.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={cn('mx-auto max-w-lg', className)}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`waitlist-${source}`} className="sr-only">
          Tu correo
        </label>
        <input
          id={`waitlist-${source}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={255}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@email.com"
          className={cn(
            'h-14 w-full min-w-0 sm:flex-1 rounded-xl border px-5 outline-none transition-colors',
            adaptive
              ? 'border-black/10 bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:border-black/40 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/50'
              : 'border-white/15 bg-white/[0.06] text-white placeholder:text-white/40 focus:border-white/50'
          )}
        />
        {/* Honeypot: hidden from people, filled by bots */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          className="hidden"
        />
        <button
          type="submit"
          disabled={status === 'saving'}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#FF3D00] px-7 text-sm font-bold tracking-[0.15em] text-white transition-colors hover:bg-[#E63600] disabled:opacity-70"
        >
          {status === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
          QUIERO ACCESO
        </button>
      </div>
      <p className={cn('mt-4 text-xs tracking-wider', adaptive ? 'text-[#6B7280] dark:text-white/40' : 'text-white/40')}>Sin spam. Solo te escribimos cuando haya algo que valga la pena.</p>
    </form>
  )
}
