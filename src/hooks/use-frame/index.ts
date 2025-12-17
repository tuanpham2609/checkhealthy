/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { useEffect, useRef } from 'react'
import Tempus, { TempusCallback } from '@/lib/tempus'

export function useFrame(callback: TempusCallback, priority = 0): void {
  const cbRef = useRef<TempusCallback>(callback)
  cbRef.current = callback

  useEffect(() => {
    if (!Tempus) return

    const wrapped = (time: number, delta: number): void => {
      cbRef.current?.(time, delta)
    }

    const unsubscribe = Tempus.add(wrapped, priority)

    return () => {
      Tempus?.remove(wrapped)
      unsubscribe?.()
    }
  }, [priority])
}
