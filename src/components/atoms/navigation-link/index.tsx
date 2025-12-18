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

  // Check if this is a hash link (starts with #)
  const isHashLink = href.startsWith('#')

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call original onClick if provided
    onClick?.(e)

    // If it's a hash link, use scrollToHash and prevent default
    if (isHashLink) {
      e.preventDefault()
      scrollToHash(href)
    }
  }

  if (isExternal) {
    return (
      <a href={href} target='_blank' rel='noopener noreferrer' className={cn('no-underline', className)} {...rest}>
        {children}
      </a>
    )
  }

  // If it's a hash link, use anchor tag with onClick (no locale prefix)
  if (isHashLink) {
    return (
      <a href={href} className={cn('no-underline', className)} onClick={handleClick} {...rest}>
        {children}
      </a>
    )
  }

  // For regular internal links, add locale prefix
  const locale = (pathname?.split('/')[1] as LOCALES) || defaultLocale
  const newPath = `/${locale}${href}`

  return (
    <Link href={newPath} className={cn('no-underline', className)} onClick={onClick} {...rest}>
      {children}
    </Link>
  )
}
