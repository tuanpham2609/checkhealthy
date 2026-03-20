/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { cn } from '@/lib/styles'

const PALETTES = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-rose-500',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-indigo-600',
]

function colorForName(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % PALETTES.length
  return PALETTES[h]!
}

function isDefaultDisplayName(name: string): boolean {
  const t = name.trim()
  if (!t) return true
  return t.toLocaleLowerCase('vi') === 'ẩn danh'
}

interface AvatarCircleProps {
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AvatarCircle({ name, className, size = 'md' }: AvatarCircleProps) {
  const letter = isDefaultDisplayName(name) ? 'A' : (name.trim().charAt(0) || 'A').toLocaleUpperCase('vi')
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-11 w-11 text-base',
  }
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        colorForName(name),
        sizes[size],
        className
      )}
      aria-hidden
    >
      {letter}
    </div>
  )
}
