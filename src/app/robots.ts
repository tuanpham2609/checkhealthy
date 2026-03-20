/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { MetadataRoute } from 'next'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

/**
 * Generate robots.txt file
 * Allows all crawlers and points to sitemap
 */
export default function robots(): MetadataRoute.Robots {
  const origin = SITE_METADATA.siteUrl.replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  }
}
