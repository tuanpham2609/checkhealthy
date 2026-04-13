/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useEffect, useState } from 'react'
import { THEME_CHROME } from '@/constants/theme-chrome.constants'

/**
 * Đồng bộ `<meta name="theme-color">` — app chỉ light mode.
 */
export function ThemeColorSync() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const sel = 'meta[name="theme-color"][data-app-theme-color]'
    let m = document.head.querySelector(sel) as HTMLMetaElement | null
    if (!m) {
      m = document.createElement('meta')
      m.name = 'theme-color'
      m.setAttribute('data-app-theme-color', '1')
      document.head.appendChild(m)
    }
    m.content = THEME_CHROME.light
  }, [mounted])

  return null
}
