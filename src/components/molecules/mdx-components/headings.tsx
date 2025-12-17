/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { MDXComponents } from 'mdx/types'
import { HeadingAnchor } from './heading-anchor'

/**
 * MDX Heading Components
 * Custom heading components with anchor links (without # symbol)
 */
export const mdxHeadings: Partial<MDXComponents> = {
  h1: ({ id, ...props }) => (
    <h1 id={id} className='font-clash-display mt-8 mb-6 text-4xl font-semibold first:mt-0 lg:text-5xl' {...props}>
      {props.children}
      {id && <HeadingAnchor id={id}>{props.children}</HeadingAnchor>}
    </h1>
  ),

  h2: ({ id, ...props }) => (
    <h2 id={id} className='font-clash-display mt-8 mb-4 text-3xl font-semibold first:mt-0 lg:text-4xl' {...props}>
      {props.children}
      {id && <HeadingAnchor id={id}>{props.children}</HeadingAnchor>}
    </h2>
  ),

  h3: ({ id, ...props }) => (
    <h3 id={id} className='mt-6 mb-3 text-2xl font-semibold first:mt-0 lg:text-3xl' {...props}>
      {props.children}
      {id && <HeadingAnchor id={id}>{props.children}</HeadingAnchor>}
    </h3>
  ),

  h4: ({ ...props }) => <h4 className='mt-4 mb-2 text-xl font-semibold first:mt-0 lg:text-2xl' {...props} />,

  h5: ({ ...props }) => <h5 className='mt-4 mb-2 text-lg font-semibold first:mt-0 lg:text-xl' {...props} />,

  h6: ({ ...props }) => <h6 className='mt-4 mb-2 text-base font-semibold first:mt-0 lg:text-lg' {...props} />,
}
