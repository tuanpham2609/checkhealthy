/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/styles'

type ClientNavLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string
}

/**
 * Thẻ `<a>` + `router.push` một lần khi click chuột thường (giữ Ctrl/Cmd/middle-click mở tab mới).
 * Giúp tránh một số trường hợp phải bấm 2 lần với `next/link` + hydration/focus.
 */
export function ClientNavLink({ href, className, onClick, children, ...rest }: ClientNavLinkProps) {
  const router = useRouter()

  return (
    <a
      href={href}
      className={cn('cursor-pointer touch-manipulation', className)}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        if (e.button !== 0) return
        e.preventDefault()
        router.push(href)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
