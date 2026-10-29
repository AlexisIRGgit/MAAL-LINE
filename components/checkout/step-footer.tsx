import type { ReactNode } from 'react'

/** Bottom bar of each checkout step; sticks to the bottom of the scrolling modal */
export function StepFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-5 mt-6 flex items-center gap-3 border-t border-[#E5E7EB] bg-white/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-md dark:border-white/10 dark:bg-[#16181D]/90 sm:-mx-6 sm:px-6">
      {children}
    </div>
  )
}

export const PRIMARY_BUTTON =
  'inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FF3D00] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#E63600] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:min-w-[220px] sm:ml-auto'

export const SECONDARY_BUTTON =
  'inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] px-5 text-[15px] font-semibold text-[#374151] transition-colors hover:bg-[#F9FAFB] disabled:opacity-50 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/[0.05]'
