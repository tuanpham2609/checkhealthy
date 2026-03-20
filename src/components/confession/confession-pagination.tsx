/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/styles'

function pageItems(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const set = new Set<number>()
  set.add(1)
  set.add(total)
  for (let d = -1; d <= 1; d++) {
    const p = current + d
    if (p >= 1 && p <= total) set.add(p)
  }
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) {
      out.push('gap')
    }
    out.push(sorted[i]!)
  }
  return out
}

interface ConfessionPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function ConfessionPagination({ page, totalPages, onPageChange, className }: ConfessionPaginationProps) {
  if (totalPages <= 1) return null

  const items = pageItems(page, totalPages)

  return (
    <nav
      className={cn('flex flex-wrap items-center justify-center gap-1 pt-6', className)}
      aria-label='Phân trang bài viết'
    >
      <button
        type='button'
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className='ui-pagination-nav'
        aria-label='Trang trước'
      >
        <ChevronLeft className='size-4' aria-hidden />
      </button>

      {items.map((item, i) =>
        item === 'gap' ? (
          <span key={`g-${i}`} className='px-1.5 text-sm text-slate-400 dark:text-zinc-500' aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type='button'
            onClick={() => onPageChange(item)}
            aria-label={`Trang ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'min-w-10 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ease-out',
              item === page
                ? 'bg-[var(--pagination-fill)] text-white shadow-md ring-1 ring-[color-mix(in_lab,var(--pagination-fill)_35%,transparent)] dark:bg-[var(--pagination-accent)] dark:text-zinc-950 dark:ring-[color-mix(in_lab,var(--pagination-accent)_40%,transparent)]'
                : 'border border-transparent text-slate-600 hover:border-slate-200/90 hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-900/5 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:ring-white/10'
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type='button'
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className='ui-pagination-nav'
        aria-label='Trang sau'
      >
        <ChevronRight className='size-4' aria-hidden />
      </button>
    </nav>
  )
}
