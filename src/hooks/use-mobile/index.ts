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

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const isMobileWidth = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`, {
    defaultValue: false,
    initializeWithValue: false,
  })

  const [isMobileAgent, setIsMobileAgent] = useState(false)

  useEffect(() => {
    if (typeof navigator === 'undefined') return

    const ua = navigator.userAgent
    const mobileRegex = /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i
    setIsMobileAgent(mobileRegex.test(ua))
  }, [])

  return isMobileAgent || isMobileWidth
}
