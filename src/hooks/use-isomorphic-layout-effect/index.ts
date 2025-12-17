/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useEffect, useLayoutEffect } from 'react'
import { isBrowser } from '@/lib/misc'

export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect
