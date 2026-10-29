import { cn } from '@/lib/utils/cn'

const MASK = 'radial-gradient(ellipse 75% 70% at 50% 45%, black 35%, transparent 85%)'

function dots(color: string) {
  return {
    backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    backgroundPosition: 'center',
    maskImage: MASK,
    WebkitMaskImage: MASK,
  }
}

/**
 * Dotted grid backdrop (as in uiarc's hero section) that fades out toward the edges. Place inside a `relative` parent.
 * `adaptive` draws dark dots in light mode and light dots in dark mode; otherwise the dots are always light.
 */
export function DotGrid({ className, adaptive = false }: { className?: string; adaptive?: boolean }) {
  const base = cn('pointer-events-none absolute inset-0', className)
  if (!adaptive) return <div aria-hidden className={base} style={dots('rgba(255,255,255,0.16)')} />
  return (
    <>
      <div aria-hidden className={cn(base, 'dark:hidden')} style={dots('rgba(17,24,39,0.14)')} />
      <div aria-hidden className={cn(base, 'hidden dark:block')} style={dots('rgba(255,255,255,0.16)')} />
    </>
  )
}
