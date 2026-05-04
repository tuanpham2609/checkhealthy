/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

'use client'

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { PropsWithChildren, useEffect } from 'react'

function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme) return
    const content = resolvedTheme === 'dark' ? '#1a1d23' : '#00c292'
    document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
      el.setAttribute('content', content)
    })
  }, [resolvedTheme])

  return null
}

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
      <>
        <ThemeColorSync />
        {children}
      </>
    </NextThemesProvider>
  )
}
