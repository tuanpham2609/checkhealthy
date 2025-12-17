/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/styles'
import { Chain } from '@/types/landing.types'
import type { MessageDescriptor } from '@lingui/core'
const chainCardVariants = cva('rounded-[52px] flex flex-col gap-5 justify-center items-center text-white', {
  variants: {
    chain: {
      TBC: 'card-chain-green',
      BTC: 'card-chain-orange',
      ETH: 'card-chain-olive',
      TRX: 'card-chain-red',
      SOL: 'card-chain-blue-purple',
      WATERCOLOR: 'card-chain-green',
      OIL: 'card-chain-orange',
      ACRYLIC: 'card-chain-red',
      PENCIL: 'card-chain-olive',
    },
    size: {
      default: 'h-[200px] md:h-[380px] w-full',
    },
  },
  defaultVariants: {
    chain: 'TBC',
    size: 'default',
  },
})

interface ChainCardProps {
  chain: Chain
  className?: string
  iconClassName?: string
  size?: VariantProps<typeof chainCardVariants>['size']
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

export function ChainCard({ size = 'default', chain, className, iconClassName }: ChainCardProps) {
  const titleString = getMessageString(chain.title)

  const Logo = () => {
    if (!chain?.logo) {
      return (
        <span className='hidden'>
          Missing brand icon for {titleString}
        </span>
      )
    }
    return <chain.logo className={cn('size-12 md:size-19', iconClassName)} fill='currentColor' />
  }

  // Map chain.id to valid variant value
  const chainVariant = chain.id as VariantProps<typeof chainCardVariants>['chain']

  return (
    // <NavigationLink href={chain?.url || '' + '?ref=TBChat'}>
    <div data-slot='chain-card' className={cn(chainCardVariants({ chain: chainVariant, size }), className)}>
      <Logo />
      <p className='text-center text-2xl font-black md:text-5xl'>{titleString}</p>
    </div>
    // </NavigationLink>
  )
}
