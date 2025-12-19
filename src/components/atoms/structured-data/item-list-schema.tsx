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

interface ItemListSchemaProps {
  products: Product[]
  name?: string
  description?: string
}

/**
 * Generate ItemList structured data (JSON-LD) for SEO
 * Helps search engines understand product collections
 */
export function ItemListSchema({ products, name = 'Sản phẩm bán chạy', description }: ItemListSchemaProps) {
  const siteUrl = SITE_METADATA.siteUrl || ''

  const itemListElement = products.map((product, index) => {
    const productImage = product.image.startsWith('http') 
      ? product.image 
      : `${siteUrl}${product.image}`

    return {
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        image: productImage,
        description: `${product.title} - ${product.brand || 'Mỹ Thuật CMC'}`,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'Mỹ Thuật CMC',
        },
        offers: {
          '@type': 'Offer',
          url: product.shopeeUrl || 'https://shopee.vn/shopmythuatcmc',
          priceCurrency: 'VND',
          price: product.salePrice.toString(),
          availability: 'https://schema.org/InStock',
        },
      },
    }
  })

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description: description || `Danh sách ${products.length} sản phẩm họa cụ mỹ thuật bán chạy tại Mỹ Thuật CMC`,
    itemListElement,
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
