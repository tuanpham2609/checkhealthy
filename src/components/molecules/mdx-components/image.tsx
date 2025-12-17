/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { MDXComponents } from 'mdx/types'
import { Image, type ImageProps, Zoom } from '@/components/ui/image'

/**
 * MDX Image Component
 * Maps img tag to our Image component with Zoom functionality
 */
export const mdxImage: Partial<MDXComponents> = {
  // Map img tag to our Image component with Zoom
  Image: ({ alt, src, ...props }) => {
    if (!src) return null
    return (
      <Zoom>
        <Image alt={alt || ''} src={src} className='my-6 rounded-lg' {...(props as Omit<ImageProps, 'alt' | 'src'>)} />
      </Zoom>
    )
  },
}
