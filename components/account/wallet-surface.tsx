import type { StatusTone } from '@/components/account/order-status'

/**
 * Wallet-style card surface (same family as address-card.tsx): a soft light gradient
 * in light mode and the help banner's slate gradient (#111827 -> #374151) in dark mode.
 */
export const walletSurfaceAdaptive =
  'relative overflow-hidden bg-gradient-to-br from-white via-[#FAFAFB] to-[#F1F2F5] text-[#111827] shadow-[0_8px_24px_-16px_rgba(17,24,39,0.25)] ring-1 ring-black/[0.06] dark:bg-gradient-to-r dark:from-[#111827] dark:via-[#242C3C] dark:to-[#374151] dark:text-white dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] dark:ring-white/[0.06]'

// Icon tiles with a soft glow in the tone color
export const walletToneTileAdaptive: Record<StatusTone, string> = {
  amber: 'bg-amber-50 border-amber-200 text-amber-600 shadow-[0_0_16px_-6px_rgba(245,158,11,0.45)] dark:bg-amber-400/10 dark:border-amber-400/25 dark:text-amber-300',
  blue: 'bg-sky-50 border-sky-200 text-sky-600 shadow-[0_0_16px_-6px_rgba(14,165,233,0.45)] dark:bg-sky-400/10 dark:border-sky-400/25 dark:text-sky-300',
  green: 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-[0_0_16px_-6px_rgba(16,185,129,0.45)] dark:bg-emerald-400/10 dark:border-emerald-400/25 dark:text-emerald-300',
  red: 'bg-rose-50 border-rose-200 text-rose-600 shadow-[0_0_16px_-6px_rgba(244,63,94,0.45)] dark:bg-rose-400/10 dark:border-rose-400/25 dark:text-rose-300',
  neutral: 'bg-black/[0.03] border-black/10 text-[#6B7280] dark:bg-white/5 dark:border-white/10 dark:text-white/70',
}

/** Orange hover glow (soft wash plus a cursor spotlight); place inside a `group` wallet surface. */
export function WalletDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        background:
          'radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), rgba(255,61,0,0.24), transparent 70%), linear-gradient(135deg, rgba(255,61,0,0.10), rgba(255,61,0,0.03))',
      }}
    />
  )
}

/** Mouse-move handler that feeds the spotlight position through CSS variables. */
export function trackSpotlight(event: React.MouseEvent<HTMLElement>) {
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--x', `${event.clientX - rect.left}px`)
  el.style.setProperty('--y', `${event.clientY - rect.top}px`)
}
