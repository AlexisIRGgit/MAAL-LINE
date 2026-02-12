'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth,
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center font-bold
      uppercase tracking-[0.15em]
      transition-all duration-300 ease-out
      rounded-xl
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E4D9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]
      disabled:opacity-50 disabled:pointer-events-none
      active:scale-[0.98]
    `

    const variants = {
      // Primary - Cream button
      primary: `
        bg-[#E8E4D9] text-[#0A0A0A]
        hover:bg-[#D4D0C5]
        border-2 border-[#E8E4D9]
        hover:border-[#D4D0C5]
        shadow-lg hover:shadow-xl
      `,
      // Secondary - Dark with cream border
      secondary: `
        bg-transparent border-2 border-[#E8E4D9] text-[#E8E4D9]
        hover:bg-[#E8E4D9] hover:text-[#0A0A0A]
      `,
      // Ghost - Transparent
      ghost: `
        bg-transparent text-[#E8E4D9]/70
        hover:bg-[#E8E4D9]/10 hover:text-[#E8E4D9]
      `,
      // Outline - Cream outline with gold hover
      outline: `
        bg-transparent text-[#E8E4D9] border-2 border-[#E8E4D9]/50
        hover:border-[#C9A962] hover:text-[#C9A962]
        hover:bg-[#C9A962]/10
      `,
    }

    const sizes = {
      sm: 'h-10 px-5 text-xs',
      md: 'h-12 px-6 text-sm',
      lg: 'h-14 px-8 text-sm',
      xl: 'h-16 px-10 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : null}
        <span className="relative z-10">{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'
