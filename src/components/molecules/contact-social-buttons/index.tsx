/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import type { ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { NavigationLink } from '@/components/atoms/navigation-link'
import { SOCIAL_LINKS } from '@/constants/navigation.constants'
import { cn } from '@/lib/styles'

interface ContactSocialButtonsProps {
  className?: string
}

/**
 * Contact Social Buttons Component
 * Displays social media buttons for contact page
 */
export function ContactSocialButtons({ className }: ContactSocialButtonsProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-4', className)}>
      {SOCIAL_LINKS.map((social) => {
        const IconComponent = social.icon as ComponentType<{ className?: string; fill?: string }>
        return (
          <NavigationLink key={social.id} href={social.href} target='_blank' rel='noopener noreferrer'>
            <Button
              variant='outline'
              size='lg'
              className='hover:bg-primary hover:text-primary-foreground group flex h-auto items-center gap-3 px-6 py-4 transition-colors'
            >
              {social.id === 'tiktok' ? (
                <IconComponent className='size-5 text-current' fill='currentColor' />
              ) : (
                <IconComponent className='size-5 text-current' />
              )}
              <span className='font-medium capitalize'>{social.id}</span>
            </Button>
          </NavigationLink>
        )
      })}
    </div>
  )
}
