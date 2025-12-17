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
import { BestSellingBanner } from '@/components/molecules/best-selling-banner'
import { ProductCard } from '@/components/molecules/product-card'
import { BEST_SELLING_PRODUCTS } from '@/constants/landing.constants'
import AnimatedContent from '@/components/atoms/animated-content'

export function BestSellingProducts() {
  return (
    <Container id='best-selling' className='py-10 lg:py-16'>
      <div className='flex flex-col gap-8'>
        {/* Title */}
        <AnimatedContent distance={50} threshold={0.3}>
          <h2 className='font-clash-display text-4xl font-bold lg:text-5xl'>
            HỌA CỤ BÁN CHẠY
          </h2>
        </AnimatedContent>

        {/* Banner */}
        <AnimatedContent distance={30} threshold={0.3}>
          <BestSellingBanner />
        </AnimatedContent>

        {/* Products Grid */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6'>
          {BEST_SELLING_PRODUCTS.map((product, index) => (
            <AnimatedContent
              key={product.id}
              distance={50}
              threshold={0.3}
              delay={index * 0.1}
              mode='once'
            >
              <ProductCard product={product} />
            </AnimatedContent>
          ))}
        </div>
      </div>
    </Container>
  )
}

