/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PLATFORMS } from '@/constants/landing.constants'
import { cn } from '@/lib/styles'
import dynamic from 'next/dynamic'

const AnimatedContent = dynamic(
  () => import('@/components/atoms/animated-content').then((AnimatedContent) => AnimatedContent),
  { ssr: false }
)

export default function PlatformTabs() {
  return (
    <Tabs defaultValue={PLATFORMS[0].id} className='flex w-full flex-col items-center'>
      <AnimatedContent duration={3}>
        <TabsList className='flex flex-wrap justify-center gap-4 bg-transparent p-0 sm:gap-5 md:gap-6'>
          {PLATFORMS.map(({ id, title }) => (
            <PlatformTabTrigger key={id} value={id} label={title} />
          ))}
        </TabsList>
      </AnimatedContent>

      {PLATFORMS.map(({ id, images: { desktop, mobile } }) => (
        <TabsContent key={id} value={id} className='mt-11 md:mt-0'>
          {desktop ? (
            <AnimatedContent duration={3} className='flex items-center justify-center pt-5 lg:pt-11'>
              <picture>
                <source srcSet={mobile} media='(max-width: 767px)' />
                <Image src={desktop} alt={id} width={940} height={548} className='object-contain' />
              </picture>
            </AnimatedContent>
          ) : (
            <ComingSoon />
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}

/* --- Sub Components --- */
function PlatformTabTrigger({ value, label }: { value: string; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        'border-foreground! text-foreground! cursor-pointer rounded-full border border-solid px-6 py-2 text-center transition-colors duration-300 ease-in-out',
        'hover:border-primary/70! hover:text-primary! hover:data-[state=active]:text-foreground!',
        'data-[state=active]:border-primary! data-[state=active]:bg-primary! dark:data-[state=active]:text-black!'
      )}
    >
      {label}
    </TabsTrigger>
  )
}

function ComingSoon() {
  return (
    <AnimatedContent duration={3} className='flex h-[548px] w-full items-center justify-center rounded-xl md:w-[940px]'>
      <p className='text-6xl font-semibold tracking-wide md:text-8xl'>
        Coming soon
      </p>
    </AnimatedContent>
  )
}
