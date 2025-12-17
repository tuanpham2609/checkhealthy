/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { MDXComponents } from 'mdx/types'
import { NavigationLink } from '@/components/atoms/navigation-link'
import { cn } from '@/lib/styles'

/**
 * MDX Link Components
 * Links with proper styling and security attributes
 */
export const mdxLinks: Partial<MDXComponents> = {
  // Links
  a: ({ href, className, ...props }) => (
    <NavigationLink
      href={href}
      className={cn('text-primary underline-offset-4 hover:underline', className)}
      target='_blank'
      rel='noopener noreferrer'
      {...props}
    />
  ),
}
