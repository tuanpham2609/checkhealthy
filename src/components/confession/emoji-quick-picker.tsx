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
        <div
          role='dialog'
          aria-label='Chọn emoji'
          className='ui-surface absolute bottom-full left-0 z-50 mb-2 w-[min(100vw-2rem,280px)] p-2.5 shadow-xl'
        >
          <div className='grid grid-cols-6 gap-1 sm:grid-cols-9'>
            {QUICK_EMOJIS.map((em) => (
              <button
                key={em}
                type='button'
                className='flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-all duration-200 hover:bg-slate-100 hover:ring-1 hover:ring-slate-200/80 active:scale-95 dark:hover:bg-zinc-800 dark:hover:ring-zinc-600'
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
      )}
    </div>
  )
}
