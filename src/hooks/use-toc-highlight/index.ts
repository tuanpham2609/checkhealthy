/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import { useState, useRef, useEffect } from 'react'

const DEFAULT_TOP_OFFSET = 240

interface UseTocHighlightOptions {
  offset?: number
}

/**
 * Get header anchor elements from the DOM
 * @returns Array of anchor elements that are headings (h1, h2)
 */
export function getHeaderAnchors(): HTMLAnchorElement[] {
  return Array.prototype.filter.call(
    document.getElementsByClassName('mdx-header-anchor'),
    function (testElement: HTMLAnchorElement) {
      const parent = testElement.parentNode
      return parent !== null && (parent.nodeName === 'H1' || parent.nodeName === 'H2')
    }
  ) as HTMLAnchorElement[]
}

/**
 * Hook to track which heading is currently active in the viewport
 * Sets up scroll listeners to highlight the current section in TOC
 *
 * @returns Object with currentIndex indicating which heading is active
 */
export function useTocHighlight(options?: UseTocHighlightOptions) {
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const timeoutRef = useRef<number | null>(null)
  const topOffset = options?.offset ?? DEFAULT_TOP_OFFSET

  useEffect(() => {
    function updateActiveLink() {
      const pageHeight = document.body.scrollHeight
      const scrollPosition = window.scrollY + window.innerHeight
      const headersAnchors = getHeaderAnchors()

      if (scrollPosition >= 0 && pageHeight - scrollPosition <= 0) {
        // Scrolled to bottom of page
        setCurrentIndex(headersAnchors.length - 1)
        return
      }

      let index = -1
      while (index < headersAnchors.length - 1) {
        const headerAnchor = headersAnchors[index + 1]
        const { top } = headerAnchor.getBoundingClientRect()

        if (top >= topOffset) {
          break
        }

        index += 1
      }

      setCurrentIndex(Math.max(index, 0))
    }

    function throttledUpdateActiveLink() {
      if (timeoutRef.current === null) {
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = null
          updateActiveLink()
        }, 100)
      }
    }

    document.addEventListener('scroll', throttledUpdateActiveLink)
    window.addEventListener('resize', throttledUpdateActiveLink)
    updateActiveLink()

    return () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      document.removeEventListener('scroll', throttledUpdateActiveLink)
      window.removeEventListener('resize', throttledUpdateActiveLink)
    }
  }, [topOffset])

  return {
    currentIndex,
  }
}
