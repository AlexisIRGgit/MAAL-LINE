import { Clock, Truck, CheckCircle, XCircle, Package, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type StatusTone = 'amber' | 'blue' | 'green' | 'red' | 'neutral'

export interface OrderStatusInfo {
  label: string
  icon: LucideIcon
  tone: StatusTone
}

export function getOrderStatus(status: string): OrderStatusInfo {
  switch (status) {
    case 'processing':
      return { label: 'En proceso', icon: Clock, tone: 'amber' }
    case 'shipped':
      return { label: 'En camino', icon: Truck, tone: 'blue' }
    case 'delivered':
      return { label: 'Entregado', icon: CheckCircle, tone: 'green' }
    case 'cancelled':
      return { label: 'Cancelado', icon: XCircle, tone: 'red' }
    default:
      return { label: status, icon: Package, tone: 'neutral' }
  }
}

// Each tone is tuned separately for light and dark backgrounds
export const toneStyles: Record<StatusTone, { text: string; dot: string; tile: string }> = {
  amber: {
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500 dark:bg-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.18)]',
    tile: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-1 dark:ring-amber-400/20',
  },
  blue: {
    text: 'text-blue-600 dark:text-sky-400',
    dot: 'bg-blue-500 dark:bg-sky-400 shadow-[0_0_0_3px_rgba(59,130,246,0.18)]',
    tile: 'bg-blue-50 text-blue-600 dark:bg-sky-400/10 dark:text-sky-400 dark:ring-1 dark:ring-sky-400/20',
  },
  green: {
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]',
    tile: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-1 dark:ring-emerald-400/20',
  },
  red: {
    text: 'text-red-600 dark:text-rose-400',
    dot: 'bg-red-500 dark:bg-rose-400 shadow-[0_0_0_3px_rgba(239,68,68,0.18)]',
    tile: 'bg-red-50 text-red-600 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-1 dark:ring-rose-400/20',
  },
  neutral: {
    text: 'text-[#6B7280]',
    dot: 'bg-[#9CA3AF]',
    tile: 'bg-[#F3F4F6] text-[#6B7280] dark:ring-1 dark:ring-white/10',
  },
}

/** Status label without a pill: a glowing dot (or icon) plus tinted text. */
export function StatusIndicator({
  label,
  tone,
  icon: Icon,
  pulse = false,
  size = 'sm',
  className,
}: {
  label: string
  tone: StatusTone
  icon?: LucideIcon
  pulse?: boolean
  size?: 'sm' | 'md'
  className?: string
}) {
  const styles = toneStyles[tone]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium whitespace-nowrap',
        size === 'sm' ? 'text-xs' : 'text-sm',
        styles.text,
        className
      )}
    >
      {Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      ) : (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && <span className={cn('absolute inset-0 rounded-full opacity-60 animate-ping', styles.dot)} />}
          <span className={cn('relative h-1.5 w-1.5 rounded-full', styles.dot)} />
        </span>
      )}
      {label}
    </span>
  )
}

export function OrderStatusIndicator({ status, size, className }: { status: string; size?: 'sm' | 'md'; className?: string }) {
  const info = getOrderStatus(status)
  return (
    <StatusIndicator
      label={info.label}
      tone={info.tone}
      pulse={status === 'shipped'}
      size={size}
      className={className}
    />
  )
}

export function PaidIndicator({ size, className }: { size?: 'sm' | 'md'; className?: string }) {
  return <StatusIndicator label="Pagado" tone="green" icon={CheckCircle} size={size} className={className} />
}

/** Small separator between inline indicators. */
export function IndicatorDivider() {
  return <span aria-hidden className="h-3 w-px bg-[#E5E7EB]" />
}
