/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { cn } from '@/lib/styles'

interface BestSellingBannerProps {
  readonly className?: string
}

export function BestSellingBanner({ className }: BestSellingBannerProps) {
  return (
    <div
      className={cn(
        'relative flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-100/30 via-yellow-200/40 to-yellow-300/30 p-8 dark:from-yellow-900/20 dark:via-yellow-800/30 dark:to-yellow-700/20',
        className
      )}
    >
      {/* Decorative elements - Art tools scattered */}
      <div className='absolute inset-0'>
        {/* Hand illustration with brush and pencil */}
        <div className='absolute left-1/4 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2'>
          {/* Hand shape - multi-colored */}
          <div className='relative h-28 w-20'>
            <div className='absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 via-orange-400 to-yellow-400 opacity-80'></div>
            <div className='absolute inset-2 rounded-full bg-gradient-to-br from-red-400 via-purple-400 to-blue-400 opacity-60'></div>
            
            {/* Green paintbrush - angled right */}
            <div className='absolute -right-3 top-6 rotate-12'>
              <div className='h-14 w-2.5 rounded-full bg-green-500 shadow-lg'></div>
              <div className='absolute bottom-0 h-3.5 w-5 rounded-b-full bg-black'></div>
            </div>
            
            {/* Purple pencil - angled left */}
            <div className='absolute -left-3 top-8 -rotate-12'>
              <div className='h-12 w-2 rounded-full bg-purple-500 shadow-lg'></div>
              <div className='absolute top-0 h-1.5 w-2.5 rounded-t-full bg-yellow-400'></div>
            </div>
          </div>
        </div>

        {/* Scattered colored pencils */}
        <div className='absolute left-8 top-4 h-8 w-1.5 rotate-12 rounded-full bg-yellow-400 shadow-md'></div>
        <div className='absolute right-16 top-6 h-10 w-1.5 -rotate-12 rounded-full bg-purple-500 shadow-md'></div>
        <div className='absolute bottom-8 left-20 h-9 w-1.5 rotate-45 rounded-full bg-green-500 shadow-md'></div>
        
        {/* Paint tubes */}
        <div className='absolute bottom-12 right-12 h-6 w-4 rotate-12 rounded-t-lg bg-red-500 shadow-md'></div>
        <div className='absolute top-20 right-8 h-6 w-4 -rotate-12 rounded-t-lg bg-blue-500 shadow-md'></div>
        
        {/* Paint roller */}
        <div className='absolute bottom-16 right-24 h-3 w-8 rotate-45 rounded-full bg-yellow-400 shadow-md'></div>
        <div className='absolute bottom-14 right-24 h-2 w-8 rotate-45 rounded-full bg-black shadow-md'></div>
        
        {/* Colorful splatters */}
        <div className='absolute left-12 top-12 h-3 w-3 rotate-45 rounded-full bg-pink-400/60 blur-sm'></div>
        <div className='absolute right-20 top-16 h-4 w-4 rotate-12 rounded-full bg-blue-400/60 blur-sm'></div>
        <div className='absolute bottom-20 left-32 h-3 w-3 -rotate-12 rounded-full bg-orange-400/60 blur-sm'></div>
      </div>

      {/* TOP BÁN CHẠY Text - Large and prominent */}
      <div className='relative z-20 text-center'>
        <div className='relative inline-block'>
          {/* Glow effect */}
          <div className='absolute -inset-4 rounded-3xl bg-yellow-400/20 blur-2xl'></div>
          
          {/* Text with blue outline effect */}
          <h2 className='relative text-5xl font-black uppercase leading-tight md:text-6xl lg:text-7xl'>
            <span 
              className='text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]'
              style={{
                textShadow: '2px 2px 0px #104e64, -2px -2px 0px #104e64, 2px -2px 0px #104e64, -2px 2px 0px #104e64',
              }}
            >
              TOP
            </span>
            <br />
            <span 
              className='text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]'
              style={{
                textShadow: '2px 2px 0px #104e64, -2px -2px 0px #104e64, 2px -2px 0px #104e64, -2px 2px 0px #104e64',
              }}
            >
              BÁN CHẠY
            </span>
          </h2>
        </div>
      </div>
    </div>
  )
}

