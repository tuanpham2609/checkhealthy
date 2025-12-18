/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import { useEffect, DependencyList } from 'react'

export function useScroll(callback: (args: { scroll: number }) => void, deps: DependencyList = []) {
  useEffect(() => {
    const handleScroll = () => {
      const scroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
      callback({ scroll })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
