/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

interface ParallaxProps {
  className?: string
  children?: React.ReactNode
  speed?: number
  id?: string
  position?: 'top' | 'bottom'
}

export default function Parallax({ className, children, ...rest }: ParallaxProps) {
  // Animation disabled - just render children
  return (
    <div className={className}>
      {children}
    </div>
  )
}
