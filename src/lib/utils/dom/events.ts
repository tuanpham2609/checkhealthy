/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

export function on<K extends keyof HTMLElementEventMap>(
  obj: HTMLElement | Document | Window | null,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void {
  obj?.addEventListener(type, listener as EventListener, options)
}

export function off<K extends keyof HTMLElementEventMap>(
  obj: HTMLElement | Document | Window | null,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | EventListenerOptions
): void {
  obj?.removeEventListener(type, listener as EventListener, options)
}
