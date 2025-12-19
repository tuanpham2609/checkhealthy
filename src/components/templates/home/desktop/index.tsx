/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { useWindowSize } from '@/hooks/use-window-size'
import { BEST_SELLING_PRODUCTS } from '@/constants/landing.constants'
import { YOUTUBE_SHORTS_VIDEOS, YOUTUBE_SHORTS_VIDEOS_TOP } from '@/constants/tiktok.constants'
import { useStore } from '@/lib/store'
import { Container } from '@/components/atoms/container'
import { ProductCard } from '@/components/molecules/product-card'
import { PromotionalBanners } from '@/components/molecules/promotional-banners'
import { YouTubeShortsGallery } from '@/components/molecules/tiktok-gallery'
import { NavigationLink } from '@/components/atoms/navigation-link'
import { cn } from '@/lib/styles'

const AuroraText = dynamic(() => import('@/components/atoms/aurora-text').then(({ AuroraText }) => AuroraText), {
  ssr: false,
})

export default function HomeTemplateDesktop() {
  const { height: windowHeight } = useWindowSize()
  const introOut = useStore(({ introOut }) => introOut)


  return (
    <main className='relative min-h-dvh overflow-x-hidden'>
      {/* Promotional Banners */}
      <section aria-label='Banner khuyến mãi' className='py-8 lg:py-12'>
        <Container>
          <PromotionalBanners />
        </Container>
      </section>
      {/* Best Selling Products Section - Top (4 products) */}
      <section id='best-selling-top' itemScope itemType='https://schema.org/ItemList' className='min-h-[70dvh] py-5 lg:min-h-[85dvh] lg:py-10 xl:py-16'>
        <Container>
          <div className='relative flex h-full w-full flex-col items-center justify-center gap-8 text-center lg:gap-12'>
            <h1 className='font-clash-display text-4xl font-semibold' itemProp='name'>
              Sản phẩm hot nhất
            </h1>
            <div className='grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6'>
              {BEST_SELLING_PRODUCTS.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* YouTube Shorts Videos Section - Top */}
      <section id='youtube-shorts-top' aria-label='Video YouTube Shorts Top' className='min-h-dvh py-5 lg:py-10 xl:py-16'>
        <Container>
          <YouTubeShortsGallery videoUrls={YOUTUBE_SHORTS_VIDEOS_TOP} />
        </Container>
      </section>

      {/* Best Selling Products Section */}
      <section id='best-selling' itemScope itemType='https://schema.org/ItemList' className='min-h-[70dvh] py-5 lg:min-h-[85dvh] lg:py-10 xl:py-16'>
        <Container>
          <div className='relative flex h-full w-full flex-col items-center justify-center gap-8 text-center lg:gap-12'>
            <h2 className='font-clash-display text-4xl font-semibold' itemProp='name'>
              Sản phẩm bán chạy
            </h2>
            <div className='grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6'>
              {BEST_SELLING_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Promotional Banners */}
      <section aria-label='Banner khuyến mãi' className='py-8 lg:py-12'>
        <Container>
          <PromotionalBanners />
        </Container>
      </section>

      {/* Products Section */}
      <section id='products' itemScope itemType='https://schema.org/ItemList' className='min-h-dvh py-5 lg:py-10 xl:py-16'>
        <Container>
          <div className='flex h-full flex-col items-center gap-8 text-center lg:gap-12'>
            <h2 className='font-clash-display text-4xl font-semibold lg:text-5xl' itemProp='name'>
              Sản phẩm của chúng tôi
            </h2>
            <div className='grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6'>
              {BEST_SELLING_PRODUCTS.slice(0, 12).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* YouTube Shorts Videos Section */}
      <section id='youtube-shorts' aria-label='Video YouTube Shorts' className='min-h-dvh py-5 lg:py-10 xl:py-16'>
        <Container>
          <YouTubeShortsGallery videoUrls={YOUTUBE_SHORTS_VIDEOS} />
        </Container>
      </section>
    </main>
  )
}

const HeroTextIn = ({ children, introOut }: { children: ReactNode; introOut: boolean }) => {
  return <span className={cn('hide-text', introOut && 'show-text')}>{children}</span>
}
