/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from TuanPham.
 */

'use client'

import { useTheme } from 'next-themes'
import { Toaster } from 'sonner'

/**
 * Sonner Toaster đồng bộ sáng/tối với next-themes, bo góc và vị trí phù hợp mobile (safe area).
 */
export function AppToaster() {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster
      position='top-center'
      richColors
      closeButton
      expand={false}
      visibleToasts={4}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      offset='calc(0.75rem + env(safe-area-inset-top, 0px))'
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            'rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] shadow-lg',
          title: 'font-semibold text-[var(--notika-text)]',
          description: 'text-sm text-[var(--notika-muted)]',
          success: 'border-emerald-200/80 dark:border-emerald-900/50',
          error: 'border-rose-200/90 dark:border-rose-900/50',
          warning: 'border-amber-200/90 dark:border-amber-900/50',
          info: 'border-sky-200/90 dark:border-sky-900/50',
          closeButton:
            'border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-muted)] hover:bg-[var(--muted)]',
        },
      }}
    />
  )
}
