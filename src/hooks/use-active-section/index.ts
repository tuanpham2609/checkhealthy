/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Scroll offset to prevent sections from being hidden behind sticky header
 */
const DEFAULT_OFFSET = 120

interface UseActiveSectionOptions {
  offset?: number
}

/**
 * Hook to detect which section is currently active based on scroll position
 * Uses IntersectionObserver to track when sections enter the viewport
 * 
 * @param sectionIds - Array of section IDs to track
 * @param options - Configuration options including offset
 * @returns The ID of the currently active section, or null if none
 */
export function useActiveSection(sectionIds: string[], options?: UseActiveSectionOptions) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const observersRef = useRef<Array<{ element: HTMLElement; observer: IntersectionObserver }>>([])
  const offset = options?.offset ?? DEFAULT_OFFSET

  useEffect(() => {
    // Clean up previous observers
    observersRef.current.forEach(({ observer }) => observer.disconnect())
    observersRef.current = []

    // Create observers for each section
    const observerOptions: IntersectionObserverInit = {
      rootMargin: `-${offset}px 0px -50% 0px`,
      threshold: 0,
    }

    const activeSections = new Set<string>()

    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (!element) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              activeSections.add(id)
            } else {
              activeSections.delete(id)
            }

            // Find the first active section (topmost in viewport)
            const sortedIds = sectionIds.filter((sid) => activeSections.has(sid))
            if (sortedIds.length > 0) {
              // Get the topmost section by comparing positions
              const topmost = sortedIds.reduce((prev, current) => {
                const prevEl = document.getElementById(prev)
                const currentEl = document.getElementById(current)
                if (!prevEl || !currentEl) return prev

                const prevTop = prevEl.getBoundingClientRect().top
                const currentTop = currentEl.getBoundingClientRect().top

                // If both are above viewport, prefer the one closer to top
                if (prevTop < offset && currentTop < offset) {
                  return prevTop > currentTop ? prev : current
                }

                // If one is in viewport, prefer that one
                if (prevTop >= offset && prevTop <= window.innerHeight) {
                  return prev
                }
                if (currentTop >= offset && currentTop <= window.innerHeight) {
                  return current
                }

                // Otherwise prefer the one closer to viewport
                return Math.abs(prevTop - offset) < Math.abs(currentTop - offset) ? prev : current
              })

              setActiveSectionId(topmost)
            } else if (activeSections.size === 0) {
              // If no sections are active, check if we're at the top
              if (window.scrollY < offset) {
                setActiveSectionId(sectionIds[0] || null)
              }
            }
          })
        },
        observerOptions
      )

      observer.observe(element)
      observersRef.current.push({ element, observer })
    })

    // Initial check for active section
    const checkInitialActive = () => {
      if (window.scrollY < offset) {
        setActiveSectionId(sectionIds[0] || null)
        return
      }

      // Find the section closest to the top
      let closestId: string | null = null
      let closestDistance = Infinity

      sectionIds.forEach((id) => {
        const element = document.getElementById(id)
        if (!element) return

        const rect = element.getBoundingClientRect()
        const distance = Math.abs(rect.top - offset)

        if (distance < closestDistance) {
          closestDistance = distance
          closestId = id
        }
      })

      if (closestId) {
        setActiveSectionId(closestId)
      }
    }

    // Wait for DOM to be ready
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        checkInitialActive()
      } else {
        window.addEventListener('load', checkInitialActive)
        return () => {
          window.removeEventListener('load', checkInitialActive)
          observersRef.current.forEach(({ observer }) => observer.disconnect())
        }
      }
    }

    return () => {
      observersRef.current.forEach(({ observer }) => observer.disconnect())
      observersRef.current = []
    }
  }, [sectionIds, offset])

  return activeSectionId
}
