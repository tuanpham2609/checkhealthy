/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { MDXComponents } from 'mdx/types'

/**
 * MDX List Components
 * Ordered and unordered lists with proper styling
 */
export const mdxLists: Partial<MDXComponents> = {
  // Lists
  ul: ({ ...props }) => (
    <ul className='mb-4 ml-6 list-disc space-y-2 [&>li]:leading-7 lg:[&>li]:leading-8' {...props} />
  ),

  ol: ({ ...props }) => (
    <ol className='mb-4 ml-6 list-decimal space-y-2 [&>li]:leading-7 lg:[&>li]:leading-8' {...props} />
  ),

  li: ({ ...props }) => <li className='text-foreground/90' {...props} />,
}
