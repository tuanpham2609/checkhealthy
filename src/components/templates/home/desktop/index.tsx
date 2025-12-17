/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { ReactNode, useEffect } from 'react'
import Lenis from 'lenis'
import dynamic from 'next/dynamic'
import { button, useControls } from 'leva'
import { useWindowSize } from '@/hooks/use-window-size'
import { useScroll } from '@/hooks/use-scroll'
import { Button } from '@/components/ui/button'
import { BEST_SELLING_PRODUCTS } from '@/constants/landing.constants'
import { useStore } from '@/lib/store'
import { Container } from '@/components/atoms/container'
import { ProductCard } from '@/components/molecules/product-card'
import Image from 'next/image'
import { Trans } from '@lingui/react/macro'
import { NavigationLink } from '@/components/atoms/navigation-link'
import { cn } from '@/lib/styles'

const AuroraText = dynamic(() => import('@/components/atoms/aurora-text').then(({ AuroraText }) => AuroraText), {
  ssr: false,
})

const AnimatedContent = dynamic(
  () => import('@/components/atoms/animated-content').then((AnimatedContent) => AnimatedContent),
  { ssr: false }
)

const AnimatedSequence = dynamic(
  () => import('@/components/atoms/animated-content').then(({ AnimatedSequence }) => AnimatedSequence),
  { ssr: false }
)

export default function HomeTemplateDesktop() {
  const { height: windowHeight } = useWindowSize()

  const lenis = useStore(({ lenis }) => lenis)
  const introOut = useStore(({ introOut }) => introOut)

  useControls(
    'lenis',
    () => ({
      stop: button(() => {
        lenis?.stop()
      }),
      start: button(() => {
        lenis?.start()
      }),
    }),
    [lenis]
  )

  useControls(
    'scrollTo',
    () => ({
      immediate: button(() => {
        lenis?.scrollTo(30000, { immediate: true })
      }),
      smoothDuration: button(() => {
        lenis?.scrollTo(30000, { lock: true, duration: 10 })
      }),
      smooth: button(() => {
        lenis?.scrollTo(30000)
      }),
      forceScrollTo: button(() => {
        lenis?.scrollTo(30000, { force: true })
      }),
    }),
    [lenis]
  )

  useEffect(() => {
    if (!lenis) return
    function onClassNameChange(lenis: Lenis) {
      console.info(lenis.className)
    }
    lenis.on('className change' as any, onClassNameChange)

    return () => {
      lenis.off('className change' as any, onClassNameChange)
    }
  }, [lenis])

  const addThreshold = useStore(({ addThreshold }) => addThreshold)

  useEffect(() => {
    addThreshold({ id: 'top', value: 0 })
    addThreshold({ id: 'intro', value: windowHeight / 4 })
  }, [])

  useEffect(() => {
    const top = lenis?.limit || 0
    addThreshold({ id: 'end', value: top })
  }, [lenis?.limit])


  return (
    <div className='relative min-h-dvh overflow-x-hidden'>
      {/* Hero Section */}
      <Container id='hero' className='flex min-h-dvh items-center pb-5 lg:pb-10 xl:pb-16'>
        <div className='grid w-full items-center lg:grid-cols-2'>
          <div className='flex w-full flex-col items-center gap-8 lg:items-start lg:gap-13'>
            <h1 className='font-clash-display flex flex-col text-center text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-start lg:text-6xl lg:leading-20'>
              <HeroTextIn introOut={introOut}>
                <AuroraText speed={0}>
                  <Trans>Khám Phá Nghệ Thuật.</Trans>
                </AuroraText>
              </HeroTextIn>
              <HeroTextIn introOut={introOut}>
                <AuroraText speed={0}>
                  <Trans>Họa Cụ Chất Lượng</Trans>
                </AuroraText>
              </HeroTextIn>
              <HeroTextIn introOut={introOut}>
                <AuroraText speed={0}>
                  <Trans>Cho Mọi Họa Sĩ</Trans>
                </AuroraText>
              </HeroTextIn>
            </h1>
            <HeroTextIn introOut={introOut}>
              <p className='max-w-md text-center lg:text-start'>
                <Trans>
                  Shop họa cụ mỹ thuật chuyên nghiệp với đầy đủ sản phẩm từ màu nước, màu dầu, cọ vẽ đến canvas. 
                  Chất lượng cao, giá cả hợp lý, phục vụ mọi nhu cầu sáng tạo của bạn.
                </Trans>
              </p>
            </HeroTextIn>
            <NavigationLink href='/#best-selling'>
              <Button
                variant={'neon'}
                size={'2xl'}
                className={cn('hide-button w-fit lg:relative', introOut && 'show-button')}
              >
                <span>
                  <Trans>Explore now</Trans>
                </span>
              </Button>
            </NavigationLink>
          </div>
          <div className='hidden w-full lg:block'>
            <Image src={'/assets/background/network.webp'} alt={'hero'} width={612} height={612} />
          </div>
        </div>
      </Container>

      {/* Products Section */}
      <Container id='products' className='min-h-dvh py-5 lg:py-10 xl:py-16'>
        <div className='flex h-full flex-col items-center gap-8 text-center lg:gap-12'>
          <AnimatedContent distance={50} threshold={0.7}>
            <h2 className='font-clash-display text-4xl font-semibold lg:text-5xl'>
              <Trans>Sản phẩm của chúng tôi</Trans>
            </h2>
          </AnimatedContent>
          <AnimatedSequence
            className='grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6'
            threshold={0.3}
            distance={100}
            stagger={0.1}
          >
            {BEST_SELLING_PRODUCTS.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatedSequence>
        </div>
      </Container>


      {/* Best Selling Products Section */}
      <Container id='best-selling' className='min-h-[70dvh] py-5 lg:min-h-[85dvh] lg:py-10 xl:py-16'>
        <div className='relative flex h-full w-full flex-col items-center justify-center gap-8 text-center lg:gap-12'>
          <AnimatedContent duration={3}>
            <h2 className='font-clash-display text-4xl font-semibold'>
              <Trans>Sản phẩm bán chạy</Trans>
            </h2>
          </AnimatedContent>
          <AnimatedSequence
            className='grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6'
            threshold={0.3}
            distance={100}
            stagger={0.1}
          >
            {BEST_SELLING_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatedSequence>
        </div>
      </Container>
    </div>
  )
}

const HeroTextIn = ({ children, introOut }: { children: ReactNode; introOut: boolean }) => {
  return <span className={cn('hide-text', introOut && 'show-text')}>{children}</span>
}
