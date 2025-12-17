/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useEffect } from 'react'

export const RealViewport = () => {
  useEffect(() => {
    //https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
    function onWindowResize() {
      document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px')

      document.documentElement.style.setProperty('--dvh', window.innerHeight * 0.01 + 'px')

      document.documentElement.style.setProperty('--svh', document.documentElement.clientHeight * 0.01 + 'px')

      document.documentElement.style.setProperty('--lvh', '1vh')
    }

    window.addEventListener('resize', onWindowResize, false)
    onWindowResize()

    return () => {
      window.removeEventListener('resize', onWindowResize, false)
    }
  }, [])

  return null
}
