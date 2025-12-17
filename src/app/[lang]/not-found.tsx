/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { Metadata } from 'next'
import { Container } from '@/components/atoms/container'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { genPageMetadata } from '@/lib/seo'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

export const metadata: Metadata = genPageMetadata({
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist. ' + SITE_METADATA.description,
  lang: 'en',
  path: '',
})

export default function NotFound() {
  return (
    <Container className='relative flex h-[75dvh] items-center justify-center md:h-[80dvh]'>
      <div className='background-ellipse' />
      <Empty className='h-full gap-8'>
        <EmptyHeader className='max-w-4xl'>
          <EmptyTitle className='text-4xl font-medium md:text-6xl'>
            Page Not Found
          </EmptyTitle>
          <EmptyDescription className='text-lg font-medium md:text-xl'>
            The page you are looking for does not exist or has been moved.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Container>
  )
}
