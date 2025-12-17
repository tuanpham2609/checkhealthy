/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useLayoutEffect, useRef, ReactNode, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useWindowSize } from '@/hooks/use-window-size'
import { cn } from '@/lib/styles'
import AnimatedContent from '@/components/atoms/animated-content'
import { BACKGROUND_ENUM } from '@/constants/landing.constants'
import { useStore } from '@/lib/store'
import { useIsTablet } from '@/hooks/use-tablet'

gsap.registerPlugin(ScrollTrigger)

interface HorizontalSlidesProps {
  children: ReactNode
}

export default function FeaturesSlidesHorizontal({ children }: HorizontalSlidesProps) {
  const isTablet = useIsTablet()
  const { width: windowWidth } = useWindowSize()

  const [step, setStep] = useState<number>(0)
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (!targetRef.current || !triggerRef.current || isTablet) return

    const ctx = gsap.context(() => {
      const container = targetRef.current!
      const cards = Array.from(container.children) as HTMLElement[]

      // reset styles
      gsap.set(cards[0], { opacity: 1 })

      const totalScroll = container.scrollWidth - windowWidth / 2 + 50

      const scrollTrack = gsap.to(container, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          id: 'horizontal-scroll',
          trigger: triggerRef.current,
          start: 'top top',
          end: `+=${totalScroll + 100}`,
          scrub: 1,
          pin: true,
        },
      })

      cards.forEach((card, idx) => {
        gsap.to(card, {
          opacity: 1,
          scrollTrigger: {
            id: `card-fade-in-${idx}`,
            trigger: card,
            start: 'left 49%',
            end: 'center-=30% 44%',
            scrub: true,
            containerAnimation: scrollTrack,
          },
        })

        const title = card.querySelector('[data-title]')
        const icon = card.querySelector('[data-icon]')
        const desc = card.querySelector('[data-desc]')

        if (!title || !icon || !desc) return

        const tl = gsap.timeline({
          scrollTrigger: {
            id: `card-fade-out-${idx}`,
            trigger: card,
            start: 'center+=10% 45%',
            end: 'center+=30% 45%',
            scrub: true,
            containerAnimation: scrollTrack,
            onLeave: () => {
              setStep(idx + 1)
            },
            onEnterBack: () => {
              setStep(idx)
            },
          },
        })

        tl.to(card.querySelector('[data-title]'), { y: 30, opacity: 0, duration: 0.6 }, '<0.1')
          .to(card.querySelector('[data-icon]'), { y: 30, opacity: 0, duration: 0.6 }, '<0.1')
          .to(card.querySelector('[data-subtitle]'), { y: 30, opacity: 0, duration: 0.6 }, '<0.1')
          .to(card.querySelector('[data-desc]'), { y: 30, opacity: 0, duration: 0.6 }, '<0.1')
      })
    }, targetRef)

    return () => {
      ctx.revert()
    }
  }, [windowWidth, isTablet])

  return (
    <div data-slot='trigger' ref={triggerRef} className='relative lg:z-[-1]'>
      <AnimatedContent
        distance={0}
        threshold={0.36}
        className={'absolute inset-y-2 left-0 z-[-1] h-screen w-[400px] lg:left-[1%] xl:left-[1%] 2xl:left-[2%]'}
      >
        <div className='relative h-full w-full scale-300'>
          <div data-color={BACKGROUND_ENUM[step]} className='background-glow' />
        </div>
      </AnimatedContent>
      <div
        className={cn(
          'absolute top-3/12 -translate-y-3/12',
          'flex items-center justify-center',
          'w-[12rem] min-w-[180px]',
          'left-2/12 -translate-x-8/12'
        )}
      >
        <h2
          className={cn(
            'font-clash-display relative left-1/12 hidden text-center text-4xl leading-tight font-semibold lg:text-start sm:portrait:inline-block sm:landscape:hidden lg:landscape:inline-block'
          )}
        >
          Features
        </h2>
      </div>
      <div
        data-slot='target'
        ref={targetRef}
        className={cn(
          'relative flex w-full items-center justify-start gap-8 py-8',
          'lg:h-screen lg:flex-row lg:flex-nowrap lg:px-16',
          'h-auto flex-col px-6'
        )}
      >
        {children}
      </div>
    </div>
  )
}
