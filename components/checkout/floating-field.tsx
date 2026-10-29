'use client'

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export interface FloatingFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string
  /** Green border once a value is confirmed (e.g. a coupon), red with `error` */
  tone?: 'default' | 'success'
  error?: string | null
  hint?: string | null
  /** Icon or button inside the field, on the right */
  trailing?: ReactNode
  leading?: ReactNode
}

/**
 * Checkout text field: 56px tall, 16px corners, and the label lives inside the field.
 * It sits where the text goes while empty and floats up, smaller, as soon as there is a value or focus.
 */
export const FloatingField = forwardRef<HTMLInputElement, FloatingFieldProps>(function FloatingField(
  { label, tone = 'default', error, hint, trailing, leading, className, id: idProp, ...props },
  ref
) {
  const autoId = useId()
  const id = idProp ?? autoId
  const messageId = `${id}-message`
  const message = error || hint

  return (
    <div className={className}>
      <div className="relative">
        {leading && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">{leading}</span>}
        <input
          ref={ref}
          id={id}
          // A blank placeholder lets CSS tell an empty field from a filled one
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            'peer block h-14 w-full rounded-2xl border px-4 pb-1 pt-[28px] text-[15px] leading-5 font-medium text-[#111827] outline-none transition-[border-color,box-shadow,background-color] duration-150',
            'bg-[#F3F4F6] dark:bg-white/[0.05] dark:text-white',
            'focus:bg-white focus:shadow-[0_0_0_3px_rgba(17,24,39,0.06)] dark:focus:bg-white/[0.07] dark:focus:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]',
            leading && 'pl-11',
            trailing && 'pr-14',
            error
              ? 'border-red-400 focus:border-red-500 dark:border-red-400/70'
              : tone === 'success'
                ? 'border-emerald-500 bg-emerald-50/60 focus:border-emerald-500 dark:border-emerald-400/70 dark:bg-emerald-400/[0.06]'
                : 'border-transparent focus:border-[#111827] dark:border-white/[0.06] dark:focus:border-white/60'
          )}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute top-1/2 origin-left -translate-y-1/2 text-[15px] text-[#6B7280] transition-all duration-150 dark:text-white/50',
            leading ? 'left-11' : 'left-4',
            // Floats up and shrinks while focused or filled
            'peer-focus:top-[7px] peer-focus:translate-y-0 peer-focus:text-xs',
            'peer-[:not(:placeholder-shown)]:top-[7px] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs',
            tone === 'success' && !error && 'text-emerald-700 dark:text-emerald-300'
          )}
        >
          {label}
        </label>
        {trailing && <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">{trailing}</span>}
      </div>
      {message && (
        <p id={messageId} className={cn('mt-1.5 px-1 text-xs', error ? 'text-red-500 dark:text-red-400' : 'text-[#6B7280] dark:text-white/50')}>
          {message}
        </p>
      )}
    </div>
  )
})
