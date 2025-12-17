/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

export function removeParentSticky(element: HTMLElement): void {
  const position = getComputedStyle(element).position
  const isSticky = position === 'sticky'

  if (isSticky) {
    element.style.setProperty('position', 'relative')
    element.dataset.sticky = 'true'
  }

  const parent = element.offsetParent as HTMLElement | null
  if (parent) {
    removeParentSticky(parent)
  }
}

export function addParentSticky(element: HTMLElement): void {
  if (element.dataset?.sticky === 'true') {
    element.style.removeProperty('position')
    delete element.dataset.sticky
  }

  const parent = element.parentNode as HTMLElement | null
  if (parent) {
    addParentSticky(parent)
  }
}

export function offsetTop(element: HTMLElement, accumulator = 0): number {
  const top = accumulator + element.offsetTop
  const parent = element.offsetParent as HTMLElement | null
  return parent ? offsetTop(parent, top) : top
}

export function offsetLeft(element: HTMLElement, accumulator = 0): number {
  const left = accumulator + element.offsetLeft
  const parent = element.offsetParent as HTMLElement | null
  return parent ? offsetLeft(parent, left) : left
}

export function scrollTop(element: HTMLElement | null, accumulator = 0): number {
  const top = accumulator + (element?.scrollTop ?? 0)
  const parent = element?.parentNode as HTMLElement | null
  if (parent) {
    return scrollTop(parent, top)
  }
  return top + window.scrollY
}

export function scrollLeft(element: HTMLElement | null, accumulator = 0): number {
  const left = accumulator + (element?.scrollLeft ?? 0)
  const parent = element?.parentNode as HTMLElement | null
  if (parent) {
    return scrollLeft(parent, left)
  }
  return left + window.scrollX
}
