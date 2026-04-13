/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { ThemeProvider } from 'next-themes'
import { PropsWithChildren } from 'react'
import { ThemeColorSync } from '@/components/atoms/theme-color-sync'
import { QueryProvider } from '@/providers/query-provider'

export default function ProviderRegistry({ children }: Readonly<PropsWithChildren>) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute='class'
        defaultTheme='light'
        enableSystem={false}
        forcedTheme='light'
        disableTransitionOnChange={false}
      >
        <ThemeColorSync />
        {children}
      </ThemeProvider>
    </QueryProvider>
  )
}
