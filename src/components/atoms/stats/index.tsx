/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useEffect, useMemo } from 'react'
import _Stats from 'stats.js'
import { useFrame } from '@/hooks/use-frame'

export const Stats = () => {
  const stats = useMemo(() => new _Stats(), [])

  useEffect(() => {
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom)

    return () => {
      stats.dom.remove()
    }
  }, [stats])

  useFrame(() => {
    stats.begin()
  }, -Infinity)

  useFrame(() => {
    stats.end()
  }, Infinity)

  return null
}
