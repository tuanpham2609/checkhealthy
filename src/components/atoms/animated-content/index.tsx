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

export interface AnimatedContentProps {
  children: ReactNode
  distance?: number
  direction?: 'vertical' | 'horizontal'
  reverse?: boolean
  duration?: number
  ease?: string | ((progress: number) => number)
  initialOpacity?: number
  animateOpacity?: boolean
  scale?: number
  threshold?: number
  delay?: number
  mode?: 'scrub' | 'once'
  offsetVH?: number
  onComplete?: () => void
  className?: string
  name?: string
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({
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

export interface AnimatedSequenceProps {
  children: ReactNode
  stagger?: number
  distance?: number
  direction?: 'vertical' | 'horizontal'
  reverse?: boolean
  duration?: number
  ease?: string | ((progress: number) => number)
  initialOpacity?: number
  animateOpacity?: boolean
  threshold?: number
  mode?: 'scrub' | 'once'
  offsetVH?: number
  className?: string
  onComplete?: () => void
}

export const AnimatedSequence: React.FC<AnimatedSequenceProps> = ({
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

export default AnimatedContent
