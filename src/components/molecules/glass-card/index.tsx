/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

// GlassCard.tsx
import { cn } from '@/lib/styles'

type GlassCardProps = {
  children?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, style }) => {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl', className)} style={style}>
      <div className='pointer-events-none absolute inset-0 bg-white/20 dark:bg-black/40' />
      <div className='relative z-10'>{children}</div>
    </div>
  )
}

export default GlassCard
