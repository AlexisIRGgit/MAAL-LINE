import { cn } from '@/lib/utils/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'new' | 'restock' | 'bestseller' | 'soldout' | 'sale' | 'limited'
  size?: 'xs' | 'sm' | 'md'
}

export function Badge({
  className,
  variant = 'new',
  size = 'sm',
  ...props
}: BadgeProps) {
  const variants = {
    new: 'bg-[#E8E4D9] text-[#0A0A0A]',
    restock: 'bg-[#C9A962] text-[#0A0A0A]',
    bestseller: 'bg-[#0A0A0A] text-[#E8E4D9] border border-[#E8E4D9]',
    soldout: 'bg-[#2A2A2A] text-[#6B6860]',
    sale: 'bg-[#E8E4D9] text-[#0A0A0A]',
    limited: 'bg-transparent border-2 border-[#E8E4D9] text-[#E8E4D9]',
  }

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-3 py-1 text-[10px]',
    md: 'px-4 py-1.5 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold uppercase tracking-[0.15em]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
