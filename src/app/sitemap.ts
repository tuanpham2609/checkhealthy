/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import 'server-only'
import type { MetadataRoute } from 'next'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_METADATA.siteUrl.replace(/\/$/, '')
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}
