/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'ivf-confession-home-scroll-y'

export function persistConfessionHomeScrollNow() {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, String(window.scrollY))
}

function applyScrollY(y: number) {
  window.scrollTo(0, y)
  if (typeof document !== 'undefined') {
    document.documentElement.scrollTop = y
    document.body.scrollTop = y
  }
}

export function useConfessionHomeScrollRestore(ready: boolean) {
  useEffect(() => {
    if (!ready || typeof window === 'undefined') return

    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw == null) return

    const y = parseInt(raw, 10)
    if (Number.isNaN(y) || y <= 0) return

    const run = () => applyScrollY(y)

    run()
    const r1 = requestAnimationFrame(run)
    const r2 = requestAnimationFrame(() => requestAnimationFrame(run))
    const t0 = window.setTimeout(run, 0)
    const t1 = window.setTimeout(run, 50)
    const t2 = window.setTimeout(run, 120)
    const t3 = window.setTimeout(run, 300)

    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      window.clearTimeout(t0)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [ready])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let ticking = false
    const persist = () => {
      sessionStorage.setItem(STORAGE_KEY, String(window.scrollY))
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        persist()
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
}
