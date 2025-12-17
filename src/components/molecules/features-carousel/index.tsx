/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { BACKGROUND_ENUM } from '@/constants/landing.constants'
import { useEffect } from 'react'
import { cn } from '@/lib/styles'

interface FeaturesCarouselProps {
  children: React.ReactNode
}

export function FeaturesCarousel({ children }: FeaturesCarouselProps) {
  const slides = React.Children.toArray(children)

  const [carousel, setCarousel] = React.useState<CarouselApi | null>(null)
  const [state, setState] = React.useState({ current: 1, count: slides.length })

  useEffect(() => {
    if (!carousel) return
    const update = () =>
      setState({
        current: carousel.selectedScrollSnap() + 1,
        count: carousel.scrollSnapList().length,
      })
    update()
    carousel.on('select', update)
  }, [carousel])

  if (slides.length === 0) return null

  return (
    <div className='w-full'>
      <Carousel setApi={setCarousel} className='relative w-full'>
        <div data-color={BACKGROUND_ENUM[state.current - 1]} className='background-glow translate-x-[20%] scale-140' />
        <CarouselContent>
          {slides.map((slide, idx) => (
            <CarouselItem key={idx}>{slide}</CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className='mt-4 flex items-center justify-center gap-2.5 md:hidden'>
        {Array.from({ length: state.count }).map((_, index) => (
          <button
            key={index}
            onClick={() => carousel?.scrollTo(index)}
            className={cn('bg-primary/10 h-2 w-7 rounded-full', {
              'bg-primary': state.current === index + 1,
            })}
          />
        ))}
      </div>
    </div>
  )
}
