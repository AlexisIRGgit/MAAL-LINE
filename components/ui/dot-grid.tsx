import { cn } from '@/lib/utils/cn'

/** Dotted grid backdrop (as in uiarc's hero section) that fades out toward the edges. Place inside a `relative` parent. */
export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundPosition: 'center',
        maskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, black 35%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 45%, black 35%, transparent 85%)',
      }}
    />
  )
}
