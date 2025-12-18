/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { NavigationLink } from '@/components/atoms/navigation-link'
import { Logo } from '@/components/atoms/logo'
import { cn } from '@/lib/styles'
import { HOME_SECTIONS } from '@/constants/navigation.constants'
import { useActiveSection } from '@/hooks/use-active-section'

export default function MobileSidebar() {
  const { toggleSidebar } = useSidebar()
  const sectionIds = HOME_SECTIONS.map((section) => section.id)
  const activeSectionId = useActiveSection(sectionIds)

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
      <SidebarContent>
        <SidebarMenu className='px-4'>
          {HOME_SECTIONS.map((section) => (
            <SidebarMenuItem key={section.id}>
              <SidebarMenuButton asChild onClick={toggleSidebar}>
                <NavigationLink
                  href={section.href}
                  className={cn(
                    'flex items-center rounded-md py-3 text-lg font-medium transition-colors',
                    activeSectionId === section.id
                      ? 'bg-primary text-white font-semibold'
                      : 'text-foreground hover:bg-primary/10'
                  )}
                >
                  {section.label}
                </NavigationLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />

      {/* Footer */}
      <SidebarFooter>
        <div className='flex w-full flex-col items-end gap-6 px-8 pt-4 pb-8'>
          <a
            href='https://mythuatcmc.vn/'
            target='_blank'
            rel='noopener noreferrer'
            className='w-full no-underline'
            onClick={toggleSidebar}
          >
            <Button
              variant='neon'
              className='h-10! w-full rounded-full px-4 py-2 text-sm font-normal whitespace-nowrap'
            >
              Liên Hệ
            </Button>
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

