/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { getI18nInstance } from './i18n'
import { setI18n } from '@lingui/react/server'

export type PageLangParam = {
  params: Promise<{ lang: string }>
}

export function initLingui(lang: string) {
  const i18n = getI18nInstance(lang)
  setI18n(i18n)
  return i18n
}
