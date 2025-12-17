/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { PropsWithChildren } from 'react'
import { Container } from '@/components/atoms/container'
import { Toc } from '@/components/atoms/toc'
import { Breadcrumbs } from '@/components/atoms/breadcrumbs'
import { ScrollToTop } from '@/components/atoms/scroll-to-top'
import { cn } from '@/lib/styles'
import type { ContentType, TocHeading } from '@/types/content.types'

interface MdxLayoutProps extends PropsWithChildren {
  type?: ContentType
  title?: string
  category?: string
  headings?: readonly TocHeading[]
  className?: string
}

/**
 * MDX Layout - Reusable layout template for MDX content pages
 *
 * Provides:
 * - Content width: 768px (max-w-[768px])
 * - TOC positioned absolutely outside container
 * - Breadcrumbs navigation
 * - Scroll to top button
 * - Responsive design (TOC hidden on mobile)
 */
export default function MdxLayout({ children, title, headings = [], className }: MdxLayoutProps) {
  return (
    <div className='relative'>
      <Container className={cn('mx-auto max-w-[768px] py-8 lg:py-12 xl:py-16', className)}>
        {/* Main Content */}
        <article className='prose prose-lg dark:prose-invert lg:prose-xl max-w-none'>
          {title && <h1 className='font-clash-display mb-8 text-4xl font-extrabold lg:text-5xl'>{title}</h1>}

          <Breadcrumbs title={title || ''} />

          <div className='text-foreground/90'>{children}</div>
        </article>
      </Container>

      {/* TOC Sidebar - Positioned absolutely outside container */}
      {headings.length > 0 && (
        <div className='pointer-events-none absolute inset-0'>
          <div className='relative h-full w-full'>
            <Toc headings={headings} />
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
