/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import 'server-only'

import linguiConfig from '../../lingui.config'
import { I18n, Messages, setupI18n } from '@lingui/core'

const { locales } = linguiConfig
// optionally use a stricter union type
type SupportedLocales = string

async function loadCatalog(locale: SupportedLocales): Promise<{
  [k: string]: Messages
}> {
  const { messages } = await import(`./locales/${locale}/messages.po`)
  return {
    [locale]: messages,
  }
}
const catalogs = await Promise.all(locales.map(loadCatalog))

// transform array of catalogs into a single object
export const allMessages = catalogs.reduce((acc: any, oneCatalog: any) => {
  return { ...acc, ...oneCatalog }
}, {})

type AllI18nInstances = { [K in SupportedLocales]: I18n }

export const allI18nInstances: AllI18nInstances = locales.reduce((acc: any, locale: any) => {
  const messages = allMessages[locale] ?? {}
  const i18n = setupI18n({
    locale,
    messages: { [locale]: messages },
  })
  return { ...acc, [locale]: i18n }
}, {})

export const getI18nInstance = (locale: SupportedLocales): I18n => {
  if (!allI18nInstances[locale]) {
    console.warn(`No i18n instance found for locale "${locale}"`, '\n')
  }
  return allI18nInstances[locale]! || allI18nInstances['en']!
}
