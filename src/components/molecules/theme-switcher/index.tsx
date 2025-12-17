/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/styles'
import * as React from 'react'

interface ThemeSwitchProps {
  size?: number
  className?: string
}

export const ThemeSwitcher = ({ size = 20, className }: ThemeSwitchProps) => {
  const { theme, setTheme } = useTheme()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const toggleTheme = {
    light: 'dark',
    dark: 'light',
  }

  const validThemes = ['light', 'dark'] as const
  const currentTheme = validThemes.includes(theme as (typeof validThemes)[number])
    ? (theme as (typeof validThemes)[number])
    : 'dark'

  useEffect(() => {
    if (!wrapperRef.current) return

    const xPositions = {
      light: 0,
      dark: -size,
    }

    gsap.to(wrapperRef.current, {
      x: xPositions[currentTheme],
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [currentTheme, size])

  return (
    <Button
      size='icon'
      variant='ghost'
      className={cn('hover:bg-background/50 hover:text-primary rounded-full', className)}
      onClick={() => setTheme(toggleTheme[currentTheme])}
    >
      <div className='cursor-pointer overflow-hidden' style={{ width: size, height: size }}>
        <div ref={wrapperRef} className='flex gap-1 pt-0.5 pl-0.5' style={{ display: 'flex', flexDirection: 'row' }}>
          <Moon size={size} className='shrink-0' />
          <Sun size={size} className='shrink-0' />
          <span className='sr-only'>Toggle theme</span>
        </div>
      </div>
    </Button>
  )
}
