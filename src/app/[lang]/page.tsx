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
import { FAQSchema } from '@/components/atoms/structured-data/faq-schema'
import { ReviewSchema } from '@/components/atoms/structured-data/review-schema'
import { WebSiteSchema } from '@/components/atoms/structured-data/web-site-schema'
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

  const faqs = [
    {
      question: 'Mua họa cụ mỹ thuật ở đâu uy tín?',
      answer: 'Mỹ Thuật CMC là shop họa cụ mỹ thuật uy tín với đầy đủ sản phẩm từ màu nước, màu dầu, cọ vẽ, canvas đến dụng cụ vẽ. Mua sắm online tại Shopee với nhiều ưu đãi hấp dẫn, giao hàng nhanh chóng.',
    },
    {
      question: 'Sản phẩm họa cụ có được giảm giá không?',
      answer: 'Có, tất cả sản phẩm tại Mỹ Thuật CMC đều có chương trình giảm giá lên đến 20%. Mua sắm tại Shopee để nhận nhiều ưu đãi hấp dẫn hơn.',
    },
    {
      question: 'Có giao hàng toàn quốc không?',
      answer: 'Có, Mỹ Thuật CMC giao hàng toàn quốc thông qua Shopee. Đặt hàng ngay để được giao hàng nhanh chóng và an toàn.',
    },
    {
      question: 'Sản phẩm có đảm bảo chất lượng không?',
      answer: 'Tất cả sản phẩm tại Mỹ Thuật CMC đều được chọn lọc kỹ lưỡng, đảm bảo chất lượng cao. Chúng tôi cam kết mang đến sản phẩm tốt nhất cho khách hàng.',
    },
  ]

  return genPageMetadata({
    title: 'MỸ THUẬT CMC - Shop Họa Cụ Mỹ Thuật | Mua Online Shopee Giá Tốt',
    description: `${SITE_METADATA.description} Mua sắm online tại Shopee với nhiều ưu đãi hấp dẫn. Sản phẩm chất lượng, giá cả hợp lý, giao hàng nhanh chóng. 17+ sản phẩm bán chạy đang có sẵn.`,
    lang,
    path: '',
    keywords,
  })
}

export default async function HomePage(props: PageLangParam) {
  const faqs = [
    {
      question: 'Mua họa cụ mỹ thuật ở đâu uy tín?',
      answer: 'Mỹ Thuật CMC là shop họa cụ mỹ thuật uy tín với đầy đủ sản phẩm từ màu nước, màu dầu, cọ vẽ, canvas đến dụng cụ vẽ. Mua sắm online tại Shopee với nhiều ưu đãi hấp dẫn, giao hàng nhanh chóng.',
    },
    {
      question: 'Sản phẩm họa cụ có được giảm giá không?',
      answer: 'Có, tất cả sản phẩm tại Mỹ Thuật CMC đều có chương trình giảm giá lên đến 20%. Mua sắm tại Shopee để nhận nhiều ưu đãi hấp dẫn hơn.',
    },
    {
      question: 'Có giao hàng toàn quốc không?',
      answer: 'Có, Mỹ Thuật CMC giao hàng toàn quốc thông qua Shopee. Đặt hàng ngay để được giao hàng nhanh chóng và an toàn.',
    },
    {
      question: 'Sản phẩm có đảm bảo chất lượng không?',
      answer: 'Tất cả sản phẩm tại Mỹ Thuật CMC đều được chọn lọc kỹ lưỡng, đảm bảo chất lượng cao. Chúng tôi cam kết mang đến sản phẩm tốt nhất cho khách hàng.',
    },
  ]

  return (
    <>
      <WebSiteSchema />
      <OrganizationSchema />
      <LocalBusinessSchema />
      <ItemListSchema 
        products={BEST_SELLING_PRODUCTS}
        name='Sản phẩm họa cụ mỹ thuật bán chạy'
        description='Danh sách sản phẩm họa cụ mỹ thuật bán chạy nhất tại Mỹ Thuật CMC. Mua sắm online tại Shopee với nhiều ưu đãi.'
      />
      <FAQSchema faqs={faqs} />
      <ReviewSchema ratingValue={4.8} reviewCount={150} />
      <HomeTemplate />
    </>
  )
}
