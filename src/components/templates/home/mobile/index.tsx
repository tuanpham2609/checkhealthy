/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import Image from 'next/image'
import { Container } from '@/components/atoms/container'
import { Button } from '@/components/ui/button'
import { NavigationLink } from '@/components/atoms/navigation-link'
import { BEST_SELLING_PRODUCTS } from '@/constants/landing.constants'
import { ProductCard } from '@/components/molecules/product-card'
import { Trans } from '@lingui/react/macro'
import { AuroraText } from '@/components/atoms/aurora-text'

export default function HomeTemplateMobile() {
  return (
    <div className='relative min-h-dvh overflow-x-hidden'>
      {/* Hero */}
      <Container id='hero' className='flex flex-col items-center justify-center gap-6 py-10 text-center'>
        <h1 className='font-clash-display text-3xl font-extrabold'>
          <AuroraText speed={0}>
            <Trans>Khám Phá Nghệ Thuật. Họa Cụ Chất Lượng Cho Mọi Họa Sĩ</Trans>
          </AuroraText>
        </h1>
        <p className='max-w-md'>
          <Trans>
            Shop họa cụ mỹ thuật chuyên nghiệp với đầy đủ sản phẩm từ màu nước, màu dầu, cọ vẽ đến canvas. 
            Chất lượng cao, giá cả hợp lý, phục vụ mọi nhu cầu sáng tạo của bạn.
          </Trans>
        </p>
        <div className='relative flex h-svw w-full items-center justify-center'>
          <Image
            src={'/assets/background/network.webp'}
            alt={'network'}
            width={612}
            height={612}
            className='absolute top-1/2 left-1/2 z-[-1] -translate-x-1/2 -translate-y-1/2 object-contain'
          />
          <Image src={'/mobile/screen/1.webp'} alt='network' fill className='object-contain' />
        </div>
        <NavigationLink href='/#best-selling'>
          <Button variant='neon' size='2xl' className='w-fit'>
            <Trans>Khám phá ngay</Trans>
          </Button>
        </NavigationLink>
      </Container>

      {/* Products */}
      <Container id='products' className='py-10 text-center'>
        <h2 className='font-clash-display text-4xl font-semibold'>
          <Trans>Sản phẩm của chúng tôi</Trans>
        </h2>
        <div className='mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
          {BEST_SELLING_PRODUCTS.slice(0, 12).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>


      {/* Best Selling Products */}
      <Container id='best-selling' className='py-10 text-center'>
        <h2 className='font-clash-display text-4xl font-semibold'>
          <Trans>Sản phẩm bán chạy</Trans>
        </h2>
        <div className='mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
          {BEST_SELLING_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </div>
  )
}
