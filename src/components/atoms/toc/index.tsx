/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import { useTocHighlight } from '@/hooks/use-toc-highlight'
import { cn } from '@/lib/styles'
import type { TocHeading } from '@/types/content.types'
import { scrollToHash } from '@/lib/utils/dom/scroll'

interface TocProps {
  headings: readonly TocHeading[]
}

/**
 * Table of Contents component
 * Displays headings in a sticky sidebar on the right
 * Highlights active section based on scroll position
 * - Default text color: white (dark mode) / gray (light mode)
 * - Highlight color: primary blue
 * - Has bullet points by default
 * - Hover on item highlights like active item
 * - Text overflow with ellipsis
 */
export function Toc({ headings }: TocProps) {
  const { currentIndex } = useTocHighlight()

  if (headings.length === 0) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
    e.preventDefault()
    if (url) {
      scrollToHash(url)
    }
  }

  return (
    <nav
      role='navigation'
      className='group pointer-events-auto sticky top-0 hidden h-fit w-[200px] xl:block'
      style={{
        left: 'calc((100vw - min(100vw, 768px)) / 2 + min(100vw, 768px) + 200px)',
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    >
      <div className='h-full max-h-[calc(100vh-12rem)] overflow-y-auto ps-4' style={{ overscrollBehavior: 'contain' }}>
        <ul className='space-y-2 py-8'>
          {headings.map((h, i) => {
            if (!h.url && process.env.NODE_ENV === 'development') {
              console.error('Heading does not have URL')
            }

            const isActive = currentIndex === i

            return (
              <li key={`heading-${h.url}-${i}`}>
                <button
                  type='button'
                  className={cn(
                    'hover:text-primary! transition-[color, opacity] flex w-full cursor-pointer leading-normal duration-300 ease-in-out',
                    'before:me-2 before:font-black before:content-["-"]',
                    isActive ? 'text-primary opacity-100' : 'text-gray-600 group-hover:opacity-100 dark:text-white'
                  )}
                  onClick={(e) => handleClick(e, h.url)}
                  title={h.text}
                >
                  <p className='truncate text-xs font-bold xl:text-base'>{h.text}</p>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
