'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

// Visual model follows uiarc's Stepper (uiarc.dev/components/stepper): a numbered disc,
// a ring that grows around the current step, a drawn check once complete, and connectors
// that fill on a spring (one after another when progress jumps several steps).

export interface StepperStep {
  id: string
  label: string
  description?: string
}

const STAGGER = 0.08
const still = { duration: 0 } as const
const leave = { duration: 0.12, ease: [0.4, 0, 1, 1] } as const
const snappy = { type: 'spring', stiffness: 520, damping: 32 } as const
const smooth = { type: 'spring', stiffness: 260, damping: 32 } as const

function Glyph({ complete, number, delay, reduced }: { complete: boolean; number: number; delay: number; reduced: boolean }) {
  const from = { opacity: 0, scale: 0.5, filter: 'blur(2px)' }
  const rest = { opacity: 1, scale: 1, filter: 'blur(0px)' }
  const pop = reduced ? still : { scale: { ...snappy, delay }, opacity: { duration: 0.12, delay }, filter: { duration: 0.12, delay } }
  const exit = { ...from, transition: reduced ? still : leave }

  if (!complete) {
    return (
      <motion.span key="number" className="col-start-1 row-start-1" initial={from} animate={rest} exit={exit} transition={pop}>
        {number}
      </motion.span>
    )
  }
  return (
    <motion.svg
      key="check"
      className="col-start-1 row-start-1 w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={from}
      animate={rest}
      exit={exit}
      transition={pop}
    >
      <motion.path
        d="M5.5 12.5l4.25 4.25L18.5 8"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduced ? still : { duration: 0.24, ease: [0, 0, 0.2, 1], delay: delay + 0.04 }}
      />
    </motion.svg>
  )
}

export function Stepper({
  steps,
  current,
  onStepSelect,
  className,
}: {
  steps: StepperStep[]
  /** Index of the step in progress; `steps.length` marks the flow complete */
  current: number
  /** Called with a completed step's index when it is chosen */
  onStepSelect?: (index: number) => void
  className?: string
}) {
  const reduced = useReducedMotion() ?? false
  const count = steps.length
  const active = Math.min(Math.max(current, 0), count)

  // Remember where progress came from so multi-step jumps fill connectors in sequence
  const [travel, setTravel] = useState({ to: active, from: active })
  if (travel.to !== active) setTravel({ to: active, from: travel.to })
  const from = travel.from
  const delayAt = (index: number) => {
    if (reduced) return 0
    if (active > from) return index >= from && index < active ? (index - from) * STAGGER : 0
    return index >= active && index < from ? (from - 1 - index) * STAGGER : 0
  }
  const ringDelay = reduced ? 0 : Math.max(0, Math.abs(active - from) - 1) * STAGGER + 0.12

  const handleKeyDown = (event: React.KeyboardEvent<HTMLOListElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    const targets = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button[data-reachable]'))
    const at = targets.indexOf(event.target as HTMLButtonElement)
    if (at < 0) return
    event.preventDefault()
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? targets.length - 1 : event.key === 'ArrowLeft' ? Math.max(0, at - 1) : Math.min(targets.length - 1, at + 1)
    targets[next]?.focus()
  }

  return (
    <nav aria-label="Progreso" className={cn('w-full', className)}>
      <ol
        className="grid"
        style={{ gridTemplateColumns: count > 1 ? `repeat(${count - 1}, minmax(0, 1fr)) auto` : 'auto' }}
        onKeyDown={handleKeyDown}
      >
        {steps.map((step, index) => {
          const isCurrent = index === active
          const isComplete = index < active
          const clickable = !!onStepSelect && isComplete

          return (
            <li key={step.id} className={cn('relative min-w-0', index < count - 1 && 'pr-3')}>
              {/* Connector: fixed track, spring-filled from the step just finished */}
              {index < count - 1 && (
                <span
                  aria-hidden
                  className="absolute top-[13px] left-[38px] right-[8px] h-[2px] overflow-hidden rounded-full bg-[#E5E7EB] dark:bg-white/10"
                >
                  <motion.span
                    className="absolute inset-0 origin-left rounded-full bg-[#FF3D00]"
                    initial={false}
                    animate={{ scaleX: isComplete ? 1 : 0 }}
                    transition={reduced ? still : { ...smooth, delay: delayAt(index) }}
                  />
                </span>
              )}

              <button
                type="button"
                data-reachable={index <= active || undefined}
                aria-current={isCurrent ? 'step' : undefined}
                aria-disabled={clickable ? undefined : true}
                tabIndex={clickable ? undefined : -1}
                onClick={clickable ? () => onStepSelect?.(index) : undefined}
                className={cn(
                  'group/step grid w-fit max-w-full justify-items-start gap-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[#FF3D00]/60 focus-visible:ring-offset-4',
                  clickable ? 'cursor-pointer' : 'cursor-default'
                )}
              >
                {/* Marker: ring grows from behind the disc on the current step */}
                <span aria-hidden className="relative grid h-7 w-7 place-items-center">
                  <AnimatePresence initial={false}>
                    {isCurrent && (
                      <motion.span
                        key="ring"
                        className="absolute -inset-1 rounded-full bg-[#FF3D00]/15"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6, transition: reduced ? still : leave }}
                        transition={reduced ? still : { scale: { ...snappy, delay: ringDelay }, opacity: { duration: 0.12, delay: ringDelay } }}
                      />
                    )}
                  </AnimatePresence>
                  <span
                    className={cn(
                      'relative grid h-full w-full place-items-center rounded-full text-xs font-medium tabular-nums transition-[background-color,box-shadow,color,transform] duration-200',
                      isComplete
                        ? 'bg-[#FF3D00] text-white shadow-[inset_0_0_0_1px_#FF3D00] group-hover/step:bg-[#E63600]'
                        : isCurrent
                          ? 'bg-white text-[#111827] shadow-[inset_0_0_0_1.5px_#FF3D00] dark:bg-[#22252D] dark:text-white'
                          : 'bg-white text-[#9CA3AF] shadow-[inset_0_0_0_1px_#D1D5DB] dark:bg-[#22252D] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]',
                      clickable && 'group-active/step:scale-90'
                    )}
                  >
                    <AnimatePresence initial={false}>
                      <Glyph key={isComplete ? 'check' : 'number'} complete={isComplete} number={index + 1} delay={delayAt(index)} reduced={reduced} />
                    </AnimatePresence>
                  </span>
                </span>

                <span className="grid min-w-0">
                  <span
                    className={cn(
                      'block text-xs sm:text-sm font-medium leading-5 transition-colors break-words',
                      isCurrent ? 'text-[#111827]' : isComplete ? 'text-[#374151] group-hover/step:text-[#111827]' : 'text-[#9CA3AF]'
                    )}
                  >
                    {step.label}
                  </span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {isCurrent && step.description && (
                      <motion.span
                        key={step.description}
                        className="hidden sm:block pt-0.5 text-xs text-[#6B7280]"
                        initial={{ opacity: 0, y: '0.3em', filter: 'blur(2px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: '-0.3em', filter: 'blur(1px)', transition: reduced ? still : leave }}
                        transition={reduced ? still : { duration: 0.24, ease: [0, 0, 0.2, 1] }}
                      >
                        {step.description}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isComplete && <span className="sr-only">, completado</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <span className="sr-only" aria-live="polite">
        {active < count ? `Paso ${active + 1} de ${count}: ${steps[active].label}` : 'Todos los pasos completados'}
      </span>
    </nav>
  )
}
