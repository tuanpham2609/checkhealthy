/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import type { ConfessionSort } from '@/lib/confession/feed-sort'
import { cn } from '@/lib/styles'

const SORT_ACCENT = 'lab(57 -51.24 33.59)'

const SORT_OPTIONS: { value: ConfessionSort; label: string; title: string }[] = [
  {
    value: 'newest',
    label: 'Mới nhất',
    title: 'Sắp xếp từ bài mới nhất đến cũ nhất',
  },
  {
    value: 'oldest',
    label: 'Cũ nhất',
    title: 'Sắp xếp từ bài cũ nhất đến mới nhất',
  },
  {
    value: 'likes',
    label: 'Nhiều tim nhất',
    title: 'Sắp xếp theo lượt tim từ cao đến thấp',
  },
]

interface ConfessionFeedControlsProps {
  sort: ConfessionSort
  onSortChange: (sort: ConfessionSort) => void
  searchInput: string
  onSearchInputChange: (value: string) => void
  className?: string
}

export function ConfessionFeedControls({
  sort,
  onSortChange,
  searchInput,
  onSearchInputChange,
  className,
}: ConfessionFeedControlsProps) {
  return (
    <div className={cn('ui-surface space-y-3 px-3 py-3 sm:px-4', className)}>
      <input
        type='search'
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
        placeholder='Tìm theo nội dung hoặc tên hiển thị…'
        autoComplete='off'
        className='ui-input-sm w-full rounded-xl border-slate-200/90 px-3 py-2.5 dark:border-zinc-600'
        aria-label='Tìm kiếm bài viết'
      />

      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
        <p className='text-xs font-medium text-slate-500 dark:text-zinc-400'>Sắp xếp</p>
        <div
          className='flex flex-wrap gap-2'
          role='group'
          aria-label='Cách sắp xếp danh sách bài viết'
        >
          {SORT_OPTIONS.map(({ value, label, title: tip }) => (
            <button
              key={value}
              type='button'
              title={tip}
              onClick={() => onSortChange(value)}
              aria-pressed={sort === value}
              style={
                sort === value
                  ? {
                      backgroundColor: SORT_ACCENT,
                      borderColor: SORT_ACCENT,
                      color: '#fff',
                    }
                  : {
                      borderColor: `color-mix(in lab, ${SORT_ACCENT} 45%, transparent)`,
                      color: SORT_ACCENT,
                    }
              }
              className={cn(
                'rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                sort === value
                  ? 'shadow-sm'
                  : 'bg-white/70 hover:bg-[color-mix(in_lab,lab(57_-51.24_33.59)_12%,transparent)] dark:bg-zinc-900/50 dark:hover:bg-[color-mix(in_lab,lab(57_-51.24_33.59)_18%,transparent)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
