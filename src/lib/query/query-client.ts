/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { QueryClient } from '@tanstack/react-query'

const STALE_MS = 30_000
const GC_MS = 5 * 60_000

export function createBrowserQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_MS,
        gcTime: GC_MS,
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  })
}
