/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useState } from 'react'
import { useIsomorphicLayoutEffect } from '../use-isomorphic-layout-effect'
import { isBrowser } from '@/lib/misc'
type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

export function useMediaQuery(
  query: string,
  { defaultValue = false, initializeWithValue = true }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (isBrowser) {
      return window.matchMedia(query).matches
    }
    return defaultValue
  }
  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query)
    }
    return defaultValue
  })
  // Handles the change event of the media query.
  function handleChange() {
    setMatches(getMatches(query))
  }
  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    // Triggered at the first client-side load and if query changes
    handleChange()
    // Use deprecated `addListener` and `removeListener` to support Safari < 14 (#135)
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange)
    } else {
      matchMedia.addEventListener('change', handleChange)
    }
    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange)
      } else {
        matchMedia.removeEventListener('change', handleChange)
      }
    }
  }, [query])
  return matches
}
export type { UseMediaQueryOptions }
