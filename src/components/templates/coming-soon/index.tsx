/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Container } from '@/components/atoms/container'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'

export default function ComingSoonTemplate() {
  return (
    <Container className='relative h-[75dvh] md:h-[80dvh]'>
      <div className='background-ellipse' />
      <Empty className='h-full gap-8'>
        <EmptyHeader className='max-w-4xl'>
          <EmptyMedia className='border-foreground mb-6 rounded-full border px-8 py-2 text-lg font-medium md:text-xl'>
            Coming soon
          </EmptyMedia>
          <EmptyTitle className='text-4xl font-medium md:text-6xl'>
            We're launching soon!
          </EmptyTitle>
          <EmptyDescription className='text-lg font-medium md:text-xl'>
            Something incredible is on the horizon! Drop your email below to be first in line for early access.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className='max-w-4xl'>
          <InputGroup className='h-16 border border-black/5 bg-black/10 dark:border-white/10 dark:bg-white/10'>
            <InputGroupInput className='h-14 text-xl! font-medium!' placeholder='name@email.com' />
            <InputGroupAddon align='inline-end'>
              <InputGroupButton variant='default' size='2xl' className='text-foreground rounded-xl'>
                Sign up
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </EmptyContent>
      </Empty>
    </Container>
  )
}
