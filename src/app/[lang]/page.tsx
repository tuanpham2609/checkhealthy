/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { Metadata } from 'next'
import HomeTemplate from '@/components/templates/home'
import { PageLangParam } from '@/app/[lang]/layout'
import { genPageMetadata } from '@/lib/seo'
import { SITE_METADATA } from '@/constants/site-metadata.constants'
import { OrganizationSchema } from '@/components/atoms/structured-data/organization-schema'
import { LocalBusinessSchema } from '@/components/atoms/structured-data/local-business-schema'
import { ItemListSchema } from '@/components/atoms/structured-data/item-list-schema'
import { BEST_SELLING_PRODUCTS } from '@/constants/landing.constants'

export async function generateMetadata({ params }: PageLangParam): Promise<Metadata> {
  const lang = (await params).lang
  const keywords = [
    'họa cụ mỹ thuật',
    'màu nước',
    'màu dầu',
    'cọ vẽ',
    'canvas',
    'giấy vẽ',
    'dụng cụ vẽ',
    'shop họa cụ',
    'mỹ thuật CMC',
    'shopee họa cụ',
    'bút chì vẽ',
    'màu acrylic',
    'palette',
    'giá vẽ',
  ].join(', ')

  return genPageMetadata({
    title: SITE_METADATA.titleHeader,
    description: `${SITE_METADATA.description} Mua sắm online tại Shopee với nhiều ưu đãi hấp dẫn. Sản phẩm chất lượng, giá cả hợp lý, giao hàng nhanh chóng.`,
    lang,
    path: '',
    keywords,
  })
}

export default async function HomePage(props: PageLangParam) {
  return (
    <>
      <OrganizationSchema />
      <LocalBusinessSchema />
      <ItemListSchema 
        products={BEST_SELLING_PRODUCTS}
        name='Sản phẩm họa cụ mỹ thuật bán chạy'
        description='Danh sách sản phẩm họa cụ mỹ thuật bán chạy nhất tại Mỹ Thuật CMC. Mua sắm online tại Shopee với nhiều ưu đãi.'
      />
      <HomeTemplate />
    </>
  )
}
