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
 * MDX Code Components
 * Inline code and code blocks with syntax highlighting
 */
export const mdxCode: Partial<MDXComponents> = {
  // Code
  code: ({ className, ...props }) => {
    const isInline = !className
    return isInline ? (
      <code className='bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-sm' {...props} />
    ) : (
      <code className={className} {...props} />
    )
  },

  pre: ({ ...props }) => <pre className='bg-muted mb-4 overflow-x-auto rounded-lg p-4' {...props} />,
}
