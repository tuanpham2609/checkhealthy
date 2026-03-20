/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import type { Metadata } from 'next'
import { ConfessionPage } from '@/components/confession/confession-page'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

const canonical = SITE_METADATA.siteUrl.replace(/\/$/, '')

export const metadata: Metadata = {
  title: SITE_METADATA.title,
  description: SITE_METADATA.description,
  keywords: [...SITE_METADATA.keywords],
  alternates: { canonical: '/' },
  openGraph: {
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    url: canonical,
    type: 'website',
    locale: SITE_METADATA.locale,
    siteName: SITE_METADATA.titleHeader,
    images: [{ url: SITE_METADATA.siteLogo, alt: `${SITE_METADATA.titleHeader} — biểu tượng trái tim` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    images: [SITE_METADATA.siteLogo],
  },
  robots: { index: true, follow: true },
}

export default function Page() {
  return <ConfessionPage />
}
