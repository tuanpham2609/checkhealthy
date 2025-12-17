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
import { NavigationLink } from '@/components/atoms/navigation-link'
import { Logo } from '@/components/atoms/logo'
import { cn } from '@/lib/styles'
import { NAVIGATION_ITEMS } from '@/constants/navigation.constants'
import { NavItem } from '@/types/navigation.types'

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
          <NavigationLink href='/#download' className={'w-full'}>
            <Button
              variant='neon'
              className='h-11! w-full rounded-full text-xl font-normal whitespace-nowrap'
              onClick={toggleSidebar}
            >
              Tải xuống
            </Button>
          </NavigationLink>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

interface NavSectionProps {
  id: string
  title: string
  toggleSidebar: () => void
  items: readonly NavItem[]
  open: boolean
  onToggle: (id: string, isOpen: boolean) => void
}

const NavSection = memo(({ id, title, items, open, onToggle, toggleSidebar }: NavSectionProps) => {
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
            {title}
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ id, title, href }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton asChild onClick={toggleSidebar}>
                    <NavigationLink
                      href={href}
                      className={cn(
                        'flex items-center rounded-md py-2 text-xl font-medium transition-colors',
                        'hover:bg-muted/40 text-primary'
                      )}
                    >
                      {title}
                    </NavigationLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
})

NavSection.displayName = 'NavSection'
