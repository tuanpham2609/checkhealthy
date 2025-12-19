/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { SITE_METADATA } from '@/constants/site-metadata.constants'

interface ReviewSchemaProps {
  ratingValue?: number
  reviewCount?: number
  bestRating?: number
  worstRating?: number
}

/**
 * Generate AggregateRating structured data (JSON-LD) for SEO
 * Helps display ratings in search results
 */
export function ReviewSchema({ 
  ratingValue = 4.8, 
  reviewCount = 150, 
  bestRating = 5, 
  worstRating = 1 
}: ReviewSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Mỹ Thuật CMC',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: bestRating.toString(),
      worstRating: worstRating.toString(),
    },
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
