/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { useEffect, useRef, useState, useMemo } from 'react'
import { gsap } from 'gsap'

type BlurTextProps = {
  text?: string
  delay?: number
  className?: string
  animateBy?: 'words' | 'letters'
  direction?: 'top' | 'bottom'
  threshold?: number
  rootMargin?: string
  animationFrom?: Record<string, string | number>
  animationTo?: Array<Record<string, string | number>>
  easing?: string
  onAnimationComplete?: () => void
  stepDuration?: number
}

const BlurText: React.FC<BlurTextProps> = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = 'power3.out',
  onAnimationComplete,
  stepDuration = 0.35,
}) => {
  const containerRef = useRef<HTMLParagraphElement>(null)
  const spanRefs = useRef<HTMLSpanElement[]>([])
  const [inView, setInView] = useState(false)

  // Observe visibility
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(containerRef.current as Element)
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  // Build animation states
  const defaultFrom = useMemo(
    () =>
      direction === 'top' ? { filter: 'blur(10px)', opacity: 0, y: -50 } : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  )

  const defaultTo = useMemo(
    () => [
      { filter: 'blur(5px)', opacity: 0.5, y: direction === 'top' ? 5 : -5 },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction]
  )

  const fromSnapshot = animationFrom ?? defaultFrom
  const toSnapshots = animationTo ?? defaultTo

  // GSAP animation
  useEffect(() => {
    if (!inView || !spanRefs.current.length) return

    const tl = gsap.timeline({
      onComplete: onAnimationComplete,
      defaults: { ease: easing },
    })

    spanRefs.current.forEach((el, i) => {
      if (!el) return

      // build keyframes manually
      const totalDuration = stepDuration * toSnapshots.length

      tl.fromTo(
        el,
        fromSnapshot,
        {
          ...toSnapshots[toSnapshots.length - 1],
          duration: totalDuration,
          delay: (i * delay) / 1000,
        },
        0 // start all relative to timeline start
      )
    })

    return () => {
      tl.kill()
    }
  }, [inView, fromSnapshot, toSnapshots, easing, delay, stepDuration, onAnimationComplete])

  const elements = animateBy === 'words' ? text.split(' ') : text.split('')

  return (
    <p ref={containerRef} className={`blur-text ${className} flex flex-wrap`}>
      {elements.map((segment, index) => (
        <span
          key={index}
          ref={(el) => {
            if (el) spanRefs.current[index] = el
          }}
          style={{
            display: 'inline-block',
            willChange: 'transform, filter, opacity',
          }}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </span>
      ))}
    </p>
  )
}

export default BlurText
