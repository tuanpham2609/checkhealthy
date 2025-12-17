/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from 'next/navigation'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Command, CommandEmpty, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command'
import { Globe } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/styles'
import { LOCALES } from '@/constants/direction.constants'
import { useIsMobile } from '@/hooks/use-mobile'
import { Trans } from '@lingui/react/macro'

const languages: Record<LOCALES, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  ar: 'العربية',
  fi: 'Suomi',
  'zh-hans': '简体中文',
  'zh-hant': '繁體中文',
} as const

interface LocaleSwitcherProps {
  classNameLabel?: string
}

export function LocaleSwitcher({ classNameLabel }: LocaleSwitcherProps) {
  const defaultLocale: LOCALES = 'en'

  const pathname = usePathname()
  const isMobile = useIsMobile()
  const router = useRouter()

  const [open, setOpen] = useState<boolean>(false)
  const [locale, setLocale] = useState<LOCALES>((pathname?.split('/')[1] as LOCALES) || defaultLocale)

  function handleChange(value: string) {
    const locale = value as LOCALES
    const pathNameWithoutLocale = pathname?.split('/')?.slice(2) ?? []
    const newPath = `/${locale}/${pathNameWithoutLocale.join('/')}`

    setLocale(locale)
    router.push(`${newPath}${window.location.search}${window.location.hash}`)
  }

  function Content() {
    return (
      <Command value={locale} className='border-primary border-x border-t md:border-none'>
        <CommandList className='max-h-auto'>
          <CommandEmpty>
            <Trans>No language found.</Trans>
          </CommandEmpty>
          {Object.keys(languages).map((lang, idx) => (
            <div key={lang}>
              {idx ? <CommandSeparator /> : null}
              <CommandItem
                value={lang}
                onSelect={handleChange}
                className={cn(
                  'data-[selected=true]:bg-primary/15 cursor-pointer px-5 py-4 transition-colors duration-300',
                  lang === locale && 'text-primary! hover:text-primary!'
                )}
              >
                <p>{languages[lang as keyof typeof languages]}</p>
              </CommandItem>
            </div>
          ))}
        </CommandList>
      </Command>
    )
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button size='sm' variant='alternative' className='items-center justify-center gap-2 rounded-full'>
            <Globe className='size-4' />
            <p className={classNameLabel}>{languages[locale]}</p>
          </Button>
        </DrawerTrigger>
        <DrawerContent className={'p-4'}>
          <DrawerHeader>
            <DrawerTitle />
          </DrawerHeader>
          <Content />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size='sm' variant='alternative' className='items-center justify-center gap-2 rounded-full'>
          <Globe className='size-4' />
          <p className={classNameLabel}>{languages[locale]}</p>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-3xs'>
        <Content />
      </PopoverContent>
    </Popover>
  )
}
