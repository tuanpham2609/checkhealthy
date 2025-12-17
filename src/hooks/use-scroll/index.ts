/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { useStore } from '@/lib/store'
import { DependencyList, useEffect } from 'react'
import { ScrollCallback } from 'lenis'

export function useScroll(callback: ScrollCallback, deps: DependencyList = []) {
  const lenis = useStore(({ lenis }) => lenis)

  useEffect(() => {
    if (!lenis) return
    lenis.on('scroll', callback)
    ;(lenis as any).emit?.()

    return () => {
      lenis.off('scroll', callback)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis, callback, [...deps]])
}
