'use client'

import Image from 'next/image'
import { useBrand } from '@/components/providers/brand-provider'

interface LogoProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const brand = useBrand()
  const sizes = {
    xs: { width: 72, height: 29 },
    sm: { width: 80, height: 32 },
    md: { width: 120, height: 48 },
    lg: { width: 160, height: 64 },
  }
  const mercaditoSizes = {
    xs: { width: 76, height: 56 },
    sm: { width: 88, height: 64 },
    md: { width: 120, height: 88 },
    lg: { width: 160, height: 117 },
  }

  if (brand === 'mercadito') {
    return (
      <Image
        src="/images/mercadito/logo.png"
        alt="El Mercadito by MAAL"
        width={mercaditoSizes[size].width}
        height={mercaditoSizes[size].height}
        className={`object-contain ${className}`}
        priority
      />
    )
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
