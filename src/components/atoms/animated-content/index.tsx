/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import React, { Children, useRef, useLayoutEffect, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface AnimatedContentProps {
  children: ReactNode
  distance?: number
  direction?: 'vertical' | 'horizontal'
  reverse?: boolean
  duration?: number
  ease?: string | ((progress: number) => number)
  initialOpacity?: number
  animateOpacity?: boolean
  scale?: number
  threshold?: number
  delay?: number
  mode?: 'scrub' | 'once'
  offsetVH?: number
  onComplete?: () => void
  className?: string
  name?: string
}

const AnimatedContent: React.FC<AnimatedContentProps> = ({
  children,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  mode = 'scrub',
  offsetVH = 0,
  onComplete,
  className = '',
  name = '',
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const uniqueIdRef = useRef<string | null>(null)

  if (!uniqueIdRef.current) {
    uniqueIdRef.current = `animated-${Math.random().toString(36).slice(2, 9)}`
  }

  const triggerId = name ? `animated-${name}` : uniqueIdRef.current!

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const axis = direction === 'horizontal' ? 'x' : 'y'
    const offset = reverse ? -distance : distance
    const startPct = (1 - threshold) * 100

    // 👇 thêm offset theo viewport height
    const startPosition = `top ${startPct + offsetVH * 100}%`
    const endPosition = `bottom ${startPct + offsetVH * 100}%`

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      gsap.set(el, {
        [axis]: 0,
        scale: 1,
        opacity: 1,
      })
      return
    }

    gsap.set(el, {
      [axis]: offset,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
    })

    const scrollTriggerConfig: ScrollTrigger.Vars = {
      trigger: el,
      start: startPosition,
      end: endPosition,
      id: triggerId,
      markers: false,
    }

    if (mode === 'scrub') {
      scrollTriggerConfig.scrub = true
    } else if (mode === 'once') {
      scrollTriggerConfig.toggleActions = 'play none none none'
      scrollTriggerConfig.once = true
    }

    const tween = gsap.to(el, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      duration,
      ease,
      delay: mode === 'scrub' ? 0 : delay,
      onComplete,
      scrollTrigger: scrollTriggerConfig,
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    threshold,
    delay,
    mode,
    offsetVH,
    onComplete,
    triggerId,
  ])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export interface AnimatedSequenceProps {
  children: ReactNode
  stagger?: number
  distance?: number
  direction?: 'vertical' | 'horizontal'
  reverse?: boolean
  duration?: number
  ease?: string | ((progress: number) => number)
  initialOpacity?: number
  animateOpacity?: boolean
  threshold?: number
  mode?: 'scrub' | 'once'
  offsetVH?: number
  className?: string
  onComplete?: () => void
}

export const AnimatedSequence: React.FC<AnimatedSequenceProps> = ({
  children,
  stagger = 0.15,
  distance = 60,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  threshold = 0.2,
  mode = 'scrub',
  offsetVH = 0,
  className = '',
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const childCount = Children.count(children)
  const uniqueIdRef = useRef<string | null>(null)

  if (!uniqueIdRef.current) {
    uniqueIdRef.current = `animated-sequence-${Math.random().toString(36).slice(2, 9)}`
  }

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const items = gsap.utils.toArray<HTMLElement>(container.children)
    if (!items.length) return

    const axis = direction === 'horizontal' ? 'x' : 'y'
    const offset = reverse ? -distance : distance
    const startPct = (1 - threshold) * 100
    const startPosition = `top ${startPct + offsetVH * 100}%`
    const endPosition = `bottom ${startPct + offsetVH * 100}%`

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      gsap.set(items, {
        [axis]: 0,
        opacity: 1,
      })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(items, {
        [axis]: offset,
        opacity: animateOpacity ? initialOpacity : 1,
      })

      const scrollTriggerConfig: ScrollTrigger.Vars = {
        trigger: container,
        start: startPosition,
        end: endPosition,
        id: uniqueIdRef.current!,
        markers: false,
      }

      if (mode === 'scrub') {
        scrollTriggerConfig.scrub = true
      } else {
        scrollTriggerConfig.toggleActions = 'play none none none'
        scrollTriggerConfig.once = true
      }

      const timeline = gsap.timeline({
        scrollTrigger: scrollTriggerConfig,
      })

      timeline.to(items, {
        [axis]: 0,
        opacity: 1,
        duration,
        ease,
        stagger: { each: stagger },
      })

      if (onComplete) {
        timeline.eventCallback('onComplete', onComplete)
      }
    }, container)

    return () => {
      ctx.revert()
    }
  }, [
    animateOpacity,
    childCount,
    direction,
    distance,
    duration,
    ease,
    initialOpacity,
    mode,
    offsetVH,
    onComplete,
    reverse,
    stagger,
    threshold,
  ])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

export default AnimatedContent
