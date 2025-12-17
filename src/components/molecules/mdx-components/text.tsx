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
 * MDX Text Components
 * Paragraphs, blockquotes, horizontal rules, and text formatting
 */
export const mdxText: Partial<MDXComponents> = {
  // Paragraphs
  p: ({ ...props }) => <p className='text-foreground/90 mb-4 leading-7 lg:leading-8' {...props} />,

  // Blockquote
  blockquote: ({ ...props }) => (
    <blockquote className='border-primary/50 bg-muted/50 text-foreground/80 my-4 border-l-4 pl-4 italic' {...props} />
  ),

  // Horizontal rule
  hr: ({ ...props }) => <hr className='border-border my-8' {...props} />,

  // Strong and emphasis
  strong: ({ ...props }) => <strong className='text-foreground font-semibold' {...props} />,

  em: ({ ...props }) => <em className='text-foreground/90 italic' {...props} />,
}
