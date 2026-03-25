/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { THEME_CHROME } from '@/constants/theme-chrome.constants'

/**
 * Đồng bộ `<meta name="theme-color">` với light/dark thực tế (next-themes).
 * Chỉ tạo/cập nhật một thẻ meta có `data-app-theme-color` — không gọi `remove()` lên
 * meta do Next/viewport quản lý (tránh lỗi React `removeChild` khi đổi route).
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
    const sel = 'meta[name="theme-color"][data-app-theme-color]'
    let m = document.head.querySelector(sel) as HTMLMetaElement | null
    if (!m) {
      m = document.createElement('meta')
      m.name = 'theme-color'
      m.setAttribute('data-app-theme-color', '1')
      document.head.appendChild(m)
    }
    m.content = color
  }, [mounted, resolvedTheme])

  return null
}
