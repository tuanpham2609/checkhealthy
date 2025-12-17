/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import 'server-only'
import type { MetadataRoute } from 'next'
import { allFeatures, allAbouts } from 'contentlayer/generated'
import linguiConfig from '../../lingui.config'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

const { locales } = linguiConfig

// Constants for sitemap configuration
const VALID_LOCALES = locales.filter((locale) => locale !== 'pseudo')
const STATIC_ROUTES = [
  { path: '', changeFrequency: 'daily' as const, priority: 1 },
  { path: 'support/faq', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: 'support/contact-us', changeFrequency: 'monthly' as const, priority: 0.8 },
]

/**
 * Build content maps for O(1) lookup by locale
 * Filters out draft content and groups by language
 * @returns Object with features and abouts maps
 */
function buildContentMaps() {
  const featuresMap = new Map<string, typeof allFeatures>()
  const aboutsMap = new Map<string, typeof allAbouts>()

  // Initialize maps for all locales
  for (const locale of VALID_LOCALES) {
    featuresMap.set(locale, [])
    aboutsMap.set(locale, [])
  }

  // Group features by locale
  for (const feature of allFeatures) {
    if ('draft' in feature && feature.draft) continue
    const locale = feature.lang
    if (featuresMap.has(locale)) {
      featuresMap.get(locale)!.push(feature)
    }
  }

  // Group abouts by locale
  for (const about of allAbouts) {
    if ('draft' in about && about.draft) continue
    const locale = about.lang
    if (aboutsMap.has(locale)) {
      aboutsMap.get(locale)!.push(about)
    }
  }

  return { featuresMap, aboutsMap }
}

/**
 * Generate sitemap entries for static routes
 * @param siteUrl - Base site URL
 * @param locale - Locale code
 * @returns Array of sitemap entries for static routes
 */
function generateStaticRouteEntries(siteUrl: string, locale: string): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}/${locale}${route.path ? `/${route.path}` : ''}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}

/**
 * Generate sitemap entries for content items
 * @param siteUrl - Base site URL
 * @param locale - Locale code
 * @param items - Content items (features or abouts)
 * @param type - Content type ('features' or 'about')
 * @returns Array of sitemap entries for content
 */
function generateContentEntries(
  siteUrl: string,
  locale: string,
  items: Array<{ slug: string; date?: string }>,
  type: 'features' | 'about'
): MetadataRoute.Sitemap {
  const changeFrequency = type === 'features' ? ('weekly' as const) : ('yearly' as const)
  const priority = type === 'features' ? 0.8 : 0.5

  return items.map((item) => ({
    url: `${siteUrl}/${locale}/${type}/${item.slug}`,
    lastModified: item.date ? new Date(item.date) : new Date(),
    changeFrequency,
    priority,
  }))
}

/**
 * Generate sitemap for all locales and content
 * Optimized with Map-based filtering and batch processing
 * Includes static routes and dynamic content routes
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_METADATA.siteUrl

  if (!siteUrl) {
    console.warn('SITE_METADATA.siteUrl is not set, skipping sitemap generation')
    return []
  }

  // Build content maps for efficient lookup
  const { featuresMap, aboutsMap } = buildContentMaps()

  const sitemapEntries: MetadataRoute.Sitemap = []

  // Generate entries for each locale in batch
  for (const locale of VALID_LOCALES) {
    // Add static routes
    sitemapEntries.push(...generateStaticRouteEntries(siteUrl, locale))

    // Add features
    const localeFeatures = featuresMap.get(locale) || []
    sitemapEntries.push(...generateContentEntries(siteUrl, locale, localeFeatures, 'features'))

    // Add about docs
    const aboutMap = aboutsMap.get(locale) || []
    sitemapEntries.push(...generateContentEntries(siteUrl, locale, aboutMap, 'about'))
  }

  return sitemapEntries
}
