'use client'

import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    xs: { width: 72, height: 29 },
    sm: { width: 80, height: 32 },
    md: { width: 120, height: 48 },
    lg: { width: 160, height: 64 },
  }

  return (
    <Image
      src="/images/logo-maal-negro.png"
      alt="MAAL Line"
      width={sizes[size].width}
      height={sizes[size].height}
      className={`object-contain ${className}`}
      priority
    />
  )
}

export function LogoText({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/images/logo-maal-negro.png"
      alt="MAAL Line"
      width={100}
      height={40}
      className={`object-contain ${className}`}
    />
  )
}
