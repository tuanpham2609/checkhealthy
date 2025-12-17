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
import { Empty, EmptyContent, EmptyHeader } from '@/components/ui/empty'
import { ContactSocialButtons } from '@/components/molecules/contact-social-buttons'
import { ContactTitle } from '@/components/molecules/contact-title'
import { PageLangParam } from '@/app/[lang]/layout'
import { genPageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageLangParam): Promise<Metadata> {
  const lang = (await params).lang
  return genPageMetadata({
    title: 'Contact Us - Get Support from TBC Wallet',
    description:
      'Get in touch with TBC Wallet support team. Find contact information, support hours, and ways to reach us for assistance.',
    lang,
    path: 'support/contact-us',
  })
}

/**
 * Contact Us Page
 * Displays contact information with social media buttons
 */
export default async function ContactUsPage(props: PageLangParam) {
  return (
    <Container className='relative flex h-[75dvh] items-center justify-center md:h-[80dvh]'>
      <div className='background-ellipse' />
      <Empty className='h-full gap-8'>
        <EmptyHeader className='max-w-4xl'>
          <ContactTitle />
        </EmptyHeader>
        <EmptyContent className='max-w-4xl'>
          <ContactSocialButtons />
        </EmptyContent>
      </Empty>
    </Container>
  )
}
