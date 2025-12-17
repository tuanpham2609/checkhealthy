/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { useLingui } from '@lingui/react'
import { cn } from '@/lib/styles'
import { formatFAQAnswer } from './faq-accordion.helper'
import type { FAQCategory } from '@/constants/faq.constants'

interface FAQAccordionProps {
  categories: readonly FAQCategory[]
  className?: string
}

/**
 * FAQ Accordion Component
 * Displays FAQ items grouped by categories using accordion UI
 */
export function FAQAccordion({ categories, className }: FAQAccordionProps) {
  const { i18n } = useLingui()

  return (
    <div className={cn('space-y-8', className)}>
      {categories.map((category, categoryIndex) => (
        <div key={category.id} className='space-y-4'>
          <div>
            <h2 className='font-clash-display text-2xl font-bold lg:text-3xl'>{i18n._(category.title)}</h2>
            {categoryIndex < categories.length - 1 && <Separator className='mt-4' />}
          </div>

          <Accordion type='single' collapsible className='w-full'>
            {category.items.map((item) => (
              <AccordionItem key={item.id} value={item.id} className='border-b'>
                <AccordionTrigger className='text-left text-base font-semibold hover:no-underline'>
                  {i18n._(item.question)}
                </AccordionTrigger>
                <AccordionContent className='text-foreground/80 text-sm leading-relaxed'>
                  <div className='whitespace-pre-line'>{formatFAQAnswer(i18n._(item.answer))}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  )
}
