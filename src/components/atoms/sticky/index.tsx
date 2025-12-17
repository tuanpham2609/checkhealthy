/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

interface StickyProps {
  children?: React.ReactNode
  wrapperClass?: string
  className?: string
  start?: number | string
  end?: number | string
  target?: string
  id?: string
  enabled?: boolean
  pinType?: 'fixed' | 'transform'
}

export function Sticky({
  children,
  wrapperClass,
  className,
  ...rest
}: StickyProps) {
  // Animation disabled - just render children
  return (
    <div className={wrapperClass}>
      <div className={className}>
        {children}
      </div>
    </div>
  )
}
