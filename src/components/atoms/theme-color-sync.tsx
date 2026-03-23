/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { THEME_CHROME } from '@/constants/theme-chrome.constants'

/**
 * Đồng bộ `<meta name="theme-color">` với light/dark thực tế (next-themes),
 * ghi đè theme-color theo `prefers-color-scheme` khi người dùng bật/tắt dark trong app.
 */
export function ThemeColorSync() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !resolvedTheme) return
    const color = resolvedTheme === 'dark' ? THEME_CHROME.dark : THEME_CHROME.light
    document.querySelectorAll('meta[name="theme-color"]').forEach((n) => n.remove())
    const m = document.createElement('meta')
    m.name = 'theme-color'
    m.content = color
    document.head.appendChild(m)
  }, [mounted, resolvedTheme])

  return null
}
