/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import '@/styles/globals.css'
import 'react-medium-image-zoom/dist/styles.css'
import type { Metadata } from 'next'
import ProviderRegistry from '@/providers'
import { cn } from '@/lib/styles'
import Header from '@/components/organisms/header'
import Footer from '@/components/organisms/footer'
import { PropsWithChildren } from 'react'
import { FONT_CLASH_DISPLAY, FONT_POPPINS } from '@/styles/fonts'
import DefaultLayout from '@/layouts/default'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

export const metadata: Metadata = {
  title: SITE_METADATA.titleHeader,
  description: SITE_METADATA.description,
  metadataBase: new URL(SITE_METADATA.siteUrl || 'https://officialwalletweb.vercel.app'),
}

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html
      lang='vi'
      dir='ltr'
      className={cn('w-full overflow-x-hidden antialiased', FONT_POPPINS.variable, FONT_CLASH_DISPLAY.variable)}
      suppressHydrationWarning
    >
      <body className={cn('relative flex min-h-dvh flex-col pl-[calc(100vw-100%)] antialiased')}>
        <ProviderRegistry>
          <DefaultLayout>
            <Header />
            <main className='grow'>{children}</main>
            <Footer />
          </DefaultLayout>
        </ProviderRegistry>
      </body>
    </html>
  )
}

