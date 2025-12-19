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
import Image from 'next/image'

export function PromotionalBanners() {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
      {/* Banner 1 */}
      <BannerImage src='/assets/banner_coll_3.png' alt='Banner 1' />
      
      {/* Banner 2 */}
      <BannerImage src='/assets/unnamed (1).jpg' alt='Banner 2' />
      
      {/* Banner 3 */}
      <BannerImage src='/assets/unnamed.jpg' alt='Banner 3' />
    </div>
  )
}

interface BannerImageProps {
  src: string
  alt: string
}

function BannerImage({ src, alt }: BannerImageProps) {
  return (
    <a
      href='https://shopee.vn/shopmythuatcmc'
      target='_blank'
      rel='noopener noreferrer'
      className='block cursor-pointer no-underline'
    >
      <div className='group relative h-64 overflow-hidden rounded-3xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl'>
        <Image
          src={src}
          alt={alt}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-110'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
      </div>
    </a>
  )
}

interface BannerCardProps {
  variant: 'best-seller' | 'top-selling' | 'top-best'
  title: string
  subtitle: string
  description: string
}

function BannerCard({ variant, title, subtitle, description }: BannerCardProps) {
  const variants = {
    'best-seller': {
      bg: 'bg-gradient-to-br from-blue-500 via-yellow-400 to-pink-500',
      textColor: 'text-white',
      outlineColor: 'text-yellow-300',
      artTools: (
        <>
          {/* Paint tubes */}
          <div className='absolute left-4 top-6 h-8 w-6 rotate-12 rounded-t-lg bg-white shadow-lg'>
            <div className='absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-500'></div>
            <div className='absolute bottom-0 left-0 right-0 h-1 rounded-b-lg bg-yellow-400'></div>
          </div>
          <div className='absolute right-8 top-8 h-7 w-5 -rotate-12 rounded-t-lg bg-white shadow-lg'>
            <div className='absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-pink-500'></div>
            <div className='absolute bottom-0 left-0 right-0 h-1 rounded-b-lg bg-red-500'></div>
          </div>

          {/* Paintbrushes */}
          <div className='absolute left-12 top-12 h-10 w-2 rotate-45 rounded-full bg-white shadow-md'>
            <div className='absolute bottom-0 h-3 w-4 rounded-b-full bg-black'></div>
          </div>
          <div className='absolute right-12 top-16 h-12 w-2 -rotate-12 rounded-full bg-white shadow-md'>
            <div className='absolute bottom-0 h-3 w-4 rounded-b-full bg-red-500'></div>
          </div>

          {/* Paint palette */}
          <div className='absolute bottom-8 left-8 h-12 w-16 rounded-full bg-white shadow-lg'>
            <div className='absolute left-2 top-2 h-3 w-3 rounded-full bg-yellow-400'></div>
            <div className='absolute right-2 top-2 h-3 w-3 rounded-full bg-pink-400'></div>
            <div className='absolute bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-blue-400'></div>
          </div>

          {/* Watercolor pan */}
          <div className='absolute bottom-12 right-6 h-8 w-10 rounded-lg bg-white shadow-md'>
            <div className='grid grid-cols-3 gap-1 p-1'>
              <div className='h-2 rounded bg-blue-400'></div>
              <div className='h-2 rounded bg-yellow-400'></div>
              <div className='h-2 rounded bg-pink-400'></div>
            </div>
          </div>

          {/* Pencils */}
          <div className='absolute left-6 top-20 h-8 w-1.5 rotate-12 rounded-full bg-yellow-300 shadow-md'></div>
          <div className='absolute right-16 top-24 h-10 w-1.5 -rotate-12 rounded-full bg-pink-300 shadow-md'></div>
          <div className='absolute bottom-16 left-20 h-9 w-1.5 rotate-45 rounded-full bg-blue-300 shadow-md'></div>

          {/* Paint splatters */}
          <div className='absolute left-20 top-8 h-4 w-4 rotate-45 rounded-full bg-yellow-400/60 blur-sm'></div>
          <div className='absolute right-20 top-12 h-5 w-5 rotate-12 rounded-full bg-pink-400/60 blur-sm'></div>
          <div className='absolute bottom-20 left-32 h-4 w-4 -rotate-12 rounded-full bg-blue-400/60 blur-sm'></div>
        </>
      ),
    },
    'top-selling': {
      bg: 'bg-gradient-to-br from-amber-50 via-rose-50 to-blue-50 dark:from-amber-900/20 dark:via-rose-900/20 dark:to-blue-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      outlineColor: 'text-blue-600 dark:text-blue-400',
      artTools: (
        <>
          {/* Abstract shapes */}
          <div className='absolute left-6 top-6 h-16 w-16 rounded-full bg-pink-200/40 dark:bg-pink-500/20 blur-sm'></div>
          <div className='absolute right-8 top-8 h-12 w-12 rounded-full bg-blue-200/40 dark:bg-blue-500/20 blur-sm'></div>
          <div className='absolute bottom-8 left-12 h-14 w-14 rounded-full bg-amber-200/40 dark:bg-amber-500/20 blur-sm'></div>

          {/* Dotted lines */}
          <div className='absolute left-4 top-16 h-0.5 w-20 border-t-2 border-dotted border-pink-300/50'></div>
          <div className='absolute right-4 bottom-16 h-0.5 w-20 border-t-2 border-dotted border-blue-300/50'></div>

          {/* Stars */}
          <div className='absolute left-12 top-12 text-yellow-400 text-lg'>✦</div>
          <div className='absolute right-12 bottom-12 text-pink-400 text-lg'>✦</div>
          <div className='absolute left-1/2 top-8 -translate-x-1/2 text-blue-400 text-sm'>✦</div>

          {/* Pencil */}
          <div className='absolute right-8 top-16 h-12 w-2 rotate-12 rounded-full bg-yellow-400 shadow-md'>
            <div className='absolute top-0 h-1.5 w-2.5 rounded-t-full bg-orange-500'></div>
          </div>

          {/* Paint palette */}
          <div className='absolute bottom-10 left-8 h-10 w-14 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md'>
            <div className='flex gap-1 p-1.5'>
              <div className='h-2 w-2 rounded-full bg-blue-400'></div>
              <div className='h-2 w-2 rounded-full bg-pink-400'></div>
              <div className='h-2 w-2 rounded-full bg-yellow-400'></div>
            </div>
          </div>

          {/* Paint roller */}
          <div className='absolute bottom-12 right-12 h-3 w-10 rotate-45 rounded-full bg-orange-400 shadow-md'></div>
          <div className='absolute bottom-10 right-12 h-2 w-10 rotate-45 rounded-full bg-black shadow-md'></div>

          {/* Cup with brushes */}
          <div className='absolute bottom-6 left-16 h-8 w-8 rounded-b-lg bg-yellow-300 shadow-md'>
            <div className='absolute -top-2 left-1/2 h-3 w-1 -translate-x-1/2 rotate-12 rounded-full bg-blue-400'></div>
            <div className='absolute -top-1 left-1/2 h-4 w-1 -translate-x-1/2 -rotate-12 rounded-full bg-pink-400'></div>
          </div>
        </>
      ),
    },
    'top-best': {
      bg: 'bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-300',
      textColor: 'text-orange-600',
      outlineColor: 'text-blue-600',
      artTools: (
        <>
          {/* Abstract shapes */}
          <div className='absolute left-4 top-4 h-20 w-20 rounded-full bg-white/30 blur-md'></div>
          <div className='absolute right-6 top-6 h-16 w-16 rounded-full bg-pink-300/40 blur-md'></div>
          <div className='absolute bottom-6 left-8 h-18 w-18 rounded-full bg-blue-300/30 blur-md'></div>

          {/* Stars */}
          <div className='absolute left-8 top-8 text-white text-xl'>✦</div>
          <div className='absolute right-10 top-10 text-pink-300 text-lg'>✦</div>
          <div className='absolute bottom-10 left-12 text-white text-sm'>✦</div>

          {/* Hand with tools - simplified */}
          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
            {/* Hand shape */}
            <div className='relative h-20 w-16'>
              <div className='absolute inset-0 rounded-full bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 shadow-lg'></div>
              
              {/* Green marker */}
              <div className='absolute -right-2 top-4 rotate-12 h-10 w-3 rounded-full bg-green-500 shadow-md'>
                <div className='absolute top-0 h-2 w-3 rounded-t-full bg-green-600'></div>
              </div>
              
              {/* Purple pencil */}
              <div className='absolute -left-2 top-6 -rotate-12 h-8 w-2 rounded-full bg-purple-500 shadow-md'>
                <div className='absolute top-0 h-1.5 w-2.5 rounded-t-full bg-yellow-400'></div>
              </div>
              
              {/* Red brush */}
              <div className='absolute right-0 top-8 rotate-45 h-6 w-1.5 rounded-full bg-red-500 shadow-md'>
                <div className='absolute bottom-0 h-2 w-3 rounded-b-full bg-black'></div>
              </div>
            </div>
          </div>

          {/* Scattered markers */}
          <div className='absolute left-8 top-16 h-8 w-2.5 rotate-12 rounded-full bg-blue-500 shadow-md'>
            <div className='absolute top-0 h-2 w-2.5 rounded-t-full bg-blue-600'></div>
          </div>
          <div className='absolute right-12 top-20 h-10 w-2.5 -rotate-12 rounded-full bg-pink-500 shadow-md'>
            <div className='absolute top-0 h-2 w-2.5 rounded-t-full bg-pink-600'></div>
          </div>
          <div className='absolute bottom-12 left-16 h-9 w-2.5 rotate-45 rounded-full bg-yellow-500 shadow-md'>
            <div className='absolute top-0 h-2 w-2.5 rounded-t-full bg-yellow-600'></div>
          </div>

          {/* Paint tubes */}
          <div className='absolute bottom-8 right-8 h-6 w-4 rotate-12 rounded-t-lg bg-white shadow-md'>
            <div className='absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-green-500'></div>
          </div>
          <div className='absolute top-20 right-6 h-6 w-4 -rotate-12 rounded-t-lg bg-white shadow-md'>
            <div className='absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-red-500'></div>
          </div>

          {/* Paint roller */}
          <div className='absolute bottom-14 right-20 h-3 w-8 rotate-45 rounded-full bg-white shadow-md'></div>
          <div className='absolute bottom-12 right-20 h-2 w-8 rotate-45 rounded-full bg-black shadow-md'></div>

          {/* Paint splatters */}
          <div className='absolute left-12 top-12 h-3 w-3 rotate-45 rounded-full bg-white/60 blur-sm'></div>
          <div className='absolute right-16 top-16 h-4 w-4 rotate-12 rounded-full bg-pink-300/60 blur-sm'></div>
          <div className='absolute bottom-16 left-24 h-3 w-3 -rotate-12 rounded-full bg-blue-300/60 blur-sm'></div>
        </>
      ),
    },
  }

  const style = variants[variant]

  return (
    <div
      className={cn(
        'group relative h-64 overflow-hidden rounded-3xl p-6 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl',
        style.bg
      )}
    >
      {/* Art tools decoration */}
      <div className='absolute inset-0'>{style.artTools}</div>

      {/* Content */}
      <div className='relative z-10 flex h-full flex-col items-center justify-center text-center'>
        {/* Glow effect */}
        <div className='absolute -inset-4 rounded-3xl bg-white/20 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>

        {/* Title */}
        <h3
          className={cn(
            'font-clash-display text-4xl font-black uppercase leading-tight md:text-5xl',
            style.textColor
          )}
          style={{
            textShadow: variant === 'best-seller' 
              ? '3px 3px 0px rgba(255,215,0,0.8), -3px -3px 0px rgba(255,215,0,0.8)'
              : variant === 'top-selling'
              ? '2px 2px 0px rgba(59,130,246,0.6), -2px -2px 0px rgba(59,130,246,0.6)'
              : '2px 2px 0px rgba(37,99,235,0.6), -2px -2px 0px rgba(37,99,235,0.6)',
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        <h4
          className={cn(
            'font-clash-display mt-2 text-3xl font-black uppercase md:text-4xl',
            style.outlineColor
          )}
          style={{
            textShadow: variant === 'best-seller'
              ? '2px 2px 0px rgba(255,255,255,0.8), -2px -2px 0px rgba(255,255,255,0.8)'
              : variant === 'top-selling'
              ? '2px 2px 0px rgba(249,115,22,0.6), -2px -2px 0px rgba(249,115,22,0.6)'
              : '2px 2px 0px rgba(249,115,22,0.6), -2px -2px 0px rgba(249,115,22,0.6)',
          }}
        >
          {subtitle}
        </h4>

        {/* Description */}
        <p className={cn('mt-3 text-sm font-semibold opacity-90', style.textColor)}>
          {description}
        </p>
      </div>
    </div>
  )
}

