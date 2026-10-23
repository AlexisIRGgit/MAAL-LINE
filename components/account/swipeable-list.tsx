'use client'

import { useEffect, useRef } from 'react'
import { motion, animate, useMotionValue, useReducedMotion, type PanInfo } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type SwipeSide = 'left' | 'right'
export type SwipeActionTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

export interface SwipeAction {
  id: string
  label: string
  icon: LucideIcon
  tone?: SwipeActionTone
  onAction: () => void
}

const ACTION_WIDTH = 56
const REVEAL_THRESHOLD = 34
const FLICK_VELOCITY = 500
const settleSpring = { type: 'spring' as const, stiffness: 560, damping: 48, mass: 0.82 }

const actionToneStyles: Record<SwipeActionTone, string> = {
  neutral: 'text-[#6B7280] hover:text-[#111827]',
  primary: 'text-[#111827]',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-rose-400',
}

function ActionRail({
  actions,
  side,
  isOpen,
  onClose,
}: {
  actions: SwipeAction[]
  side: SwipeSide
  isOpen: boolean
  onClose: () => void
}) {
  if (actions.length === 0) return null

  return (
    <div
      aria-hidden={!isOpen}
      className={cn('absolute inset-y-0 flex', side === 'left' ? 'left-0' : 'right-0')}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          tabIndex={isOpen ? 0 : -1}
          onClick={() => {
            action.onAction()
            onClose()
          }}
          aria-label={action.label}
          title={action.label}
          className={cn(
            'group/action flex items-center justify-center transition-colors',
            actionToneStyles[action.tone ?? 'neutral']
          )}
          style={{ width: ACTION_WIDTH }}
        >
          <span className="h-9 w-9 flex items-center justify-center rounded-full transition-[background-color,transform] duration-150 group-hover/action:bg-white dark:group-hover/action:bg-white/10 group-active/action:scale-90">
            <action.icon className="w-4 h-4" />
          </span>
          <span className="sr-only">{action.label}</span>
        </button>
      ))}
    </div>
  )
}

export function SwipeableRow({
  label,
  openSide,
  onOpenChange,
  leftActions = [],
  rightActions = [],
  onSelect,
  children,
}: {
  label: string
  openSide: SwipeSide | null
  onOpenChange: (side: SwipeSide | null) => void
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  onSelect?: () => void
  children: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  // A drag must never count as a tap, so track movement since the pointer went down
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const didDrag = useRef(false)
  const leftWidth = leftActions.length * ACTION_WIDTH
  const rightWidth = rightActions.length * ACTION_WIDTH

  // Keep the surface in sync with the controlled open side
  useEffect(() => {
    const target = openSide === 'left' ? leftWidth : openSide === 'right' ? -rightWidth : 0
    if (reduceMotion) {
      x.set(target)
      return
    }
    const controls = animate(x, target, settleSpring)
    return () => controls.stop()
  }, [openSide, leftWidth, rightWidth, reduceMotion, x])

  const handleDragEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    const offset = x.get()
    const velocity = info.velocity.x
    const isFlick = Math.abs(velocity) > FLICK_VELOCITY && Math.abs(offset) > 14

    const resolve = (): SwipeSide | null => {
      if (openSide === 'right') {
        if (velocity > FLICK_VELOCITY || offset > -rightWidth * 0.72) return null
        return 'right'
      }
      if (openSide === 'left') {
        if (velocity < -FLICK_VELOCITY || offset < leftWidth * 0.72) return null
        return 'left'
      }
      if (offset < 0 && rightWidth > 0 && (isFlick || -offset > Math.max(REVEAL_THRESHOLD, rightWidth * 0.46))) return 'right'
      if (offset > 0 && leftWidth > 0 && (isFlick || offset > Math.max(REVEAL_THRESHOLD, leftWidth * 0.46))) return 'left'
      return null
    }

    const next = resolve()
    const target = next === 'left' ? leftWidth : next === 'right' ? -rightWidth : 0
    if (next === openSide) {
      // Same state: still settle back to the resting position, carrying the release velocity
      animate(x, target, { ...settleSpring, velocity: Math.max(-1500, Math.min(1500, velocity)) })
    }
    onOpenChange(next)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' && rightWidth > 0) {
      event.preventDefault()
      onOpenChange(openSide === 'right' ? null : openSide === 'left' ? null : 'right')
    } else if (event.key === 'ArrowRight' && leftWidth > 0) {
      event.preventDefault()
      onOpenChange(openSide === 'left' ? null : openSide === 'right' ? null : 'left')
    } else if (event.key === 'Escape' && openSide) {
      onOpenChange(null)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect?.()
    }
  }

  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-[#F3F4F6]">
      <ActionRail actions={leftActions} side="left" isOpen={openSide === 'left'} onClose={() => onOpenChange(null)} />
      <ActionRail actions={rightActions} side="right" isOpen={openSide === 'right'} onClose={() => onOpenChange(null)} />

      <motion.div
        role="button"
        tabIndex={0}
        aria-label={`${label}. Flechas para ver acciones`}
        drag="x"
        dragElastic={0.04}
        dragMomentum={false}
        dragConstraints={{ left: -rightWidth, right: leftWidth }}
        style={{ x }}
        onPointerDown={(event) => {
          pointerStart.current = { x: event.clientX, y: event.clientY }
          didDrag.current = false
        }}
        onDragStart={() => {
          didDrag.current = true
          // Starting a drag on another row closes whichever row was open
          if (!openSide) onOpenChange(null)
        }}
        onDragEnd={handleDragEnd}
        onTap={(_event, info) => {
          const start = pointerStart.current
          const moved = start ? Math.hypot(info.point.x - start.x - window.scrollX, info.point.y - start.y - window.scrollY) : 0
          if (didDrag.current || moved > 6) return
          if (openSide) onOpenChange(null)
          else onSelect?.()
        }}
        onKeyDown={handleKeyDown}
        className="relative flex items-center min-h-[72px] rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm touch-pan-y cursor-grab active:cursor-grabbing select-none outline-none focus-visible:ring-2 focus-visible:ring-[#111827]"
      >
        <div className="w-full">{children}</div>
      </motion.div>
    </div>
  )
}
