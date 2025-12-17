/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface StickyProps {
  children?: React.ReactNode
  wrapperClass?: string
  className?: string
  start?: number | string
  end?: number | string
  target?: string
  id?: string
  enabled?: boolean
  pinType?: 'fixed' | 'transform'
}

export function Sticky({
  children,
  wrapperClass,
  className,
  start = 0,
  end = 0,
  target,
  id = 'sticky',
  enabled = true,
  pinType = 'fixed',
}: StickyProps) {
  const pinSpacer = useRef<HTMLDivElement | null>(null)
  const trigger = useRef<HTMLDivElement | null>(null)
  const targetRef = useRef<HTMLElement | null>(null)

  // Setup ScrollTrigger
  useLayoutEffect(() => {
    if (!enabled || !pinSpacer.current || !trigger.current || !targetRef.current) return

    gsap.set(trigger.current, { clearProps: 'all' })

    const timeline = gsap.timeline({
      scrollTrigger: {
        id,
        pinType,
        pinSpacing: false,
        pinSpacer: pinSpacer.current,
        trigger: trigger.current,
        scrub: true,
        pin: true,
        start: `top top+=${parseFloat(start.toString())}px`,
        end: () => {
          const targetRect = targetRef.current?.getBoundingClientRect()
          const triggerRect = trigger.current?.getBoundingClientRect()
          if (!targetRect || !triggerRect) return '+=' + end

          return `+=${targetRect.bottom - triggerRect.bottom + parseFloat(end.toString())}`
        },
        invalidateOnRefresh: true,
        markers: false,
      },
    })

    return () => {
      timeline.kill()
      ScrollTrigger.getById(id)?.kill()
    }
  }, [id, start, enabled, end, pinType])

  // Resolve target element
  useLayoutEffect(() => {
    if (target) {
      targetRef.current = document.querySelector(target)
    } else if (pinSpacer.current) {
      targetRef.current = pinSpacer.current.parentElement
    }
  }, [target])

  return (
    <div ref={pinSpacer} className={wrapperClass}>
      <div ref={trigger} className={className}>
        {children}
      </div>
    </div>
  )
}
