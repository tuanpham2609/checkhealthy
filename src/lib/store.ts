/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { create } from 'zustand'
import Lenis from 'lenis'

interface StoreState {
  navIsOpen: boolean
  setNavIsOpen: (toggle: boolean) => void

  screenIphone: string
  setScreenIphone: (value: string | ((prev: string) => string)) => void

  lenis: Lenis | null
  setLenis: (lenis: Lenis | null) => void

  overflow: boolean
  setOverflow: (overflow: boolean) => void

  triggerTransition: string
  setTriggerTransition: (triggerTransition: string) => void

  thresholds: Record<string, number>
  addThreshold: (params: { id: string; value: number }) => void
  removeThreshold: (id: string) => void
  clearThresholds: () => void

  introOut: boolean
  setIntroOut: (introOut: boolean) => void
}

export const useStore = create<StoreState>((set, get) => ({
  navIsOpen: false,
  setNavIsOpen: (toggle) => set({ navIsOpen: toggle, overflow: !toggle }),

  screenIphone: '1',
  setScreenIphone: (screenIphone) =>
    set((state) => ({
      screenIphone: typeof screenIphone === 'function' ? screenIphone(state.screenIphone) : screenIphone,
    })),

  lenis: null,
  setLenis: (lenis) => set({ lenis }),

  overflow: true,
  setOverflow: (overflow) => set({ overflow }),

  triggerTransition: '',
  setTriggerTransition: (triggerTransition) => set({ triggerTransition }),

  thresholds: {},
  addThreshold: ({ id, value }) => {
    const thresholds = { ...get().thresholds }
    thresholds[id] = value
    set({ thresholds })
  },
  removeThreshold: (id) =>
    set((state) => {
      const thresholds = { ...state.thresholds }
      delete thresholds[id]
      return { thresholds }
    }),
  clearThresholds: () => set({ thresholds: {} }),

  introOut: true, // Luôn true vì không còn intro screen
  setIntroOut: (introOut) => set({ introOut }),
}))
