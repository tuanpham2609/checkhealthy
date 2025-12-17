/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type Lenis from 'lenis'

/**
 * Scroll offset to prevent headings from being hidden behind sticky header
 * Matches TOP_OFFSET from use-toc-highlight hook
 */
const SCROLL_OFFSET = 120

/**
 * Decode URL encoded hash selector for safe querySelector usage
 * Handles Unicode characters in hash (e.g., #vi-%E7%94%A8%E6%88%B7...)
 * @param hash - Hash string with # prefix (e.g., "#vi-%E7%94%A8%E6%88%B7")
 * @returns Decoded hash string safe for querySelector, or original hash if decode fails
 */
export function decodeHashSelector(hash: string): string {
  if (!hash || !hash.startsWith('#')) {
    return hash
  }

  try {
    const id = hash.slice(1)
    const decodedId = decodeURIComponent(id)

    return `#${CSS.escape(decodedId)}`
  } catch {
    return CSS.escape(hash)
  }
}

/**
 * Scroll to hash with force scroll support
 * Handles case where hash already exists in URL by temporarily removing it
 * Uses Lenis for smooth scrolling if available, falls back to window.scrollTo
 * @param hash - Hash string with # prefix (e.g., "#download")
 * @param lenis - Optional Lenis instance, will try to get from window or store if not provided
 */
export function scrollToHash(hash: string, lenis?: Lenis | null): void {
  if (!hash || !hash.startsWith('#')) {
    return
  }

  // Get Lenis instance if not provided
  let lenisInstance = lenis
  if (!lenisInstance && typeof window !== 'undefined') {
    // Try to get from window (attached in layout)
    lenisInstance = (window as any).lenis || null
  }

  // Decode hash for safe querySelector usage (handles Unicode characters)
  const decodedHash = decodeHashSelector(hash)

  // Try multiple methods to find the target element
  const target =
    document.querySelector(decodedHash) ||
    document.getElementById(hash.replace('#', '')) ||
    document.getElementById(decodeURIComponent(hash.replace('#', '')))

  if (!target || !(target instanceof HTMLElement)) {
    return
  }

  // Handle case where hash already exists in URL - force scroll by temporarily removing hash
  const currentHash = window.location.hash
  const hashMatches = currentHash === hash || decodeURIComponent(currentHash) === decodeURIComponent(hash)

  if (hashMatches) {
    // Temporarily remove hash to force browser to recognize the scroll
    history.replaceState(null, '', window.location.pathname + window.location.search)

    // Small delay to ensure browser processes the hash removal
    requestAnimationFrame(() => {
      if (lenisInstance) {
        lenisInstance.scrollTo(target, { offset: -SCROLL_OFFSET })
      } else {
        const elementPosition = target.getBoundingClientRect().top + window.scrollY
        window.scrollTo({
          top: elementPosition - SCROLL_OFFSET,
          behavior: 'smooth',
        })
      }

      // Set hash back after a short delay to ensure scroll has started
      setTimeout(() => {
        history.replaceState(null, '', hash)
      }, 50)
    })
  } else {
    // Normal case: hash doesn't match, just scroll
    if (lenisInstance) {
      lenisInstance.scrollTo(target, { offset: -SCROLL_OFFSET })
    } else {
      const elementPosition = target.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - SCROLL_OFFSET,
        behavior: 'smooth',
      })
    }

    // Update hash in URL
    history.replaceState(null, '', hash)
  }
}
