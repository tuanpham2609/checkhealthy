/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { isBrowser } from '@/lib/utils/dom/browser'

type TempusCallback = (now: number, deltaTime: number) => void

interface TempusItem {
  callback: TempusCallback
  priority: number
}

class Tempus {
  private callbacks: TempusItem[] = []
  private now: number = performance.now()

  constructor() {
    requestAnimationFrame(this.raf)
  }

  add(callback: TempusCallback, priority = 0): () => void {
    this.callbacks.push({ callback, priority })
    this.callbacks.sort((a, b) => a.priority - b.priority)

    return () => this.remove(callback)
  }

  remove(callback: TempusCallback): void {
    this.callbacks = this.callbacks.filter(({ callback: cb }) => cb !== callback)
  }

  private raf = (now: number): void => {
    requestAnimationFrame(this.raf)

    const deltaTime = now - this.now
    this.now = now

    for (let i = 0; i < this.callbacks.length; i++) {
      const { callback } = this.callbacks[i]
      callback(now, deltaTime)
    }
  }
}

const tempusInstance = isBrowser ? new Tempus() : null

export default tempusInstance
export type { TempusCallback }
