/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { cn } from '@/lib/styles'
import Image from 'next/image'

interface LogoProps {
  readonly className?: string
  readonly classNameIcon?: string
  readonly classNameLabel?: string
  readonly showText?: boolean
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  readonly customSize?: number
}

export function Logo({ className, classNameIcon, classNameLabel, showText = false, size = 'md', customSize }: LogoProps) {
  const sizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-12',
    xl: 'size-16',
    '2xl': 'size-20',
    '3xl': 'size-24',
  }

  const imageSizeClasses: Record<NonNullable<LogoProps['size']>, number> = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
    '2xl': 80,
    '3xl': 96,
  }

  const textSizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  }

  const logoSize = customSize ?? 120
  const logoSizePx = `${logoSize}px`

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      className={cn('flex flex-row items-center justify-center gap-2 cursor-pointer bg-transparent border-none p-0', className)}
      aria-label='Scroll to top'
    >
      {/* Logo MỸ THUẬT CMC */}
      <div className={cn('flex items-center gap-3', classNameIcon)}>
        {/* Logo Image */}
        <div
          className='relative flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]'
          style={{ width: logoSizePx, height: logoSizePx }}
        >
          <Image
            src='/assets/logocmc.png'
            alt='MỸ THUẬT CMC'
            width={logoSize}
            height={logoSize}
            className='h-full w-full object-contain'
            priority
          />
        </div>
      </div>
    </button>
  )
}
