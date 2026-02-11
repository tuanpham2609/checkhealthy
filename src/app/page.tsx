/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { Metadata } from 'next'
import { CrawlTool } from '@/components/molecules/crawl-tool'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

export const metadata: Metadata = {
  title: 'Crawl data - Chuẩn bị đăng TikTok, Facebook | ' + SITE_METADATA.titleHeader,
  description:
    'Dán link nguồn để lấy tiêu đề, mô tả, ảnh và caption gợi ý cho TikTok, Facebook.',
  openGraph: {
    title: 'Crawl data - Chuẩn bị đăng TikTok, Facebook',
    description: 'Dán link nguồn để lấy tiêu đề, mô tả, ảnh và caption gợi ý cho TikTok, Facebook.',
  },
}

/**
 * Trang chủ = tool crawl (http://localhost:3000)
 */
export default function HomePage() {
  return (
    <div className='relative min-h-dvh w-full overflow-x-hidden overflow-y-auto'>
      <div
        className='pointer-events-none fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50/90 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20'
        aria-hidden
      />
      <div
        className='pointer-events-none fixed inset-0 opacity-[0.02] dark:opacity-[0.03]'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 20V40H20L40 20z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className='relative flex min-h-dvh w-full flex-col items-center justify-center px-4 py-8 sm:px-6 md:px-8 lg:px-10'>
        <div className='mx-auto flex w-full max-w-2xl flex-col items-center sm:max-w-3xl md:max-w-4xl xl:max-w-5xl'>
          <header className='mb-6 text-center sm:mb-8 md:mb-10'>
            <h1 className='text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-100 sm:text-3xl md:text-4xl lg:text-5xl'>
              Crawl data
            </h1>
            <p className='mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:mt-3 sm:text-base md:text-lg'>
              Dán link bài viết hoặc trang web → lấy tiêu đề, mô tả, ảnh và caption sẵn sàng đăng
              TikTok / Facebook
            </p>
          </header>
          <div className='w-full'>
            <CrawlTool />
          </div>
        </div>
      </div>
    </div>
  )
}
