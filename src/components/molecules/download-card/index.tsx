/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { Download } from '@/types/landing.types'
import { NavigationLink } from '@/components/atoms/navigation-link'
import Image from 'next/image'
import { cn } from '@/lib/styles'
import { useLingui } from '@lingui/react'

interface DownloadCardProps {
  data: Download
}

export function DownloadCard({ data }: DownloadCardProps) {
  const { i18n } = useLingui()
  const classNameLogo: Record<string, string> = {
    'app-store': 'size-12 sm:size-16',
    'mac-os': 'size-12 sm:size-16',
    windows: 'size-12 sm:size-16',
    android: 'h-11 sm:h-15',
  }
  return (
    <NavigationLink href={data.url} className='w-full'>
      <div
        className={cn(
          'relative flex h-full min-h-[210px] w-full max-w-[400px] items-center justify-center overflow-hidden rounded-3xl p-4',
          'hover:border-primary border border-solid border-[rgba(255,_255,_255,_0.5)]',
          'bg-[linear-gradient(294.04deg,_#003100_-39.23%,_#002500_-2.81%,_#000B00_82.39%,_#003E00_144.17%)] transition-all duration-300',
          // before element chỉ xuất hiện khi hover
          "before:absolute before:-bottom-30 before:h-[175px] before:w-[305px] before:content-['']",
          'before:bg-[radial-gradient(ellipse_at_center,_rgba(13,204,97,0.5)_0%,_rgba(13,204,97,0.2)_40%,_rgba(13,204,97,0)_60%)]',
          'before:pointer-events-none before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100'
        )}
      >
        <div className={'flex h-full flex-col items-center justify-center gap-x-3 gap-y-1.5 lg:flex-row'}>
          {data.images ? (
            <picture>
              <source srcSet={data.images.mobile} media='(max-width: 767px)' />
              {data.images.desktop && (
                <Image
                  src={data.images.desktop}
                  alt={data.id}
                  width={80}
                  height={80}
                  className={cn('object-contain', classNameLogo[data.id])}
                />
              )}
            </picture>
          ) : data.logo ? (
            <data.logo className={cn(classNameLogo[data.id])} fill='currentColor' />
          ) : null}

          <div className='flex flex-col gap-1.5'>
            <p className='mb-auto text-white'>{i18n._(data.subtitle)}</p>
            <h5 className='mt-auto text-2xl font-semibold text-white sm:text-3xl'>{i18n._(data.title)}</h5>
          </div>
        </div>
      </div>
    </NavigationLink>
  )
}
