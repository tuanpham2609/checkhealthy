/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { useMemo } from 'react'
import { useIsClient } from '../use-is-client'

export function useDebug() {
  const isClient = useIsClient()

  return useMemo(() => {
    if (!isClient) return undefined

    const location = window.location
    const search = location.search
    const href = location.href
    const searchParams = new URLSearchParams(search)

    const isDebug =
      href.includes('#debug') || // localhost:3000/#debug
      href.includes('/_debug') || // localhost:3000/_debug
      searchParams.has('debug') || // localhost:3000/?debug
      process.env.NODE_ENV === 'development' // localhost:3000

    const isProduction =
      href.includes('#production') || // localhost:3000/#production
      searchParams.has('production') // localhost:3000/?production

    return isDebug && !isProduction
  }, [isClient])
}
