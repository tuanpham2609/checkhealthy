/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { memo, useLayoutEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/styles'
import { SITE_METADATA } from '@/constants/site-metadata.constants'
import { Logo } from '@/components/atoms/logo'
import { useScroll } from '@/hooks/use-scroll'
import { Container } from '@/components/atoms/container'
import { NavigationLink } from '@/components/atoms/navigation-link'
import { NAVIGATION_ITEMS } from '@/constants/navigation.constants'
import { NavSection } from '@/types/navigation.types'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import Image from 'next/image'

export default function Header() {
  const [hasScrolled, setHasScrolled] = useState<boolean>(false)
  const [headerWidth, setHeaderWidth] = useState<number>()
  const headerRef = useRef<HTMLDivElement>(null)

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

  useLayoutEffect(() => {
    if (!headerRef.current) return
    const element = headerRef.current

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width) {
          setHeaderWidth(element.offsetWidth)
        }
      }
    })

    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [])

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

        <div className='hidden flex-1 justify-center lg:flex'>
          <NavigationMenu scrolled={hasScrolled}>
            <NavigationMenuList>
              {NAVIGATION_ITEMS.map((section) => (
                <NavigationSection key={section.id} section={section} contentWidth={headerWidth} />
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className='hidden items-center gap-2 lg:flex lg:gap-10'>
          <NavigationLink href='/#download'>
            <Button variant='neon' size='sm' className='rounded-full text-base! font-normal whitespace-nowrap'>
              Tải xuống
            </Button>
          </NavigationLink>
        </div>

        <SidebarTrigger className='text-primary size-9 lg:hidden [&_svg]:size-7!' />
      </div>
    </Container>
  )
}

interface NavigationSectionProps {
  section: NavSection
  contentWidth?: number
}

const NavigationSection = memo(function NavigationSection({ section, contentWidth }: NavigationSectionProps) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(
          'h-8 rounded-full border border-transparent bg-transparent px-3 text-sm font-medium transition-colors duration-300 ease-in-out',
          'hover:bg-primary hover:text-black',
          'focus:bg-transparent! active:bg-transparent!',
          'data-[state=open]:bg-primary! data-[state=open]:border-primary data-[state=open]:text-black'
        )}
      >
        {section.title}
      </NavigationMenuTrigger>

      <NavigationMenuContent>
        <div
          className='flex flex-col gap-6 p-4 lg:flex-row lg:gap-8 lg:p-6 xl:gap-13'
          style={{
            width: contentWidth ? `${contentWidth - 15}px` : 'auto',
          }}
        >
          {/* Left Highlight */}
          <div className='hidden w-1/3 flex-col justify-end select-none lg:flex xl:w-1/6'>
            <AspectRatio className='h-full w-full' ratio={285 / 324}>
              <Image src={'/assets/images/tbchat.webp'} fill alt={'tbchat'} className={'rounded-md object-cover'} />
            </AspectRatio>
          </div>

          {/* Links */}
          <ul className='grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3 xl:grid-rows-3 xl:gap-x-13'>
            {section.items.map((item) => (
              <ListItem key={item.id} id={item.id} href={item.href} title={item.title} className='h-full'>
                {item.description}
              </ListItem>
            ))}
          </ul>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
})

interface ListItemProps extends Omit<React.ComponentPropsWithoutRef<'li'>, 'title'> {
  id: string
  href: string
  title: string
}

const ListItem = memo(function ListItem({ title, id, children, href, ...props }: ListItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <NavigationLink
          href={href}
          className={cn(
            'flex h-full max-h-[90px] rounded-md p-3 transition-colors',
            isActive
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-foreground/80 hover:text-foreground hover:bg-primary/10'
          )}
        >
          <div className='mb-auto text-sm leading-none font-medium'>{title}</div>
          <p className='text-muted-foreground line-clamp-2 text-sm leading-snug'>{children}</p>
        </NavigationLink>
      </NavigationMenuLink>
    </li>
  )
})
