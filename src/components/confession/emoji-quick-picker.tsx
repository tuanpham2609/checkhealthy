/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { QUICK_EMOJIS } from '@/constants/emoji-quick'
import { cn } from '@/lib/styles'

interface EmojiQuickPickerProps {
  onPick: (emoji: string) => void
  className?: string
  children: React.ReactNode
}

export function EmojiQuickPicker({ onPick, className, children }: EmojiQuickPickerProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  /** Khóa scroll nền khi popup fixed trên mobile (tránh kéo nền) */
  useEffect(() => {
    if (!open) return
    const mq = window.matchMedia('(max-width: 639px)')
    if (!mq.matches) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type='button'
        aria-expanded={open}
        aria-haspopup='dialog'
        aria-label='Chèn emoji'
        onClick={() => setOpen((v) => !v)}
        className='ui-icon-btn text-slate-500 dark:text-zinc-400'
      >
        {children}
      </button>
      {open && (
        <>
          <button
            type='button'
            tabIndex={-1}
            aria-hidden
            className='fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px] sm:hidden'
            onClick={() => setOpen(false)}
          />
          <div
            role='dialog'
            aria-label='Chọn emoji'
            className={cn(
              'ui-surface z-[70] flex w-[min(calc(100vw-1.5rem),360px)] flex-col p-0 shadow-xl',
              'max-sm:fixed max-sm:left-1/2 max-sm:top-1/2 max-sm:max-h-[min(88dvh,560px)] max-sm:-translate-x-1/2 max-sm:-translate-y-1/2',
              'sm:absolute sm:bottom-full sm:left-0 sm:mb-2 sm:max-h-none sm:w-[min(100vw-2rem,280px)] sm:translate-x-0 sm:translate-y-0'
            )}
          >
            <div className='min-h-0 overflow-y-auto overscroll-contain p-2.5 max-sm:max-h-[min(82dvh,480px)] sm:max-h-none sm:overflow-visible'>
              <div className='grid grid-cols-6 gap-1 sm:grid-cols-9'>
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type='button'
                    className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-200 hover:bg-slate-100 hover:ring-1 hover:ring-slate-200/80 active:scale-95 dark:hover:bg-zinc-800 dark:hover:ring-zinc-600'
                    onClick={() => {
                      onPick(em)
                      setOpen(false)
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
