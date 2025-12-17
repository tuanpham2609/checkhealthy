/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { cn } from '@/lib/styles'
import { ElementType, ReactNode, ComponentPropsWithRef } from 'react'

type ContainerProps<T extends ElementType> = {
  as?: T
  className?: string
  children: ReactNode
} & Omit<ComponentPropsWithRef<T>, 'as' | 'className' | 'children'>

export function Container<T extends ElementType = 'section'>({ as, className, children, ...props }: ContainerProps<T>) {
  const Component = as || 'section'
  return (
    /* @ts-ignore */
    <Component className={cn('container mx-auto w-full px-4 sm:px-6 xl:px-12', className)} {...props}>
      {children}
    </Component>
  )
}
