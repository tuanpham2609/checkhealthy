/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/styles'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  if (!mounted) {
    return <div className={cn('size-10 shrink-0 rounded-2xl border border-transparent', className)} aria-hidden />
  }

  return (
    <button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn('ui-theme-toggle', className)}
      aria-label={isDark ? 'Chuyển chế độ sáng' : 'Chuyển chế độ tối'}
    >
      <span className='relative h-[1.125rem] w-[1.125rem] overflow-hidden' aria-hidden>
        <span
          className={cn(
            'flex h-[1.125rem] w-[200%] transition-transform duration-[650ms] ease-[cubic-bezier(0.25,0.85,0.35,1)] motion-reduce:duration-150 motion-reduce:ease-linear',
            isDark ? '-translate-x-1/2' : 'translate-x-0'
          )}
        >
          <span className='flex h-[1.125rem] w-1/2 shrink-0 items-center justify-center'>
            <Sun className='size-[1.125rem]' strokeWidth={2} />
          </span>
          <span className='flex h-[1.125rem] w-1/2 shrink-0 items-center justify-center'>
            <Moon className='size-[1.125rem]' strokeWidth={2} />
          </span>
        </span>
      </span>
    </button>
  )
}
