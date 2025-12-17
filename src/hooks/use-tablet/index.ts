/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useMediaQuery } from '../use-media-query'
import { useEffect, useState } from 'react'

const TABLET_BREAKPOINT = 1024

export function useIsTablet() {
  const isTabletWidth = useMediaQuery(`(max-width: ${TABLET_BREAKPOINT - 1}px)`, {
    defaultValue: false,
    initializeWithValue: false,
  })

  const [isTabletAgent, setIsTabletAgent] = useState(false)

  useEffect(() => {
    if (typeof navigator === 'undefined') return
    const ua = navigator.userAgent

    const tabletRegex = /iPad|Tablet|PlayBook|Silk|Kindle|Android(?!.*Mobile)/i
    setIsTabletAgent(tabletRegex.test(ua))
  }, [])

  return isTabletAgent || isTabletWidth
}
