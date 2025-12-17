/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { RefObject, useEffect, useState } from 'react'

export const useIntersection = (
  ref: RefObject<HTMLElement | null>,
  options: IntersectionObserverInit
): IntersectionObserverEntry | null => {
  const [intersectionObserverEntry, setIntersectionObserverEntry] = useState<IntersectionObserverEntry | null>(null)

  useEffect(() => {
    if (ref.current && typeof IntersectionObserver === 'function') {
      const handler = (entries: IntersectionObserverEntry[]) => {
        setIntersectionObserverEntry(entries[0])
      }

      const observer = new IntersectionObserver(handler, options)
      observer.observe(ref.current)

      return () => {
        setIntersectionObserverEntry(null)
        observer.disconnect()
      }
    }
    return () => {}
  }, [ref.current, options.threshold, options.root, options.rootMargin])

  return intersectionObserverEntry
}
