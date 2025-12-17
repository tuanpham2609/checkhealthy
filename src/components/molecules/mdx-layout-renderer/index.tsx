/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import { useMDXComponent } from 'next-contentlayer2/hooks'
import { MDX_COMPONENTS } from '@/components/molecules/mdx-components'

interface MdxLayoutRendererProps {
  code: string
  toc?: Array<{ url: string; text: string; depth: number }>
}

/**
 * MDX Layout Renderer
 * Renders compiled MDX code from contentlayer with custom components
 * The code prop contains the compiled MDX component code string from contentlayer
 */
export function MdxLayoutRenderer({ code }: MdxLayoutRendererProps) {
  const Component = useMDXComponent(code)

  return (
    <div className='mdx-content'>
      <Component components={MDX_COMPONENTS} />
    </div>
  )
}
