/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { Metadata } from 'next'
import linguiConfig from '../../lingui.config'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

const { locales } = linguiConfig

// Cache valid locales (exclude pseudo)
const VALID_LOCALES = locales.filter((locale) => locale !== 'pseudo')

// Cache locale mapping for OpenGraph
const LOCALE_MAP: Record<string, string> = {
  'zh-hans': 'zh_CN',
  'zh-hant': 'zh_TW',
}

interface PageSEOProps {
  title: string
  description?: string
  image?: string
  lang?: string
  path?: string
  date?: string
  type?: 'website' | 'article'
  keywords?: string
  [key: string]: unknown
}

/**
 * Generate structured data (JSON-LD) for SEO
 * @param options - Structured data options
 * @returns JSON-LD string or undefined
 */
export function generateStructuredData(options: {
  type: 'Article' | 'WebSite' | 'Organization'
  title: string
  description?: string
  url?: string
  datePublished?: string
  dateModified?: string
  image?: string
}): string | undefined {
  const { type, title, description, url, datePublished, dateModified, image } = options

  const baseData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': type,
    name: title,
    ...(description && { description }),
    ...(url && { url }),
    ...(image && { image }),
  }

  if (type === 'Article') {
    return JSON.stringify({
      ...baseData,
      ...(datePublished && { datePublished }),
      ...(dateModified && { dateModified }),
      publisher: {
        '@type': 'Organization',
        name: SITE_METADATA.author,
        url: SITE_METADATA.siteUrl,
      },
    })
  }

  return JSON.stringify(baseData)
}

/**
 * Generate hreflang alternates for all locales
 * Cached and optimized to reduce object creation
 * @param siteUrl - Base site URL
 * @param path - Page path (without locale)
 * @returns Record of locale to URL mapping
 */
function generateHreflangAlternates(siteUrl: string, path: string): Record<string, string> {
  const languages: Record<string, string> = {}

  for (const locale of VALID_LOCALES) {
    const alternatePath = path ? `/${locale}/${path}` : `/${locale}`
    languages[locale] = `${siteUrl}${alternatePath}`
  }

  return languages
}

/**
 * Generate page metadata with SEO optimization for multi-language support
 * Optimized with caching and reduced object creation
 * @param props - SEO properties including title, description, image, lang, path, etc.
 * @returns Complete Metadata object for Next.js
 */
export function genPageMetadata({
  title,
  description,
  image,
  lang = 'en',
  path = '',
  date,
  type = 'website',
  keywords,
  ...rest
}: PageSEOProps): Metadata {
  const siteUrl = SITE_METADATA.siteUrl || 'https://mythuatcmc.vn'
  const fullTitle = title ? `${title} | ${SITE_METADATA.title}` : SITE_METADATA.title
  // Ensure description is never empty - use default if missing
  const fullDescription =
    description?.trim() || SITE_METADATA.description || 'Shop họa cụ mỹ thuật chuyên nghiệp - Mua sắm online tại Shopee'
  const fullImage = image || SITE_METADATA.socialBanner
  const canonicalUrl = `${siteUrl}/${lang}${path ? `/${path}` : ''}`

  // Generate hreflang alternates (cached)
  const languages = generateHreflangAlternates(siteUrl, path)

  // Get OpenGraph locale (cached mapping)
  const ogLocale = LOCALE_MAP[lang] || lang

  const alternates: Metadata['alternates'] = {
    canonical: canonicalUrl,
    languages,
    types: {
      'application/rss+xml': [
        {
          url: `${siteUrl}/feeds/${lang}.xml`,
          title: `${SITE_METADATA.title} - ${lang.toUpperCase()}`,
        },
      ],
    },
  }

  // Build OpenGraph images array (reused)
  const ogImages = [
    {
      url: fullImage,
      width: 1200,
      height: 630,
      alt: title || SITE_METADATA.title,
    },
  ]

  const metadata: Metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: keywords || 'họa cụ mỹ thuật, màu nước, màu dầu, cọ vẽ, canvas, shopee',
    alternates,
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: canonicalUrl,
      siteName: SITE_METADATA.titleHeader,
      images: ogImages,
      locale: ogLocale,
      type,
      ...(date && type === 'article' ? { publishedTime: date } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: SITE_METADATA.x,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    ...rest,
  }

  return metadata
}
