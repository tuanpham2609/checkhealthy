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
    <svg
      viewBox='0 0 1024 1025'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn(s.ei, className)}
      onTransitionEnd={(e) => {
        const target = e.target as SVGElement
        if (target.classList.contains(s.show) && setIntroOut) {
          setIntroOut(true)
        }
      }}
    >
      <g clipPath='url(#clip0_8893_5810)' className={cn(s.start, isLoaded && s.show)}>
        <path
          d='M0 183.907C0 82.8391 81.9319 0.907227 183 0.907227H841C942.068 0.907227 1024 82.8391 1024 183.907V841.907C1024 942.975 942.068 1024.91 841 1024.91H183C81.9319 1024.91 0 942.975 0 841.907V183.907Z'
          fill='url(#paint0_linear_8893_5810)'
        />
        <g filter='url(#filter0_ddiii_8893_5810)'>
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M121.879 225.065C121.879 189.681 150.563 160.997 185.947 160.997H291.279H382.494H699.032C798.887 160.997 879.834 241.945 879.834 341.799C879.834 384.824 864.806 424.339 839.711 455.381C874.481 488.776 896.123 535.738 896.123 587.754C896.123 689.108 813.96 771.271 712.606 771.271H440.413L221.781 917.324L282.559 289.133H185.947C150.563 289.133 121.879 260.449 121.879 225.065ZM567.638 292.099C471.222 292.099 393.061 370.26 393.061 466.676C393.061 563.093 471.222 641.253 567.638 641.253H710.433C739.981 641.253 763.933 617.301 763.933 587.753C763.933 558.206 739.981 534.253 710.433 534.253H567.638C530.316 534.253 500.061 503.998 500.061 466.676C500.061 429.354 530.316 399.099 567.638 399.099H695.864C725.411 399.099 749.364 375.146 749.364 345.599C749.364 316.051 725.411 292.099 695.864 292.099H567.638Z'
            fill='url(#paint1_linear_8893_5810)'
          />
        </g>
      </g>
      <defs className={cn(s.start, isLoaded && s.show)}>
        <filter
          id='filter0_ddiii_8893_5810'
          x='41.8789'
          y='120.997'
          width='934.244'
          height='916.327'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='40' />
          <feGaussianBlur stdDeviation='40' />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.13 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_8893_5810' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='40' />
          <feGaussianBlur stdDeviation='10' />
          <feComposite in2='hardAlpha' operator='out' />
          <feColorMatrix type='matrix' values='0 0 0 0 0.00764064 0 0 0 0 0.248623 0 0 0 0 0.0156734 0 0 0 0.2 0' />
          <feBlend mode='normal' in2='effect1_dropShadow_8893_5810' result='effect2_dropShadow_8893_5810' />
          <feBlend mode='normal' in='SourceGraphic' in2='effect2_dropShadow_8893_5810' result='shape' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='4' />
          <feGaussianBlur stdDeviation='20' />
          <feComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.26 0' />
          <feBlend mode='normal' in2='shape' result='effect3_innerShadow_8893_5810' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='-31' />
          <feGaussianBlur stdDeviation='20' />
          <feComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1' />
          <feColorMatrix type='matrix' values='0 0 0 0 0.352941 0 0 0 0 0.745098 0 0 0 0 0.290196 0 0 0 1 0' />
          <feBlend mode='normal' in2='effect3_innerShadow_8893_5810' result='effect4_innerShadow_8893_5810' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='-4' />
          <feGaussianBlur stdDeviation='20' />
          <feComposite in2='hardAlpha' operator='arithmetic' k2='-1' k3='1' />
          <feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.53 0' />
          <feBlend mode='normal' in2='effect4_innerShadow_8893_5810' result='effect5_innerShadow_8893_5810' />
        </filter>
        <linearGradient
          id='paint0_linear_8893_5810'
          x1='512'
          y1='0.907227'
          x2='512'
          y2='1024.91'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#00FF6D' />
          <stop offset='1' stopColor='#00BA00' />
        </linearGradient>
        <linearGradient
          id='paint1_linear_8893_5810'
          x1='509.001'
          y1='160.997'
          x2='575.5'
          y2='869.909'
          gradientUnits='userSpaceOnUse'
        >
          <stop offset='0.0664868' stopColor='#EEF1EF' />
          <stop offset='0.437457' stopColor='#F7F8F7' />
          <stop offset='0.980769' stopColor='#BFCFBF' />
        </linearGradient>
        <clipPath id='clip0_8893_5810'>
          <rect width='1024' height='1024' fill='white' transform='translate(0 0.907227)' />
        </clipPath>
      </defs>
    </svg>
  )
}
