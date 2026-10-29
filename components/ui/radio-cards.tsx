'use client'
// uiarc.dev/components/radio-cards, adapted to framer-motion and Tailwind

import { forwardRef, useCallback, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, type Transition } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export interface RadioCardOption {
  value: string
  label: ReactNode
  /** One or two short lines under the label. */
  description?: ReactNode
  /** A price, estimate, or other value. Sits at the end of a list row, or under the text in a grid card. */
  meta?: ReactNode
  /** Plain decorative icon beside the label. */
  icon?: ReactNode
  disabled?: boolean
  /** Short reason shown in place of the description when the option is disabled. */
  disabledReason?: ReactNode
}

/**
 * Selectable option cards for choices that need more than a label: plans, shipping speeds, payment methods.
 * One selection ring glides from card to card on a spring, so the eye follows the change. Behaves as a native
 * radio group: one tab stop, arrow keys move and select, and a hidden input carries the value in forms.
 */
export interface RadioCardsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: RadioCardOption[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
  /** "grid" places cards in responsive columns; "list" stacks full width rows. */
  layout?: 'grid' | 'list'
  /** Narrowest a grid column may get before the grid drops a column, in px. */
  minColumnWidth?: number
  /** Form field name. Renders a hidden input with the selected value. */
  name?: string
  required?: boolean
  disabled?: boolean
}

const physical = (visualDuration: number, bounce: number): Transition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: 'spring', stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 }
}
const GLIDE = physical(0.42, 0)
const SNAPPY = { type: 'spring', visualDuration: 0.26, bounce: 0 } as const

