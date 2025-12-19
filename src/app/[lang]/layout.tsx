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
import linguiConfig from '../../../lingui.config'
import type { Metadata } from 'next'
import ProviderRegistry from '@/providers'
import { cn } from '@/lib/styles'
import Header from '@/components/organisms/header'
import Footer from '@/components/organisms/footer'
import { PropsWithChildren } from 'react'
import { FONT_CLASH_DISPLAY, FONT_POPPINS } from '@/styles/fonts'
import DefaultLayout from '@/layouts/default'
import { getDirection } from '@/lib/direction'
import { LOCALES } from '@/constants/direction.constants'
import { genPageMetadata } from '@/lib/seo'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

export interface PageLangParam {
  params: Promise<{ lang: string }>
}

export async function generateStaticParams() {
  return linguiConfig.locales.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: PageLangParam): Promise<Metadata> {
  const lang = (await params).lang
  const metadata = genPageMetadata({
    title: SITE_METADATA.titleHeader,
    description: SITE_METADATA.description,
    lang,
    path: '',
  })

  return {
    ...metadata,
    metadataBase: new URL(SITE_METADATA.siteUrl || 'https://mythuatcmc.vn'),
  }
}

export default async function RootLayout({ children, params }: Readonly<PropsWithChildren<PageLangParam>>) {
  const lang = (await params).lang
  const dir = getDirection(lang as LOCALES)
  return (
    <html
      dir={dir}
      lang={lang}
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
