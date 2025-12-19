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
 * Generate Organization structured data (JSON-LD) for SEO
 * Helps search engines understand business information
 */
export function OrganizationSchema() {
  const siteUrl = SITE_METADATA.siteUrl || ''

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mỹ Thuật CMC',
    url: siteUrl,
    logo: `${siteUrl}/assets/logocmc.png`,
    description: SITE_METADATA.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: SITE_METADATA.email,
    },
    sameAs: [
      'https://www.facebook.com/votanthanh.1905',
      'https://www.instagram.com/votanthanh.art',
      'https://www.tiktok.com/@votanthanh.art',
      'https://shopee.vn/shopmythuatcmc',
    ],
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