export const RadioCards = forwardRef<HTMLDivElement, RadioCardsProps>(function RadioCards(
  { options, value, defaultValue = null, onValueChange, layout = 'grid', minColumnWidth = 180, name, required, disabled = false, className, style, ...rest },
  forwardedRef
) {
  const reduced = !!useReducedMotion()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const rootRef = useRef<HTMLDivElement>(null)
  useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement)
  const [internal, setInternal] = useState<string | null>(defaultValue)
  const selected = value !== undefined ? value : internal
  const selectedIndex = options.findIndex((option) => option.value === selected)
  const usable = (option: RadioCardOption) => !disabled && !option.disabled
  const tabStop = selectedIndex >= 0 && usable(options[selectedIndex]) ? selectedIndex : options.findIndex(usable)
  const isGrid = layout === 'grid'

  const select = (next: string) => {
    if (next === selected) return
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  // The ring: one element that springs to the selected card's box. At rest it follows layout changes exactly.
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const w = useMotionValue(0)
  const h = useMotionValue(0)
  const o = useMotionValue(0)
  const placed = useRef(false)
  const place = useCallback(
    (spring: boolean) => {
      const node = selectedIndex < 0 ? null : rootRef.current?.querySelector<HTMLElement>(`[data-card="${selectedIndex}"]`)
      if (!node) {
        o.set(0)
        placed.current = false
        return
      }
      const box = [node.offsetLeft, node.offsetTop, node.offsetWidth, node.offsetHeight] as const
      if (!spring || !placed.current || reduced) {
        x.jump(box[0])
        y.jump(box[1])
        w.jump(box[2])
        h.jump(box[3])
        if (!placed.current && !reduced && spring) {
          o.jump(0)
          animate(o, 1, { duration: 0.16, ease: [0.22, 1, 0.36, 1] })
        } else o.jump(1)
        placed.current = true
        return
      }
      animate(x, box[0], GLIDE)
      animate(y, box[1], GLIDE)
      animate(w, box[2], GLIDE)
      animate(h, box[3], GLIDE)
      o.set(1)
    },
    [h, o, reduced, selectedIndex, w, x, y]
  )

  const placeRef = useRef(place)
  useLayoutEffect(() => {
    placeRef.current = place
    place(true)
  }, [place])
  // A resize only snaps the ring to the new layout; it never replays the glide.
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => placeRef.current(false))
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const cards = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[data-card]') ?? [])
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, index: number) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (usable(options[index])) select(options[index].value)
      return
    }
    if (!step && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const count = options.length
    let at = event.key === 'Home' ? -1 : event.key === 'End' ? count : index
    const dir = event.key === 'Home' ? 1 : event.key === 'End' ? -1 : step
    for (let tries = 0; tries < count; tries++) {
      at = (at + dir + count) % count
      if (usable(options[at])) {
        cards()[at]?.focus()
        select(options[at].value)
        return
      }
    }
  }

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-disabled={disabled || undefined}
      aria-required={required || undefined}
      className={cn('relative grid text-sm text-[#111827] dark:text-white', isGrid ? 'gap-2.5' : 'grid-cols-1 gap-2', className)}
      style={
        isGrid
          ? ({ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minColumnWidth}px), 1fr))`, ...style } as CSSProperties)
          : style
      }
      {...rest}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 rounded-[20px] border-[1.5px] border-[#111827] dark:border-white"
        style={{ x, y, width: w, height: h, opacity: o, zIndex: 1 }}
      />
      {options.map((option, index) => {
        const checked = index === selectedIndex
        const off = !usable(option)
        const labelId = `${uid}-${index}-label`
        const descriptionId = `${uid}-${index}-description`
        const description = off && option.disabledReason ? option.disabledReason : option.description
        return (
          <div
            key={option.value}
            role="radio"
            data-card={index}
            aria-checked={checked}
            aria-disabled={off || undefined}
            aria-labelledby={labelId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={index === tabStop ? 0 : -1}
            data-checked={checked || undefined}
            onClick={() => {
              if (!off) select(option.value)
            }}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              'relative grid min-w-0 cursor-pointer select-none gap-x-3 gap-y-1 rounded-[20px] border outline-none transition-colors duration-150 [-webkit-tap-highlight-color:transparent]',
              isGrid
                ? 'items-start px-4 py-3.5 [grid-template-areas:"body_indicator""meta_meta"] [grid-template-columns:minmax(0,1fr)_auto] [grid-template-rows:minmax(0,1fr)_auto]'
                : 'items-center py-[13px] pl-3.5 pr-4 [grid-template-areas:"indicator_body_meta"] [grid-template-columns:auto_minmax(0,1fr)_auto]',
              checked
                ? 'border-[#E5E7EB] bg-[#F9FAFB] dark:border-white/10 dark:bg-white/[0.06]'
                : 'border-[#E5E7EB] bg-white dark:border-white/10 dark:bg-white/[0.03]',
              off
                ? 'cursor-not-allowed bg-[#F3F4F6] dark:bg-white/[0.02]'
                : !checked && 'hover:border-[#D1D5DB] active:bg-[#F3F4F6] dark:hover:border-white/25 dark:active:bg-white/[0.05]',
              'focus-visible:border-[#9CA3AF] dark:focus-visible:border-white/30'
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'grid h-[18px] w-[18px] flex-none place-items-center rounded-full border-[1.5px] transition-colors duration-150 [grid-area:indicator]',
                isGrid && 'mt-px',
                checked
                  ? 'border-[#111827] bg-[#111827] dark:border-white dark:bg-white'
                  : off
                    ? 'border-[#E5E7EB] dark:border-white/10'
                    : 'border-[#D1D5DB] dark:border-white/25'
              )}
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-white dark:bg-[#111827]"
                initial={false}
                animate={{ scale: checked ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : SNAPPY}
              />
            </span>
            <span className="grid min-w-0 gap-0.5 [grid-area:body]">
              <span id={labelId} className={cn('flex min-w-0 items-center gap-2 font-medium', off && 'text-[#9CA3AF] dark:text-white/40')}>
                {option.icon && (
                  <span
                    className={cn(
                      'grid h-[18px] w-[18px] flex-none place-items-center [&>svg]:h-[18px] [&>svg]:w-[18px]',
                      checked ? 'text-[#111827] dark:text-white' : 'text-[#6B7280] dark:text-white/55'
                    )}
                  >
                    {option.icon}
                  </span>
                )}
                <span className="min-w-0 truncate">{option.label}</span>
              </span>
              {description && (
                <span id={descriptionId} className="text-xs text-[#6B7280] [text-wrap:pretty] dark:text-white/55">
                  {description}
                </span>
              )}
            </span>
            {option.meta && (
              <span
                className={cn(
                  'whitespace-nowrap tabular-nums [grid-area:meta]',
                  isGrid ? 'mt-2.5 text-lg' : 'font-medium',
                  off ? 'text-[#9CA3AF] dark:text-white/40' : 'text-[#111827] dark:text-white'
                )}
              >
                {option.meta}
              </span>
            )}
          </div>
        )
      })}
      {name && <input type="hidden" name={name} value={selected ?? ''} required={required} />}
    </div>
  )
})

export default RadioCards
