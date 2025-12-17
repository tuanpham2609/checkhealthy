/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import Link from 'next/link'
import { cn } from '@/lib/styles'
import { usePathname } from 'next/navigation'
import { LOCALES } from '@/constants/direction.constants'
import { scrollToHash } from '@/lib/utils/dom/scroll'
import { useStore } from '@/lib/store'

const EXTERNAL_LINK_REGEX = /^(https?:)?\/\//i
const defaultLocale = 'en'

interface NavigationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  className?: string
  children: React.ReactNode
}

// TODO: Lingui does not automatically hydrate the locale into the href.
// Currently, we're manually adding the locale as a temporary workaround.
// Need to investigate why Lingui isn't handling this automatically.

export function NavigationLink({ children, className, href, onClick, ...rest }: NavigationLinkProps) {
  const pathname = usePathname()
  const isExternal = EXTERNAL_LINK_REGEX.test(href)
  const lenis = useStore((state) => state.lenis)

  const locale = (pathname?.split('/')[1] as LOCALES) || defaultLocale
  const newPath = `/${locale}${href}`

  // Check if this is a hash link (starts with # or contains #)
  const isHashLink = href.startsWith('#') || href.includes('#')

  // Extract hash from href
  const hashMatch = href.match(/#(.+)$/)
  const hash = hashMatch ? `#${hashMatch[1]}` : null

  // Check if we're on the same pathname (hash link on current page)
  const isSamePageHash = isHashLink && hash && pathname === newPath.split('#')[0]

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call original onClick if provided
    onClick?.(e)

    // If it's a hash link on the same page, use scrollToHash
    if (isSamePageHash && hash) {
      e.preventDefault()
      scrollToHash(hash, lenis)
    }
  }

  if (isExternal) {
    return (
      <a href={href} target='_blank' rel='noopener noreferrer' className={cn('no-underline', className)} {...rest}>
        {children}
      </a>
    )
  }

  // If it's a hash link on the same page, use anchor tag with onClick
  if (isSamePageHash) {
    return (
      <a href={hash || href} className={cn('no-underline', className)} onClick={handleClick} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <Link href={newPath} className={cn('no-underline', className)} onClick={handleClick} {...rest}>
      {children}
    </Link>
  )
}
