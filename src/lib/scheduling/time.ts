/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import type { TimeWindowM } from '@/lib/scheduling/types'

export function minutesToLabel(m: number): string {
  const clamped = Math.max(0, Math.min(m, 24 * 60))
  const h = Math.floor(clamped / 60)
  const mi = Math.round(clamped % 60)
  return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`
}

export function parseTimeToMinutes(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return null
  return h * 60 + min
}

export function intervalsOverlap(a0: number, a1: number, b0: number, b1: number): boolean {
  return Math.max(a0, b0) < Math.min(a1, b1)
}

export function windowOverlapsInterval(win: TimeWindowM, intervalStart: number, intervalEnd: number): boolean {
  if (win.startM === null || win.endM === null) return false
  if (win.endM <= win.startM) return false
  return intervalsOverlap(intervalStart, intervalEnd, win.startM, win.endM)
}

export function isEmptyWindow(w: TimeWindowM): boolean {
  if (w.startM === null || w.endM === null) return true
  return w.endM <= w.startM
}

export function shiftWindows(amStart: number | null, amEnd: number | null, pmStart: number | null, pmEnd: number | null): {
  am: TimeWindowM
  pm: TimeWindowM
} {
  return {
    am: { startM: amStart, endM: amEnd },
    pm: { startM: pmStart, endM: pmEnd },
  }
}

export function isMinuteInDoctorShift(minute: number, am: TimeWindowM, pm: TimeWindowM): boolean {
  const inAm = !isEmptyWindow(am) && minute >= am.startM! && minute < am.endM!
  const inPm = !isEmptyWindow(pm) && minute >= pm.startM! && minute < pm.endM!
  return inAm || inPm
}

export function intervalInsideDoctorShift(
  start: number,
  end: number,
  amStart: number | null,
  amEnd: number | null,
  pmStart: number | null,
  pmEnd: number | null,
): boolean {
  if (end <= start) return false
  const { am, pm } = shiftWindows(amStart, amEnd, pmStart, pmEnd)
  for (let t = start; t < end; t += 1) {
    if (!isMinuteInDoctorShift(t, am, pm)) return false
  }
  return true
}
