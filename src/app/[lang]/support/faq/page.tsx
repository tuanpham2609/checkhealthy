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
import { Breadcrumbs } from '@/components/atoms/breadcrumbs'
import { FAQAccordion } from '@/components/molecules/faq-accordion'
import { FAQTitle } from '@/components/molecules/faq-title'
import { FAQ_CATEGORIES } from '@/constants/faq.constants'
import { initLingui, PageLangParam } from '@/i18n/initLingui'
import { genPageMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: PageLangParam): Promise<Metadata> {
  const lang = (await params).lang
  return genPageMetadata({
    title: 'Frequently Asked Questions - TBC Wallet',
    description:
      'Find answers to frequently asked questions about TBC Wallet, including security, features, transactions, and troubleshooting.',
    lang,
    path: 'support/faq',
  })
}

/**
 * FAQ Page
 * Displays frequently asked questions in accordion format
 */
export default async function FAQPage(props: PageLangParam) {
  const lang = (await props.params).lang
  initLingui(lang)

  return (
    <Container className='mx-auto max-w-[768px] py-8 lg:py-12 xl:py-16'>
      <article className='prose prose-lg dark:prose-invert lg:prose-xl max-w-none'>
        <FAQTitle />

        <Breadcrumbs title='FAQ' />

        <div className='text-foreground/90 mt-8'>
          <FAQAccordion categories={FAQ_CATEGORIES} />
        </div>
      </article>
    </Container>
  )
}
