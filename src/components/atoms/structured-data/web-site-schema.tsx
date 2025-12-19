/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { SITE_METADATA } from '@/constants/site-metadata.constants'

/**
 * Generate WebSite structured data (JSON-LD) for SEO
 * Helps with site search and sitelinks
 */
export function WebSiteSchema() {
  const siteUrl = SITE_METADATA.siteUrl || ''

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mỹ Thuật CMC',
    url: siteUrl,
    description: SITE_METADATA.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mỹ Thuật CMC',
      url: siteUrl,
    },
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
