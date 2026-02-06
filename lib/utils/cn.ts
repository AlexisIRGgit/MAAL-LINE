import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-accent-primary', className)
 * cn('text-white', { 'font-bold': isBold, 'text-sm': isSmall })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
