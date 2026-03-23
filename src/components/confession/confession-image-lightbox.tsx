/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/styles'

interface ConfessionImageLightboxProps {
  urls: string[]
  index: number
  onClose: () => void
  onIndexChange: (next: number) => void
}

export function ConfessionImageLightbox({ urls, index, onClose, onIndexChange }: ConfessionImageLightboxProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const safe = urls.length ? Math.min(Math.max(0, index), urls.length - 1) : 0
  const url = urls[safe]
  const hasPrev = safe > 0
  const hasNext = safe < urls.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(safe - 1)
  }, [hasPrev, onIndexChange, safe])

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(safe + 1)
  }, [hasNext, onIndexChange, safe])

  useEffect(() => {
    if (!mounted || !url) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mounted, url])

  useEffect(() => {
    if (!mounted) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mounted, onClose, goPrev, goNext])

  if (!url || urls.length === 0 || !mounted) return null

  return createPortal(
    <div
      className='fixed inset-0 z-[200] flex items-center justify-center bg-black/92 p-3 pt-16 pb-8 backdrop-blur-sm sm:p-6 sm:pt-20'
      role='dialog'
      aria-modal='true'
      aria-label='Xem ảnh phóng to'
      onClick={onClose}
    >
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className='absolute top-3 right-3 z-20 flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none'
        aria-label='Đóng'
      >
        <X className='size-6' strokeWidth={2} />
      </button>

      {urls.length > 1 ? (
        <p
          className='absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white/90'
          onClick={(e) => e.stopPropagation()}
        >
          {safe + 1} / {urls.length}
        </p>
      ) : null}

      {hasPrev ? (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            goPrev()
          }}
          className='absolute top-1/2 left-2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none sm:left-4'
          aria-label='Ảnh trước'
        >
          <ChevronLeft className='size-7' strokeWidth={2} />
        </button>
      ) : null}
      {hasNext ? (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation()
            goNext()
          }}
          className='absolute top-1/2 right-2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none sm:right-4'
          aria-label='Ảnh sau'
        >
          <ChevronRight className='size-7' strokeWidth={2} />
        </button>
      ) : null}

      <div
        className={cn(
          'relative z-10 h-[min(85dvh,calc(100vw-2rem))] w-full max-w-[min(100vw-2rem,1200px)]',
          'touch-pan-y'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={url}
          alt=''
          fill
          className='object-contain'
          sizes='(max-width: 1200px) 100vw, 1200px'
          priority
        />
      </div>
    </div>,
    document.body
  )
}
