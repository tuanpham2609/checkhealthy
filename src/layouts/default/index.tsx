/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { PropsWithChildren, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { isBrowser } from '@/lib/misc'
import MobileSidebar from '@/components/organisms/mobile-sidebar'
import { SidebarInset } from '@/components/ui/sidebar'
import { scrollToHash } from '@/lib/utils/dom/scroll'

export default function DefaultLayout({ children }: Readonly<PropsWithChildren>) {
  const pathname = usePathname()

  /**
   * Scroll to top on mount
   */
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [hash, setHash] = useState<string>('')

  /**
   * Handle scrolling to an element when hash changes (e.g., from browser refresh with hash).
   * Uses scrollToHash utility which handles force scroll and Unicode characters.
   */
  useEffect(() => {
    if (hash) {
      scrollToHash(hash)
    }
  }, [hash])

  /**
   * Handle browser refresh or route change:
   * If there's a hash in the URL, trigger scroll to that section after navigation.
   * Preserves encoded hash as-is (will be decoded in scroll handler).
   * Otherwise, scroll to top when pathname changes.
   */
  useEffect(() => {
    if (isBrowser && window.location.hash) {
      // Preserve the hash as-is (may be encoded), will be decoded when scrolling
      const hash = window.location.hash
      setHash(hash)
    } else {
      // Auto scroll to top when pathname changes (only if no hash)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pathname])

  /**
   * Intercept internal anchor link clicks within the same page.
   * Prevents default jump behavior and replaces it with smooth scroll using scrollToHash.
   */
  useEffect(() => {
    // catch anchor links clicks
    function onClick(e: Event) {
      e.preventDefault()
      const node = e.currentTarget as HTMLAnchorElement
      const hash = node.href.split('#').pop() || ''
      if (hash) {
        scrollToHash(`#${hash}`)
      }
    }

    // Only handle anchor links pointing to the same pathname
    const internalLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]')).filter(
      (node) => new URL(node.href).pathname === pathname && node.hash
    )

    internalLinks.forEach((node) => {
      node.addEventListener('click', onClick, false)
    })

    return () => {
      internalLinks.forEach((node) => {
        node.removeEventListener('click', onClick, false)
      })
    }
  }, [pathname])

  return (
    <div className='mb-auto flex grow flex-col'>
      {/*<Cursor/>*/}
      <MobileSidebar />
      <SidebarInset>
        <div className={'background-hero'} />
        {children}
        <div data-theme='light' className={'background-footer'} />
      </SidebarInset>
    </div>
  )
}
