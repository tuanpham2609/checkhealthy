/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'
import gsap from 'gsap'
import { useStore } from '@/lib/store'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import s from './page-transition.module.css'

export const PageTransition = () => {
  const pathname = usePathname()
  const router = useRouter()
  const curtainRef = useRef<HTMLDivElement | null>(null)
  const [pageLoaded, setPageloaded] = useState(false)
  const [curtainInComplete, setCurtainInComplete] = useState(false)
  const triggerTransition = useStore(({ triggerTransition }) => triggerTransition)
  const setTriggerTransition = useStore(({ setTriggerTransition }) => setTriggerTransition)
  const timeline = useRef(gsap.timeline())

  useEffect(() => {
    if (curtainInComplete) {
      setPageloaded(true)
    }
  }, [pathname, curtainInComplete])

  useEffect(() => {
    if (!triggerTransition || !curtainRef.current) return

    timeline.current.to(curtainRef.current, {
      x: 0,
      duration: 0.7,
      startAt: { x: '-100%' },
      onComplete: () => {
        router.push(triggerTransition)
        setCurtainInComplete(true)
      },
      ease: 'circ.out',
    })
  }, [triggerTransition, router])

  useEffect(() => {
    if (!pageLoaded || !curtainRef.current) return

    timeline.current.to(curtainRef.current, {
      x: '100%',
      paused: !pageLoaded,
      duration: 1,
      ease: 'circ.out',
      startAt: { x: 0 },
      onComplete: () => {
        setTriggerTransition('')
        setCurtainInComplete(false)
        setPageloaded(false)
      },
    })
  }, [pageLoaded])
  return <div className={s.transition} ref={curtainRef} />
}
