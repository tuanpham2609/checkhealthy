/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { SITE_METADATA } from '@/constants/site-metadata.constants'

interface LocalBusinessSchemaProps {
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  telephone?: string
}

/**
 * Generate LocalBusiness structured data (JSON-LD) for SEO
 * Helps with local search optimization
 */
export function LocalBusinessSchema({ address, telephone }: LocalBusinessSchemaProps) {
  const siteUrl = SITE_METADATA.siteUrl || ''

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Mỹ Thuật CMC',
    description: SITE_METADATA.description,
    url: siteUrl,
    image: `${siteUrl}/assets/logocmc.png`,
    logo: `${siteUrl}/assets/logocmc.png`,
    priceRange: '$$',
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.streetAddress || '',
        addressLocality: address.addressLocality || 'Việt Nam',
        addressRegion: address.addressRegion || '',
        postalCode: address.postalCode || '',
        addressCountry: address.addressCountry || 'VN',
      },
    }),
    ...(telephone && { telephone }),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '20:00',
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
