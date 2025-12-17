/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

export type LOCALES = 'en' | 'es' | 'pt' | 'fr' | 'ar' | 'fi' | 'zh-hans' | 'zh-hant'

export const DIRECTION_MAP: Record<LOCALES, 'ltr' | 'rtl'> = {
  ar: 'ltr',
  en: 'ltr',
  es: 'ltr',
  pt: 'ltr',
  fr: 'ltr',
  fi: 'ltr',
  'zh-hans': 'ltr',
  'zh-hant': 'ltr',
}
