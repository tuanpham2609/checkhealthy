/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import { usePathname } from 'next/navigation'
import { PropsWithChildren } from 'react'
import Header from '@/components/organisms/header'
import Footer from '@/components/organisms/footer'
import DefaultLayout from '@/layouts/default'

const TOOL_PATH_PREFIX = '/tool'

/**
 * Bọc toàn bộ app: với route / (main) hoặc /tool/* chỉ render children (trang crawl, không header/footer).
 * Các route khác giữ Header + main + Footer.
 */
export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const isToolPage = pathname === '/' || pathname?.startsWith(TOOL_PATH_PREFIX)

  if (isToolPage) {
    return <div className='min-h-dvh'>{children}</div>
  }

  return (
    <DefaultLayout>
      <Header />
      <main className='grow'>{children}</main>
      <Footer />
    </DefaultLayout>
  )
}
