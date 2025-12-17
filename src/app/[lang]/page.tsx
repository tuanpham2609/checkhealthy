/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { Metadata } from 'next'
import HomeTemplate from '@/components/templates/home'
import { PageLangParam } from '@/app/[lang]/layout'
import { genPageMetadata } from '@/lib/seo'
import { SITE_METADATA } from '@/constants/site-metadata.constants'

export async function generateMetadata({ params }: PageLangParam): Promise<Metadata> {
  const lang = (await params).lang
  return genPageMetadata({
    title: SITE_METADATA.titleHeader,
    description: SITE_METADATA.description,
    lang,
    path: '',
  })
}

export default async function HomePage(props: PageLangParam) {
  return (
    <div>
      <HomeTemplate />
    </div>
  )
}
