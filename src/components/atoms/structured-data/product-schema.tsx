/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { Product } from '@/types/landing.types'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

interface ProductSchemaProps {
  product: Product
}

/**
 * Generate Product structured data (JSON-LD) for SEO
 * Helps search engines understand product information
 */
export function ProductSchema({ product }: ProductSchemaProps) {
  const siteUrl = SITE_METADATA.siteUrl || ''
  const productImage = product.image.startsWith('http') 
    ? product.image 
    : `${siteUrl}${product.image}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: `${product.title} - ${product.brand || 'Mỹ Thuật CMC'}`,
    image: productImage,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Mỹ Thuật CMC',
    },
    offers: {
      '@type': 'Offer',
      url: product.shopeeUrl || 'https://shopee.vn/shopmythuatcmc',
      priceCurrency: 'VND',
      price: product.salePrice.toString(),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Mỹ Thuật CMC',
        url: siteUrl,
      },
      ...(product.originalPrice > product.salePrice && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: product.originalPrice.toString(),
          priceCurrency: 'VND',
        },
      }),
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
