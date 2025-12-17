/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { DIRECTION_MAP, LOCALES } from '@/constants/direction.constants'

export function getDirection(locale: LOCALES): 'ltr' | 'rtl' {
  return DIRECTION_MAP[locale] ?? 'ltr'
}

export function applyDocumentDirection(locale: LOCALES) {
  const dir = getDirection(locale)
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', dir)
  }
}
