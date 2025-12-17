/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import React, { memo } from 'react'
import { useTheme } from 'next-themes'

type Colors =
  | string[]
  | {
      light: string[]
      dark: string[]
    }

interface AuroraTextProps {
  children: React.ReactNode
  className?: string
  colors?: Colors
  speed?: number
}

export const AuroraText = memo(
  ({
    children,
    className = '',
    colors = { dark: ['#006885', '#0088AA', '#00AACC', '#FFFFFF'], light: ['#000000', '#006885'] },
    speed = 1,
  }: AuroraTextProps) => {
    const { resolvedTheme } = useTheme()
    const isColorObject = !Array.isArray(colors)

    const lightColors = isColorObject ? colors.light : colors
    const darkColors = isColorObject ? colors.dark : colors

    const prefersDark = resolvedTheme === 'dark'
    const activeColors = prefersDark ? darkColors : lightColors

    const gradientStyle = {
      backgroundImage: `linear-gradient(135deg, ${activeColors.join(', ')}, ${activeColors[0]})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      animationDuration: `${10 / speed}s`,
    }

    return (
      <span className={`relative inline-block ${className}`}>
        <span className='sr-only'>{children}</span>
        <span
          className='animate-aurora relative bg-[length:200%_auto] bg-clip-text pr-0.5 text-transparent'
          style={gradientStyle}
          aria-hidden='true'
        >
          {children}
        </span>
      </span>
    )
  }
)

AuroraText.displayName = 'AuroraText'
