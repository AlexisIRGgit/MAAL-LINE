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
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827] focus-visible:ring-offset-2 focus-visible:ring-offset-white
      disabled:opacity-50 disabled:pointer-events-none
      active:scale-[0.98]
    `

    const variants = {
      // Primary - Dark/black, flat and clean
      primary: `
        bg-[#111827] text-white
        hover:bg-[#1F2937]
        border-2 border-[#111827]
        hover:border-[#1F2937]
        shadow-sm hover:shadow-sm
      `,
      // Secondary - White with dark border
      secondary: `
        bg-white border-2 border-[#E5E7EB] text-[#111827]
        hover:bg-[#F9FAFB] hover:border-[#D1D5DB]
      `,
      // Ghost - Transparent
      ghost: `
        bg-transparent text-[#6B7280]
        hover:bg-[#F3F4F6] hover:text-[#111827]
      `,
      // Outline - Dark outline
      outline: `
        bg-transparent text-[#111827] border-2 border-[#E5E7EB]
        hover:border-[#111827] hover:bg-[#F9FAFB]
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
