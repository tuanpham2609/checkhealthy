/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import '@/styles/globals.css'
import type { Metadata, Viewport } from 'next'
import ProviderRegistry from '@/providers'
import { cn } from '@/lib/styles'
import { PropsWithChildren } from 'react'
import { FONT_SANS, FONT_SERIF } from '@/styles/fonts'
import { AppShell } from '@/components/templates/app-shell'
import { APP_DOCUMENT_TITLE } from '@/constants/site-metadata.constants'
import { THEME_CHROME } from '@/constants/theme-chrome.constants'

/** Chỉ light mode — theme-color cố định; ThemeColorSync đồng bộ cùng giá trị. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: THEME_CHROME.light,
}

/** Không khai báo description, Open Graph, Twitter Card, keywords, canonical — chỉ title tối thiểu. */
export const metadata: Metadata = {
  title: APP_DOCUMENT_TITLE,
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html
      lang='vi'
      dir='ltr'
      className={cn('w-full overflow-x-hidden antialiased', FONT_SANS.variable, FONT_SERIF.variable)}
      suppressHydrationWarning
    >
      <body className='relative min-h-dvh bg-background font-sans text-[15px] leading-normal antialiased [font-feature-settings:"kern"_1,"liga"_1]'>
        <ProviderRegistry>
          <AppShell>{children}</AppShell>
        </ProviderRegistry>
      </body>
    </html>
  )
}
