/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { ThemeProvider } from 'next-themes'
import { PropsWithChildren } from 'react'

export default function ProviderRegistry({ children }: Readonly<PropsWithChildren>) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange={false}>
      {children}
    </ThemeProvider>
  )
}
