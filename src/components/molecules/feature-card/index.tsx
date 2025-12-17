/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import type { Feature } from '@/types/landing.types'
import { cn } from '@/lib/styles'
import type { MessageDescriptor } from '@lingui/core'

interface FeatureCardProps {
  readonly feature: Feature
  readonly className?: string
}

/**
 * Extract string from MessageDescriptor
 * MessageDescriptor has id property that contains the message
 */
function getMessageString(message: MessageDescriptor): string {
  if (typeof message === 'string') {
    return message
  }
  // MessageDescriptor has id property
  if (message && typeof message === 'object' && 'id' in message) {
    return String(message.id)
  }
  return String(message)
}

export function FeatureCard({ feature, className }: FeatureCardProps) {
  const titleString = getMessageString(feature.title)
  const descriptionString = getMessageString(feature.description)
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 lg:h-screen lg:w-2xl lg:grid-cols-12 lg:opacity-0 xl:w-3xl 2xl:w-4xl',
        'first:lg:ml-16 last:lg:mr-16 first:xl:ml-24 last:xl:mr-24 first:2xl:ml-38 last:2xl:mr-38',
        className
      )}
    >
      <div className='col-span-5 flex items-center justify-center lg:col-start-8'>
        <div className='relative flex flex-col items-center justify-center gap-7 lg:items-start lg:pt-38 xl:pt-28 2xl:pt-10'>
          <h2 data-title className='font-clash-display text-center text-4xl font-semibold lg:hidden'>
            Features
          </h2>
          <div
            data-icon
            className={cn('flex size-30 flex-col items-center justify-center gap-5 rounded-3xl', feature.color)}
          >
            <feature.icon className='size-20' fill='currentColor' />
          </div>
          <p data-subtitle className='text-3xl font-semibold'>
            {titleString}
          </p>
          <p data-desc className='max-w-md text-center lg:text-start'>
            {descriptionString}
          </p>
        </div>
      </div>
    </div>
  )
}
