/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { ReactNode } from 'react'

interface FadeContentProps {
  children: ReactNode
  blur?: boolean
  duration?: number
  easing?: string
  delay?: number
  threshold?: number
  initialOpacity?: number
  className?: string
}

const FadeContent: React.FC<FadeContentProps> = ({
  children,
  className = '',
  ...rest
}) => {
  // Animation disabled - just render children
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export default FadeContent
