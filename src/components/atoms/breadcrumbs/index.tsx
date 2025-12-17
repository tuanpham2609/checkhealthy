/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { cn } from '@/lib/styles'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { NavigationLink } from '@/components/atoms/navigation-link'

interface BreadcrumbsProps {
  category?: string
  title: string
  className?: string
}

/**
 * Breadcrumbs component
 * Displays category and title in format: [Category] > [Title]
 */
export function Breadcrumbs({ category, title, className }: BreadcrumbsProps) {
  if (!category && !title) {
    return null
  }

  return (
    <Breadcrumb className={cn('mb-6', className)}>
      <BreadcrumbList>
        {category ? (
          <>
            <BreadcrumbItem>{category}</BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <NavigationLink href='/'>
                  Home
                </NavigationLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem className='text-primary font-medium'>{title}</BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
