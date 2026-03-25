/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren, useState } from 'react'
import { createBrowserQueryClient } from '@/lib/query/query-client'

export function QueryProvider({ children }: Readonly<PropsWithChildren>) {
  const [client] = useState(() => createBrowserQueryClient())
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
