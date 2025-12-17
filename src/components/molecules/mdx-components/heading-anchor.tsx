/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { ComponentPropsWithoutRef } from 'react'

interface HeadingAnchorProps extends ComponentPropsWithoutRef<'a'> {
  id: string
  children: React.ReactNode
}

/**
 * Heading Anchor - Link component for heading anchors
 * Removed # symbol as requested
 */
export function HeadingAnchor({ id, children, className, ...props }: HeadingAnchorProps) {
  return (
    <a
      href={`#${id}`}
      className='mdx-header-anchor text-primary ml-2 opacity-0 transition-opacity hover:opacity-100'
      aria-label={`Link to ${children}`}
      {...props}
    />
  )
}
