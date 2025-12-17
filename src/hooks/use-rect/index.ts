/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { addParentSticky, offsetLeft, offsetTop, removeParentSticky } from '@/lib/position'
import { emitter } from '@/lib/emitter'
import debounce from 'just-debounce-it'

/**
 * Kiểu dữ liệu mô tả thông tin bounding box của một phần tử.
 */
export interface Rect {
  top: number
  left: number
  width: number
  height: number
  x: number
  y: number
  bottom: number
  right: number
  element?: HTMLElement
  resize?: () => void
}

/**
 * Cấu hình của hook useRect
 */
export interface UseRectOptions {
  ignoreTransform?: boolean
  ignoreSticky?: boolean
  debounce?: number
  lazy?: boolean
  callback?: (rect: Rect) => void
}

/**
 * Hook theo dõi toạ độ, kích thước, và thay đổi layout của một phần tử DOM.
 */
export function useRect({
  ignoreTransform = false,
  ignoreSticky = true,
  debounce: debounceDelay = 500,
  lazy = false,
  callback,
}: UseRectOptions = {}) {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const rectRef = useRef<Partial<Rect>>({})
  const [rect, setRectState] = useState<Partial<Rect>>({})
  const [wrapperElement, setWrapperElementRef] = useState<HTMLElement | null>(null)

  const setRect = useCallback(
    ({ top, left, width, height, element }: Partial<Rect>) => {
      const prev = rectRef.current

      top = top ?? prev.top
      left = left ?? prev.left
      width = width ?? prev.width
      height = height ?? prev.height
      element = element ?? prev.element

      if (
        top === prev.top &&
        left === prev.left &&
        width === prev.width &&
        height === prev.height &&
        element === prev.element
      )
        return

      const nextRect: Rect = {
        top: top ?? 0,
        y: top ?? 0,
        left: left ?? 0,
        x: left ?? 0,
        width: width ?? 0,
        height: height ?? 0,
        bottom: (top ?? 0) + (height ?? 0),
        right: (left ?? 0) + (width ?? 0),
        element,
      }

      rectRef.current = nextRect
      callback?.(nextRect)

      if (!lazy) {
        setRectState({ ...nextRect })
      }
    },
    [lazy, callback]
  )

  // --- Observe element size changes ---
  useEffect(() => {
    if (!element) return

    const rect = element.getBoundingClientRect()
    setRect({ width: rect.width, height: rect.height })

    const onResize = debounce(([entry]: ResizeObserverEntry[]) => {
      const box = entry.borderBoxSize?.[0]
      if (box) {
        const width = box.inlineSize
        const height = box.blockSize
        setRect({ width, height })
      }
    }, debounceDelay)

    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
      onResize.cancel()
    }
  }, [element, debounceDelay, setRect])

  // --- Handle wrapper scroll/resize ---
  const onWrapperResize = useCallback(() => {
    if (!element) return

    let top: number
    let left: number

    if (ignoreSticky) removeParentSticky(element)

    if (ignoreTransform) {
      top = offsetTop(element)
      left = offsetLeft(element)
    } else {
      const rect = element.getBoundingClientRect()
      top = rect.top + (wrapperElement?.scrollTop ?? window.scrollY)
      left = rect.left + (wrapperElement?.scrollLeft ?? window.scrollX)
    }

    if (ignoreSticky) addParentSticky(element)

    setRect({ top, left, element })
  }, [ignoreTransform, ignoreSticky, element, setRect, wrapperElement])

  // --- Observe body/wrapper resize ---
  useEffect(() => {
    onWrapperResize()
    const debouncedOnWrapperResize = debounce(onWrapperResize, debounceDelay)
    const target = wrapperElement ?? document.body

    const resizeObserver = new ResizeObserver(debouncedOnWrapperResize)
    resizeObserver.observe(target)

    return () => {
      resizeObserver.disconnect()
      debouncedOnWrapperResize.cancel()
    }
  }, [wrapperElement, debounceDelay, onWrapperResize])

  // --- Global resize event via emitter ---
  const onResize = useCallback(() => {
    if (!element) return
    const elementRect = element.getBoundingClientRect()

    setRect({
      width: elementRect.width,
      height: elementRect.height,
    })

    onWrapperResize()
  }, [element, onWrapperResize, setRect])

  useEffect(() => {
    rectRef.current.resize = onResize
    if (!lazy) {
      setRectState({ ...rectRef.current })
    }

    return emitter.on('resize', onResize)
  }, [onResize, lazy])

  const getRect = useCallback(() => rectRef.current, [])

  if (lazy) {
    return [setElement, getRect, setWrapperElementRef] as const
  }

  return [setElement, rect as Rect, setWrapperElementRef] as const
}

export function ensureRect(rect: Partial<Rect> | (() => Partial<Rect>)): Partial<Rect> {
  return typeof rect === 'function' ? rect() : rect
}

// --- Static method ---
useRect.resize = (): void => {
  emitter.emit('resize')
}
