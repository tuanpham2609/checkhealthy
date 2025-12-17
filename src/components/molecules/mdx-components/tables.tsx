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
 * MDX Table Components
 * Tables with proper styling and responsive wrapper
 */
export const mdxTables: Partial<MDXComponents> = {
  // Tables
  table: ({ ...props }) => (
    <div className='my-6 overflow-x-auto'>
      <table className='border-border w-full border-collapse border' {...props} />
    </div>
  ),

  thead: ({ ...props }) => <thead className='bg-muted' {...props} />,

  th: ({ ...props }) => <th className='border-border border px-4 py-2 text-left font-semibold' {...props} />,

  td: ({ ...props }) => <td className='border-border text-foreground/90 border px-4 py-2' {...props} />,
}
