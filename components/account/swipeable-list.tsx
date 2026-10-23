'use client'

import { useEffect, useRef } from 'react'
import { motion, animate, useMotionValue, useReducedMotion, type PanInfo } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { walletSurface, WalletDecor, trackSpotlight } from '@/components/account/wallet-surface'

export type SwipeSide = 'left' | 'right'
export type SwipeActionTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

export interface SwipeAction {
  id: string
  label: string
  icon: LucideIcon
  tone?: SwipeActionTone
  onAction: () => void
}

const ACTION_WIDTH = 64
const REVEAL_THRESHOLD = 34
const FLICK_VELOCITY = 500
const settleSpring = { type: 'spring' as const, stiffness: 560, damping: 48, mass: 0.82 }

const actionToneStyles: Record<SwipeActionTone, string> = {
  neutral: 'text-white/60 hover:text-white',
  primary: 'text-white hover:text-white',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  danger: 'text-rose-400',
}

function ActionRail({ actions, side, isOpen }: { actions: SwipeAction[]; side: SwipeSide; isOpen: boolean }) {
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
          onClick={action.onAction}
          aria-label={action.label}
          className={cn(
            'group/action flex flex-col items-center justify-center gap-1 transition-colors',
            actionToneStyles[action.tone ?? 'neutral']
          )}
          style={{ width: ACTION_WIDTH }}
        >
          <span className="h-9 w-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-150 group-hover/action:bg-white/10 group-active/action:scale-90">
            <action.icon className="w-4 h-4" />
          </span>
          <span className="text-[9px] font-medium uppercase tracking-[0.12em]">{action.label}</span>
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
    <div className="relative isolate overflow-hidden rounded-[20px] bg-[#0B0C10] ring-1 ring-white/[0.06] dark">
      <ActionRail actions={leftActions} side="left" isOpen={openSide === 'left'} />
      <ActionRail actions={rightActions} side="right" isOpen={openSide === 'right'} />

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
        onMouseMove={trackSpotlight}
        className={cn(
          walletSurface,
          'group rounded-[20px] min-h-[76px] px-4 py-3 touch-pan-y cursor-grab active:cursor-grabbing select-none outline-none focus-visible:ring-2 focus-visible:ring-[#FF3D00]/60'
        )}
      >
        <WalletDecor />
        <div className="relative">{children}</div>
      </motion.div>
    </div>
  )
}
