/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { cn } from '@/lib/styles'
import { NavigationLink } from '@/components/atoms/navigation-link'

interface LogoProps {
  readonly className?: string
  readonly classNameIcon?: string
  readonly classNameLabel?: string
  readonly showText?: boolean
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
}

export function Logo({ className, classNameIcon, classNameLabel, showText = false, size = 'md' }: LogoProps) {
  const sizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'size-6',
    md: 'size-8',
    lg: 'size-12',
    xl: 'size-16',
    '2xl': 'size-20',
    '3xl': 'size-24',
  }

  const textSizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  }

  return (
    <NavigationLink href='/'>
      <div className={cn('flex flex-row items-center justify-center gap-2', className)}>
        {/* Logo MỸ THUẬT CMC */}
        <div className={cn('flex items-center gap-3', classNameIcon)}>
          {/* 3D M with art tools */}
          <div className='relative flex-shrink-0' style={{ width: size === 'sm' ? '32px' : size === 'md' ? '40px' : size === 'lg' ? '48px' : size === 'xl' ? '56px' : size === '2xl' ? '64px' : '72px', height: size === 'sm' ? '32px' : size === 'md' ? '40px' : size === 'lg' ? '48px' : size === 'xl' ? '56px' : size === '2xl' ? '64px' : '72px' }}>
            <svg
              viewBox='0 0 80 80'
              className='w-full h-full'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              {/* 3D M - Front face (golden yellow #FFD700) */}
              <path
                d='M 15 15 L 15 55 L 24 55 L 24 32 L 40 55 L 56 32 L 56 55 L 65 55 L 65 15 L 56 15 L 40 38 L 24 15 Z'
                fill='#FFD700'
              />
              {/* 3D M - Top face (white) */}
              <path
                d='M 15 15 L 24 15 L 40 38 L 56 15 L 65 15 L 65 10 L 56 10 L 40 33 L 24 10 L 15 10 Z'
                fill='#FFFFFF'
              />
              {/* 3D M - Right face (white) */}
              <path
                d='M 65 15 L 65 55 L 70 55 L 70 15 Z'
                fill='#FFFFFF'
                opacity='0.85'
              />
              {/* Paintbrush inside M - angled right */}
              <g transform='translate(32, 20) rotate(20)'>
                <rect x='0' y='0' width='2.5' height='16' fill='#000000' />
                <rect x='-0.8' y='14' width='4.1' height='1.8' fill='#FFD700' />
                <ellipse cx='1.25' cy='18' rx='3.5' ry='2.5' fill='#000000' />
              </g>
              {/* Pencil inside M - angled left */}
              <g transform='translate(44, 24) rotate(-15)'>
                <rect x='0' y='0' width='2' height='14' fill='#000000' />
                <polygon points='0,0 2,0 1,2.5' fill='#FFD700' />
                <rect x='0.4' y='11' width='1.2' height='0.8' fill='#FFD700' />
                <rect x='0.4' y='12.2' width='1.2' height='0.8' fill='#FFD700' />
                <rect x='0.4' y='13.4' width='1.2' height='0.8' fill='#FFD700' />
              </g>
            </svg>
          </div>
          
          {/* Text MỸ THUẬT CMC */}
          {showText && (
            <div className={cn('flex flex-col leading-tight', classNameLabel)}>
              <span className={cn('text-white font-semibold uppercase tracking-tight', textSizeClasses[size])}>
                MỸ THUẬT
              </span>
              <span className={cn('text-[#FFD700] font-bold uppercase tracking-tight', textSizeClasses[size], 'leading-none')}>
                CMC
              </span>
            </div>
          )}
        </div>
      </div>
    </NavigationLink>
  )
}
