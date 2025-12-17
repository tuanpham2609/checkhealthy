/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { Container } from '@/components/atoms/container'
import { Button } from '@/components/ui/button'
import { NavigationLink } from '@/components/atoms/navigation-link'
import { BEST_SELLING_PRODUCTS } from '@/constants/landing.constants'
import { YOUTUBE_SHORTS_VIDEOS } from '@/constants/tiktok.constants'
import { ProductCard } from '@/components/molecules/product-card'
import { PromotionalBanners } from '@/components/molecules/promotional-banners'
import { YouTubeShortsGallery } from '@/components/molecules/tiktok-gallery'
import { AuroraText } from '@/components/atoms/aurora-text'

export default function HomeTemplateMobile() {
  return (
    <div className='relative min-h-dvh overflow-x-hidden'>
      {/* Hero */}
      <Container id='hero' className='flex flex-col items-center justify-center gap-6 py-10 text-center'>
        <h1 className='font-clash-display text-3xl font-extrabold'>
          <AuroraText speed={0}>
            Khám Phá Nghệ Thuật. Họa Cụ Chất Lượng Cho Mọi Họa Sĩ
          </AuroraText>
        </h1>
        <p className='max-w-md'>
          Shop họa cụ mỹ thuật chuyên nghiệp với đầy đủ sản phẩm từ màu nước, màu dầu, cọ vẽ đến canvas. 
          Chất lượng cao, giá cả hợp lý, phục vụ mọi nhu cầu sáng tạo của bạn.
        </p>
        <NavigationLink href='/#best-selling'>
          <Button variant='neon' size='2xl' className='w-fit'>
            Khám phá ngay
          </Button>
        </NavigationLink>
      </Container>

      {/* Products */}
      <Container id='products' className='py-10 text-center'>
        <h2 className='font-clash-display text-4xl font-semibold'>
          Sản phẩm của chúng tôi
        </h2>
        <div className='mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
          {BEST_SELLING_PRODUCTS.slice(0, 12).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>


      {/* Promotional Banners */}
      <Container className='py-8'>
        <PromotionalBanners />
      </Container>

      {/* Best Selling Products */}
      <Container id='best-selling' className='py-10 text-center'>
        <h2 className='font-clash-display text-4xl font-semibold'>
          Sản phẩm bán chạy
        </h2>
        <div className='mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
          {BEST_SELLING_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>

      {/* YouTube Shorts Videos Section */}
      <Container id='youtube-shorts' className='py-10'>
        <YouTubeShortsGallery videoUrls={YOUTUBE_SHORTS_VIDEOS} />
      </Container>
    </div>
  )
}
