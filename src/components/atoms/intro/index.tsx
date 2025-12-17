/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/styles'
import Image from 'next/image'
import s from './intro.module.css'

export const Intro = () => {
  const isMobile = useIsMobile()
  const [isLoaded, setIsLoaded] = useState(false)
  const [scroll, setScroll] = useState(false)
  const introOut = useStore(({ introOut }) => introOut)
  const setIntroOut = useStore(({ setIntroOut }) => setIntroOut)
  const lenis = useStore(({ lenis }) => lenis)

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true)
    }, 1000)
  }, [])

  useEffect(() => {
    if (isMobile) {
      lenis?.start()
      document.documentElement.classList.toggle('intro', false)
      return
    }

    if (!scroll) {
      document.documentElement.classList.toggle('intro', true)
    }

    if (!lenis) return
    if (scroll) {
      lenis.start()
      document.documentElement.classList.toggle('intro', false)
    } else {
      setTimeout(() => {
        lenis.stop()
      }, 0)

      document.documentElement.classList.toggle('intro', true)
    }
  }, [scroll, lenis, isMobile])

  return (
    <div
      className={cn(s.wrapper, isLoaded && s.out)}
      onTransitionEnd={(e) => {
        e.currentTarget.classList.forEach((value) => {
          if (value.includes('out')) {
            setScroll(true)
          }
          if (value.includes('show')) {
            setIntroOut(true)
          }
        })
      }}
    >
      <div className={cn('relative h-full', isLoaded && s.relative)}>
        <div className='absolute inset-0 h-full w-full'>
          <div className='relative left-[5%] z-[-1] h-full w-full scale-250 md:left-[2%] md:scale-80'>
            <div
              className={cn(
                'background-glow ease-out-expo scale-95 opacity-0 transition-all duration-[1500ms]',
                isLoaded && 'scale-100 opacity-100'
              )}
            />
          </div>
        </div>
        <Logo isLoaded={isLoaded} setIntroOut={setIntroOut} />
      </div>
    </div>
  )
}

interface ChartSVGProps {
  readonly isLoaded?: boolean
  readonly className?: string
  readonly setIntroOut?: (introOut: boolean) => void
}

const Logo = ({ isLoaded, className, setIntroOut }: ChartSVGProps) => {
  return (
    <div
      className={cn(s.ei, className, s.start, isLoaded && s.show)}
      onTransitionEnd={(e) => {
        const target = e.currentTarget
        if (target.classList.contains(s.show) && setIntroOut) {
          setIntroOut(true)
        }
      }}
    >
      <Image
        src='/assets/logocmc.png'
        alt='MỸ THUẬT CMC'
        width={180}
        height={180}
        className='h-full w-full object-contain'
        priority
      />
    </div>
  )
}
