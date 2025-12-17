/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useState, useCallback, memo } from 'react'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/molecules/theme-switcher'
import { LocaleSwitcher } from '@/components/molecules/locale-switcher'
import { NavigationLink } from '@/components/atoms/navigation-link'
import { Logo } from '@/components/atoms/logo'
import { cn } from '@/lib/styles'
import { NAVIGATION_ITEMS } from '@/constants/navigation.constants'
import { NavItem } from '@/types/navigation.types'
import type { MessageDescriptor } from '@lingui/core'
import { usePathname } from 'next/navigation'
import { LOCALES } from '@/constants/direction.constants'

export default function MobileSidebar() {
  const { toggleSidebar } = useSidebar()
  const [openId, setOpenId] = useState<string | null>(null)
  const handleToggle = useCallback((id: string, isOpen: boolean) => {
    setOpenId(isOpen ? id : null)
  }, [])

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className='mb-11'>
        <div className='mt-2 flex items-center justify-between'>
          <Logo showText />
          <SidebarTrigger className='text-primary size-9 [&_svg]:size-7!' />
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent data-lenis-prevent>
        {NAVIGATION_ITEMS.map((section) => (
          <NavSection
            key={section.id}
            id={section.id}
            title={section.title}
            items={section.items}
            open={openId === section.id}
            onToggle={handleToggle}
            toggleSidebar={toggleSidebar}
          />
        ))}
      </SidebarContent>
      <SidebarRail />

      {/* Footer */}
      <SidebarFooter>
        <div className='flex w-full flex-col items-end gap-6 px-8 pt-4 pb-8'>
          <div className='grid w-full grid-cols-2'>
            <div className='col-start-2 flex w-full justify-between'>
              <ThemeSwitcher className='relative right-4.5' />
              <LocaleSwitcher />
            </div>
          </div>
          <NavigationLink href='/#download' className={'w-full'}>
            <Button
              variant='neon'
              className='h-11! w-full rounded-full text-xl font-normal whitespace-nowrap'
              onClick={toggleSidebar}
            >
              <Trans>Download</Trans>
            </Button>
          </NavigationLink>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

interface NavSectionProps {
  id: string
  title: MessageDescriptor
  toggleSidebar: () => void
  items: readonly NavItem[]
  open: boolean
  onToggle: (id: string, isOpen: boolean) => void
}

const NavSection = memo(({ id, title, items, open, onToggle, toggleSidebar }: NavSectionProps) => {
  const { i18n } = useLingui()
  const pathname = usePathname()
  const locale = (pathname?.split('/')[1] as LOCALES) || 'en'
  const handleToggle = useCallback((state: boolean) => onToggle(id, state), [id, onToggle])

  return (
    <Collapsible open={open} onOpenChange={handleToggle} className='group/collapsible px-10'>
      <SidebarGroup className='border-sidebar-border border-b px-0'>
        <SidebarGroupLabel asChild className='group/label'>
          <CollapsibleTrigger
            className={cn(
              'w-full px-0! pb-2 text-2xl! font-semibold transition-colors',
              'text-foreground! hover:text-foreground group-data-[state=open]/collapsible:text-primary!'
            )}
          >
            {i18n._(title)}
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ id, title, href }) => {
                const customHref = id === 'swap' ? href + locale : href
                return (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton asChild onClick={toggleSidebar}>
                      <NavigationLink
                        href={customHref}
                        className={cn(
                          'flex items-center rounded-md py-2 text-xl font-medium transition-colors',
                          'hover:bg-muted/40 text-primary dark:text-[#BEEDC8]'
                        )}
                      >
                        {i18n._(title)}
                      </NavigationLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
})

NavSection.displayName = 'NavSection'
