/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/styles'
import { SITE_METADATA } from '@/constants/site-metadata.constants'
import { Logo } from '@/components/atoms/logo'
import { useScroll } from '@/hooks/use-scroll'
import { Container } from '@/components/atoms/container'
import { NavigationLink } from '@/components/atoms/navigation-link'
import { HOME_SECTIONS } from '@/constants/navigation.constants'
import { useActiveSection } from '@/hooks/use-active-section'

export default function Header() {
  const [hasScrolled, setHasScrolled] = useState<boolean>(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const sectionIds = HOME_SECTIONS.map((section) => section.id)
  const activeSectionId = useActiveSection(sectionIds)

  useScroll(({ scroll }) => {
    // Fix header ngay khi scroll xuống 20px, không cần đợi
    const newState = scroll > 20
    setHasScrolled((prev) => {
      if (prev !== newState) {
        return newState
      }
      return prev
    })
  })

  return (
    <Container
      ref={headerRef}
      as='header'
      className={cn(
        'will-change-auto',
        'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'rounded-xl border-[0.5px] px-4',
        hasScrolled ? 'py-1' : 'py-2',
        hasScrolled
          ? 'border-white/10 bg-white/80 shadow-md backdrop-blur-md'
          : 'border-transparent bg-transparent shadow-none',
        SITE_METADATA.stickyNav ? 'sticky top-2 z-50 lg:top-3' : 'mt-2 lg:mt-3'
      )}
    >
      <div className={cn(
        'flex items-center justify-between',
        'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        hasScrolled ? 'gap-2' : 'gap-3'
      )}>
        <Logo 
          showText={true} 
          classNameLabel={cn(
            'sm:hidden lg:inline-block',
            'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            hasScrolled ? 'lg:text-xs xl:text-sm' : 'lg:text-sm xl:text-md'
          )} 
          customSize={hasScrolled ? 70 : 90} 
        />

        <nav className='hidden flex-1 items-center justify-center gap-2 lg:flex lg:gap-3'>
          {HOME_SECTIONS.map((section) => (
            <NavigationLink
              key={section.id}
              href={section.href}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ease-in-out',
                'hover:bg-primary hover:text-black',
                activeSectionId === section.id
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-transparent text-foreground/80'
              )}
            >
              {section.label}
            </NavigationLink>
          ))}
        </nav>

        <div className='hidden items-center gap-2 lg:flex lg:gap-10'>
          <a
            href='https://mythuatcmc.vn/'
            target='_blank'
            rel='noopener noreferrer'
            className='no-underline'
          >
            <Button
              variant='neon'
              size='sm'
              className='rounded-full px-4 py-1.5 text-sm font-normal whitespace-nowrap'
            >
              Liên Hệ
            </Button>
          </a>
        </div>

        <SidebarTrigger className='text-primary size-9 lg:hidden [&_svg]:size-7!' />
      </div>
    </Container>
  )
}

