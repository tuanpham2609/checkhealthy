/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import dynamic from 'next/dynamic'

const AuroraText = dynamic(() => import('@/components/atoms/aurora-text').then(({ AuroraText }) => AuroraText), {
  ssr: false,
})

export function FAQTitle() {
  return (
    <h1 className='font-clash-display mb-8 flex flex-col text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-6xl lg:leading-20'>
      <AuroraText speed={0}>
        Frequently Asked Questions
      </AuroraText>
    </h1>
  )
}
