/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import '@/styles/globals.css'
import type { Metadata } from 'next'
import ProviderRegistry from '@/providers'
import { SiteJsonLd } from '@/components/seo/site-json-ld'
import { cn } from '@/lib/styles'
import { PropsWithChildren } from 'react'
import { FONT_SANS, FONT_SERIF } from '@/styles/fonts'
import { AppShell } from '@/components/templates/app-shell'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

const baseUrl = new URL(SITE_METADATA.siteUrl)

export const metadata: Metadata = {
  metadataBase: baseUrl,
  applicationName: SITE_METADATA.titleHeader,
  title: {
    default: SITE_METADATA.title,
    template: `%s | ${SITE_METADATA.titleHeader}`,
  },
  description: SITE_METADATA.description,
  keywords: [...SITE_METADATA.keywords],
  authors: [{ name: SITE_METADATA.author, url: baseUrl.href }],
  creator: SITE_METADATA.author,
  publisher: SITE_METADATA.author,
  formatDetection: { email: false, address: false, telephone: false },
  /** Favicon & Apple touch: `src/app/icon.png` + `apple-icon.png` (trùng `public/assets/ivf-heart-brand.png`) */
  appleWebApp: {
    capable: true,
    title: SITE_METADATA.titleHeader,
    statusBarStyle: 'default',
  },
  openGraph: {
    type: 'website',
    locale: SITE_METADATA.locale.replace('-', '_'),
    url: baseUrl.href,
    siteName: SITE_METADATA.titleHeader,
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    images: [
      {
        url: SITE_METADATA.siteOgImage,
        secureUrl: SITE_METADATA.siteUrl.startsWith('https:') ? SITE_METADATA.siteOgImage : undefined,
        alt: `${SITE_METADATA.titleHeader} — cộng đồng chia sẻ hành trình IVF`,
        type: 'image/png',
        width: SITE_METADATA.siteOgImageWidth,
        height: SITE_METADATA.siteOgImageHeight,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    images: [
      {
        url: SITE_METADATA.siteOgImage,
        width: SITE_METADATA.siteOgImageWidth,
        height: SITE_METADATA.siteOgImageHeight,
        alt: SITE_METADATA.titleHeader,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  alternates: { canonical: '/', languages: { 'vi-VN': '/' } },
  category: 'health',
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
        <SiteJsonLd />
        <ProviderRegistry>
          <AppShell>{children}</AppShell>
        </ProviderRegistry>
      </body>
    </html>
  )
}
