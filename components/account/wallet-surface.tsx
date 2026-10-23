import { cn } from '@/lib/utils/cn'
import type { StatusTone } from '@/components/account/order-status'

/**
 * Shared look of the wallet-style account cards (see address-card.tsx):
 * a cool-black gradient that stays dark in both themes. The `dark` class
 * scopes Tailwind dark: variants inside, so shared tone styles render their dark tuning.
 */
export const walletSurface =
  'dark relative overflow-hidden bg-gradient-to-br from-[#16181D] via-[#0E0F13] to-[#0A0A0A] text-white shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06]'

// Icon tiles with a soft glow in the tone color
export const walletToneTile: Record<StatusTone, string> = {
  amber: 'bg-amber-400/10 border-amber-400/25 text-amber-300 shadow-[0_0_16px_-4px_rgba(251,191,36,0.45)]',
  blue: 'bg-sky-400/10 border-sky-400/25 text-sky-300 shadow-[0_0_16px_-4px_rgba(56,189,248,0.45)]',
  green: 'bg-emerald-400/10 border-emerald-400/25 text-emerald-300 shadow-[0_0_16px_-4px_rgba(52,211,153,0.45)]',
  red: 'bg-rose-400/10 border-rose-400/25 text-rose-300 shadow-[0_0_16px_-4px_rgba(251,113,133,0.45)]',
  neutral: 'bg-white/5 border-white/10 text-white/70',
}

/** Inner dashed frame and cursor spotlight; place inside a `group` wallet surface. */
export function WalletDecor({ radius = 'rounded-[15px]', spotlight = true }: { radius?: string; spotlight?: boolean }) {
  return (
    <>
      {spotlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(200px circle at var(--x, 50%) var(--y, 50%), rgba(255,61,0,0.12), transparent 65%)' }}
        />
      )}
      <div aria-hidden className={cn('pointer-events-none absolute inset-1.5 border border-dashed border-white/[0.08]', radius)} />
    </>
  )
}

/** Mouse-move handler that feeds the spotlight position through CSS variables. */
export function trackSpotlight(event: React.MouseEvent<HTMLElement>) {
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--x', `${event.clientX - rect.left}px`)
  el.style.setProperty('--y', `${event.clientY - rect.top}px`)
}
