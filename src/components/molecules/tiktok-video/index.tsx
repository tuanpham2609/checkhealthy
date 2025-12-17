/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/styles'
import { Play } from 'lucide-react'

interface YouTubeShortsVideoProps {
  readonly videoUrl: string
  readonly className?: string
}

interface YouTubeOEmbedData {
  readonly title: string
  readonly author_name: string
  readonly author_url: string
  readonly thumbnail_url?: string
  readonly html?: string
}

/**
 * Extract video ID from YouTube Shorts URL
 * Supports formats:
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID
 */
function extractVideoId(url: string): string | null {
  try {
    // YouTube Shorts format: /shorts/VIDEO_ID
    let match = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/)
    if (match && match[1]) {
      return match[1]
    }
    
    // YouTube watch format: ?v=VIDEO_ID
    match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
    if (match && match[1]) {
      return match[1]
    }
    
    // youtu.be format: /VIDEO_ID
    match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
    if (match && match[1]) {
      return match[1]
    }
    
    return null
  } catch {
    return null
  }
}

/**
 * YouTube Shorts Video Embed Component
 * Shows preview thumbnail, loads video player when user clicks
 */
export function YouTubeShortsVideo({ videoUrl, className }: YouTubeShortsVideoProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [oEmbedData, setOEmbedData] = useState<YouTubeOEmbedData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch video metadata and thumbnail
  useEffect(() => {
    async function fetchVideoData() {
      try {
        setIsLoading(true)
        setError(null)

        const extractedId = extractVideoId(videoUrl)
        if (!extractedId) {
          throw new Error('Không thể lấy video ID từ URL')
        }

        setVideoId(extractedId)

        // Fetch oEmbed data for thumbnail and metadata
        const response = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`
        )

        if (!response.ok) {
          throw new Error('Không thể tải thông tin video')
        }

        const data = await response.json()
        setOEmbedData({
          title: data.title || '',
          author_name: data.author_name || 'YouTube',
          author_url: data.author_url || videoUrl,
          thumbnail_url: data.thumbnail_url,
          html: data.html,
        })
      } catch (err) {
        console.error('Error fetching YouTube data:', err)
        setError('Không thể tải video YouTube')
      } finally {
        setIsLoading(false)
      }
    }

    if (videoUrl) {
      fetchVideoData()
    }
  }, [videoUrl])

  const handlePlayClick = () => {
    setIsPlaying(true)
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex aspect-[9/16] items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5',
          className
        )}
      >
        <div className='flex flex-col items-center gap-2'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>Đang tải video...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex aspect-[9/16] items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5',
          className
        )}
      >
        <p className='text-sm text-destructive'>{error}</p>
      </div>
    )
  }

  // Show video player if user clicked play - use YouTube iframe
  if (isPlaying && videoId) {
    return (
      <div
        className={cn(
          'relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black shadow-lg',
          className
        )}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          className='h-full w-full border-0 rounded-2xl'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
          title={oEmbedData?.title || 'YouTube Shorts Video'}
          loading='lazy'
        />
      </div>
    )
  }

  // Show preview with play button
  return (
    <div
      className={cn(
        'group relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer',
        className
      )}
      onClick={handlePlayClick}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handlePlayClick()
        }
      }}
    >
      {/* Thumbnail or gradient background */}
      {oEmbedData?.thumbnail_url ? (
        <img
          src={oEmbedData.thumbnail_url}
          alt={oEmbedData.title}
          className='h-full w-full object-cover'
        />
      ) : (
        <div className='h-full w-full bg-gradient-to-br from-primary/20 to-primary/10' />
      )}

      {/* Overlay with play button */}
      <div className='absolute inset-0 flex items-center justify-center bg-black/40 transition-all duration-300 group-hover:bg-black/50'>
        <div className='flex flex-col items-center gap-3'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-white'>
            <Play className='ml-1 h-8 w-8 fill-primary text-primary' />
          </div>
          <p className='text-sm font-medium text-white drop-shadow-lg'>
            Click để phát video
          </p>
        </div>
      </div>

      {/* Video info at bottom */}
      <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4'>
          <p className='line-clamp-2 text-sm font-medium text-white'>
          {oEmbedData?.title || 'YouTube Shorts Video'}
        </p>
        <p className='mt-1 text-xs text-white/80'>
          {oEmbedData?.author_name || 'YouTube'}
        </p>
      </div>
    </div>
  )
}
