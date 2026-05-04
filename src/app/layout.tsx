/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import '@/styles/globals.css'
import type { Metadata, Viewport } from 'next'
import { cn } from '@/lib/styles'
import { PropsWithChildren } from 'react'
import { FONT_SANS, FONT_SERIF } from '@/styles/fonts'
import { APP_DOCUMENT_TITLE } from '@/constants/app-document.constants'
import { AppToaster } from '@/components/toast/app-toaster'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#00c292',
}

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
      <body className='relative min-h-dvh min-w-0 overflow-x-hidden bg-background font-sans text-[15px] leading-normal antialiased [font-feature-settings:"kern"_1,"liga"_1]'>
        <ThemeProvider>
          <QueryProvider>
            <AppToaster />
            <div className='min-h-dvh min-w-0 max-w-full'>{children}</div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
