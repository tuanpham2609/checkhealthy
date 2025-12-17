/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/styles'

// Lazy load YouTube Shorts video component for better performance
const YouTubeShortsVideo = dynamic(
  () => import('@/components/molecules/tiktok-video').then((mod) => mod.YouTubeShortsVideo),
  {
    ssr: false,
    loading: () => (
      <div className='flex aspect-[9/16] items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </div>
    ),
  }
)

interface YouTubeShortsGalleryProps {
  readonly videoUrls: readonly string[]
  readonly className?: string
}

/**
 * YouTube Shorts Gallery Component
 * Displays a grid of YouTube Shorts videos
 */
export function YouTubeShortsGallery({ videoUrls, className }: YouTubeShortsGalleryProps) {
  const hasVideos = videoUrls && videoUrls.length > 0

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className='mb-8 flex flex-col items-center gap-4 text-center md:mb-12'>
        <h2 className='font-clash-display text-3xl font-semibold md:text-4xl lg:text-5xl'>
          Video YouTube Shorts
        </h2>
        <p className='max-w-2xl text-muted-foreground'>
          Xem các video hướng dẫn vẽ và sáng tạo nghệ thuật trực tiếp trên trang
        </p>
      </div>

      {/* Video Grid - Larger display for better viewing */}
      {hasVideos ? (
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
          {videoUrls.map((url, index) => (
            <YouTubeShortsVideo key={`${url}-${index}`} videoUrl={url} />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 py-16 px-8 text-center'>
          <p className='mb-4 text-lg font-medium text-muted-foreground'>
            Chưa có video YouTube Shorts
          </p>
          <p className='mb-6 max-w-md text-sm text-muted-foreground/80'>
            Thêm video URL vào file <code className='rounded bg-primary/10 px-2 py-1 text-xs'>src/constants/tiktok.constants.ts</code> để hiển thị video tại đây
          </p>
        </div>
      )}
    </div>
  )
}
