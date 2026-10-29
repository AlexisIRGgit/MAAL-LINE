'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** The modal's fixed bottom bar; each step renders its buttons into it */
export const StepFooterSlot = createContext<HTMLElement | null>(null)

/**
 * Bottom bar of each checkout step. It renders outside the scrolling content (into the modal's footer slot),
 * so Atrás / Pagar stay visible however long the step is.
 */
export function StepFooter({ children }: { children: ReactNode }) {
  const slot = useContext(StepFooterSlot)
  if (!slot) return null
  return createPortal(<div className="flex items-center gap-3">{children}</div>, slot)
}

export const PRIMARY_BUTTON =
  'inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FF3D00] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#E63600] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:min-w-[220px] sm:ml-auto'

export const SECONDARY_BUTTON =
  'inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] px-5 text-[15px] font-semibold text-[#374151] transition-colors hover:bg-[#F9FAFB] disabled:opacity-50 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/[0.05]'
