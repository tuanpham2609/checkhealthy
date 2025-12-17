/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLayoutEffect, useRef } from 'react'
import { mapRange } from '@/lib/maths'
import { useWindowSize } from '@/hooks/use-window-size'
import { useControls } from 'leva'

gsap.registerPlugin(ScrollTrigger)

interface ParallaxProps {
  className?: string
  children?: React.ReactNode
  speed?: number
  id?: string
  position?: 'top' | 'bottom'
}

export default function Parallax({ className, children, speed = 1, id = 'parallax', position }: ParallaxProps) {
  const trigger = useRef<HTMLDivElement | null>(null)
  const target = useRef<HTMLDivElement | null>(null)

  const { width: windowWidth } = useWindowSize()
  const [{ parallax: markersParallax }] = useControls('markers', () => ({
    parallax: false,
  }))

  useLayoutEffect(() => {
    if (!trigger.current || !target.current) return

    const y = windowWidth * speed * 0.1
    const setY = gsap.quickSetter(target.current, 'y', 'px')
    const set3D = gsap.quickSetter(target.current, 'force3D')

    const timeline = gsap.timeline({
      scrollTrigger: {
        id,
        trigger: trigger.current,
        scrub: true,
        start: 'top bottom',
        end: 'bottom top',
        markers: markersParallax,
        onUpdate: (e) => {
          if (position === 'top') {
            setY(e.progress * y)
          } else {
            setY(-mapRange(0, 1, e.progress, -y, y))
          }

          set3D(e.progress > 0 && e.progress < 1)
        },
      },
    })

    return () => {
      timeline.kill()
      ScrollTrigger.getById(id)?.kill()
    }
  }, [id, speed, position, windowWidth, markersParallax])

  return (
    <div ref={trigger}>
      <div ref={target} className={className}>
        {children}
      </div>
    </div>
  )
}
