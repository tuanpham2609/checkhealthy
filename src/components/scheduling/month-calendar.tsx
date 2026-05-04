/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

'use client'

import { useMemo, useState } from 'react'
import type { GlobalHoliday } from '@/lib/scheduling/types'
import { cn } from '@/lib/styles'

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

type ClickMode = 'select' | 'toggle-off' | 'range-off'

interface MonthCalendarProps {
  selectedDate: string
  viewMonth: string
  holidays: GlobalHoliday[]
  daysOff: string[]
  onSelectDate: (isoDate: string) => void
  onChangeMonth: (yyyyMm: string) => void
  /** Neu co callback -> hien thi thanh cong cu chinh ngay nghi tren lich */
  onDaysOffChange?: (daysOff: string[]) => void
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toYYYYMMDD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y!, m! - 1 + delta, 1)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
}

function goToday(): string {
  const n = new Date()
  return `${n.getFullYear()}-${pad2(n.getMonth() + 1)}`
}

/** Tra ve mang ISO date tu start den end (bao gom ca 2 dau) */
function expandDateRange(startIso: string, endIso: string): string[] {
  const a = new Date(startIso + 'T00:00:00')
  const b = new Date(endIso + 'T00:00:00')
  const from = a <= b ? a : b
  const to = a <= b ? b : a
  const out: string[] = []
  const cur = new Date(from)
  while (cur <= to) {
    out.push(toYYYYMMDD(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

export function MonthCalendar({
  selectedDate,
  viewMonth,
  holidays,
  daysOff,
  onSelectDate,
  onChangeMonth,
  onDaysOffChange,
}: MonthCalendarProps) {
  const [viewY, viewM] = viewMonth.split('-').map(Number)
  const [mode, setMode] = useState<ClickMode>('select')
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [hoverDate, setHoverDate] = useState<string | null>(null)

  const weeks = useMemo(() => {
    const start = new Date(viewY!, viewM! - 1, 1)
    const daysInMonth = new Date(viewY!, viewM!, 0).getDate()
    let dayOfWeek = start.getDay()
    if (dayOfWeek === 0) dayOfWeek = 7
    const offset = dayOfWeek - 1

    const prevMonth = new Date(viewY!, viewM! - 1, 0)
    const prevDays = prevMonth.getDate()

    const cells: { date: Date; inMonth: boolean }[] = []
    for (let i = offset - 1; i >= 0; i--) {
      cells.push({ date: new Date(viewY!, viewM! - 2, prevDays - i), inMonth: false })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(viewY!, viewM! - 1, d), inMonth: true })
    }
    while (cells.length % 7 !== 0) {
      const nextDay = cells.length - offset - daysInMonth + 1
      cells.push({ date: new Date(viewY!, viewM!, nextDay), inMonth: false })
    }

    const wks: { date: Date; inMonth: boolean }[][] = []
    for (let i = 0; i < cells.length; i += 7) wks.push(cells.slice(i, i + 7))
    return wks
  }, [viewY, viewM])

  const holidaySet = useMemo(() => {
    const s = new Set<string>()
    for (const h of holidays) {
      s.add(h.date)
      if (h.recurring) {
        const [, hm, hd] = h.date.split('-').map(Number)
        if (hm === viewM) {
          s.add(`${viewY}-${pad2(hm!)}-${pad2(hd!)}`)
        }
      }
    }
    return s
  }, [holidays, viewY, viewM])

  const holidayLabelMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const h of holidays) {
      m.set(h.date, h.label)
      if (h.recurring) {
        const [, hm, hd] = h.date.split('-').map(Number)
        const k = `${viewY}-${pad2(hm!)}-${pad2(hd!)}`
        m.set(k, h.label)
      }
    }
    return m
  }, [holidays, viewY])

  const daysOffSet = useMemo(() => new Set(daysOff), [daysOff])
  const todayStr = toYYYYMMDD(new Date())

  const rangePreviewSet = useMemo(() => {
    if (mode !== 'range-off' || !rangeStart || !hoverDate) return new Set<string>()
    return new Set(expandDateRange(rangeStart, hoverDate))
  }, [mode, rangeStart, hoverDate])

  const handleDayClick = (iso: string) => {
    if (mode === 'select' || !onDaysOffChange) {
      onSelectDate(iso)
      return
    }
    if (mode === 'toggle-off') {
      const set = new Set(daysOff)
      if (set.has(iso)) set.delete(iso)
      else set.add(iso)
      onDaysOffChange([...set].sort())
      return
    }
    // range-off
    if (!rangeStart) {
      setRangeStart(iso)
      return
    }
    const range = expandDateRange(rangeStart, iso)
    const set = new Set(daysOff)
    for (const d of range) set.add(d)
    onDaysOffChange([...set].sort())
    setRangeStart(null)
    setHoverDate(null)
  }

  const cancelRange = () => {
    setRangeStart(null)
    setHoverDate(null)
  }

  const switchMode = (next: ClickMode) => {
    setMode(next)
    setRangeStart(null)
    setHoverDate(null)
  }

  const clearMonthDaysOff = () => {
    if (!onDaysOffChange) return
    const prefix = `${viewY}-${pad2(viewM!)}`
    const next = daysOff.filter((d) => !d.startsWith(prefix))
    if (next.length === daysOff.length) return
    onDaysOffChange(next)
  }

  const navBtn = 'flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] shadow-sm transition hover:bg-[var(--muted)] active:scale-95'

  const modeBtn = (active: boolean) => cn(
    'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
    active
      ? 'border-[var(--notika-green)] bg-[var(--notika-green)] text-white shadow-sm'
      : 'border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] hover:bg-[var(--muted)]',
  )

  return (
    <div className='min-w-0 max-w-full'>
      {/* Header navigation */}
      <div className='mb-5 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-1'>
          <button type='button' className={navBtn} onClick={() => onChangeMonth(shiftMonth(viewMonth, -12))} aria-label='Năm trước' title='Năm trước'>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none' className='shrink-0'><path d='M8 3 3 8l5 5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/><path d='M13 3 8 8l5 5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/></svg>
          </button>
          <button type='button' className={navBtn} onClick={() => onChangeMonth(shiftMonth(viewMonth, -1))} aria-label='Tháng trước' title='Tháng trước'>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none' className='shrink-0'><path d='M10 3 5 8l5 5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/></svg>
          </button>
        </div>

        <button
          type='button'
          onClick={() => onChangeMonth(goToday())}
          className='group flex flex-col items-center gap-0'
          title='Về hôm nay'
        >
          <span className='text-lg font-bold tracking-tight text-[var(--notika-text)] transition group-hover:text-[var(--notika-green)]'>
            {MONTH_NAMES[viewM! - 1]}
          </span>
          <span className='text-xs font-medium text-[var(--notika-muted)] transition group-hover:text-[var(--notika-green)]'>
            {viewY}
          </span>
        </button>

        <div className='flex items-center gap-1'>
          <button type='button' className={navBtn} onClick={() => onChangeMonth(shiftMonth(viewMonth, 1))} aria-label='Tháng sau' title='Tháng sau'>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none' className='shrink-0'><path d='M6 3l5 5-5 5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/></svg>
          </button>
          <button type='button' className={navBtn} onClick={() => onChangeMonth(shiftMonth(viewMonth, 12))} aria-label='Năm sau' title='Năm sau'>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='none' className='shrink-0'><path d='M3 3l5 5-5 5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/><path d='M8 3l5 5-5 5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/></svg>
          </button>
        </div>
      </div>

      {/* Mode toolbar (chi hien khi co onDaysOffChange) */}
      {onDaysOffChange && (
        <div className='mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2'>
          <span className='text-[11px] font-bold uppercase tracking-wide text-[var(--notika-muted)]'>Chế độ:</span>
          <button type='button' className={modeBtn(mode === 'select')} onClick={() => switchMode('select')}>
            <span className='inline-block h-2 w-2 rounded-full bg-emerald-500' />
            Chọn ngày
          </button>
          <button type='button' className={modeBtn(mode === 'toggle-off')} onClick={() => switchMode('toggle-off')}>
            <span className='inline-block h-2 w-2 rounded-full bg-amber-500' />
            Toggle nghỉ
          </button>
          <button type='button' className={modeBtn(mode === 'range-off')} onClick={() => switchMode('range-off')}>
            <span className='inline-block h-2 w-2 rounded-full bg-rose-500' />
            Nghỉ từ → đến
          </button>

          {mode === 'range-off' && (
            <span className='ml-auto flex items-center gap-2 text-[11px] text-[var(--notika-muted)]'>
              {rangeStart ? (
                <>
                  <span>Bắt đầu: <b className='text-[var(--notika-text)]'>{rangeStart}</b> — click ngày cuối</span>
                  <button type='button' className='rounded-md border border-[var(--notika-border)] px-1.5 py-0.5 text-[10px] hover:bg-[var(--muted)]' onClick={cancelRange}>
                    Huỷ
                  </button>
                </>
              ) : (
                <span>Click ngày bắt đầu, rồi click ngày kết thúc</span>
              )}
            </span>
          )}

          {mode !== 'range-off' && (
            <button
              type='button'
              className='ml-auto text-[11px] text-[var(--notika-muted)] underline-offset-2 hover:text-rose-600 hover:underline'
              onClick={clearMonthDaysOff}
            >
              Xoá ngày nghỉ tháng này
            </button>
          )}
        </div>
      )}

      {/* Calendar grid */}
      <div className='overflow-hidden rounded-2xl border border-[var(--notika-border)] shadow-sm'>
        {/* Weekday header */}
        <div className='grid grid-cols-7 bg-gradient-to-b from-[#f3f5f7] to-[#eef0f3] dark:from-[var(--muted)] dark:to-[var(--notika-card)]'>
          {WEEKDAY_LABELS.map((l, i) => (
            <div
              key={i}
              className={cn(
                'py-3 text-center text-[11px] font-bold uppercase tracking-widest',
                i >= 5 ? 'text-rose-500 dark:text-rose-400' : 'text-[var(--notika-muted)]',
              )}
            >
              {l}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className='bg-[var(--notika-card)]'>
          {weeks.map((week, wi) => (
            <div key={wi} className='grid grid-cols-7'>
              {week.map((cell, di) => {
                const iso = toYYYYMMDD(cell.date)
                const isSelected = iso === selectedDate && mode === 'select'
                const isToday = iso === todayStr
                const isHoliday = holidaySet.has(iso)
                const isDayOff = daysOffSet.has(iso)
                const isSunday = cell.date.getDay() === 0
                const isSaturday = cell.date.getDay() === 6
                const hLabel = holidayLabelMap.get(iso)
                const outOfMonth = !cell.inMonth
                const isRangeAnchor = mode === 'range-off' && rangeStart === iso
                const isInRangePreview = rangePreviewSet.has(iso)

                const titleParts: string[] = []
                if (hLabel) titleParts.push(hLabel)
                if (isDayOff) titleParts.push('Nghỉ riêng')

                return (
                  <button
                    key={di}
                    type='button'
                    onClick={() => !outOfMonth && handleDayClick(iso)}
                    onMouseEnter={() => mode === 'range-off' && rangeStart && setHoverDate(iso)}
                    onFocus={() => mode === 'range-off' && rangeStart && setHoverDate(iso)}
                    title={titleParts.length ? titleParts.join(' · ') : undefined}
                    className={cn(
                      'group relative flex min-h-[2.75rem] flex-col items-center justify-center border-b border-r border-[var(--notika-border)]/30 px-0.5 py-2 text-sm tabular-nums transition-all duration-150 sm:min-h-[3.5rem]',
                      outOfMonth && 'text-[var(--notika-muted)]/40',
                      !outOfMonth && !isSelected && (isSunday || isSaturday) && 'text-rose-500 dark:text-rose-400',
                      !outOfMonth && isToday && !isSelected && 'font-extrabold text-[var(--notika-green)]',
                      isSelected
                        ? 'z-10 bg-[var(--notika-green)] font-bold text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]'
                        : isRangeAnchor
                          ? 'z-10 bg-rose-500 font-bold text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]'
                          : isInRangePreview && !outOfMonth
                            ? 'bg-rose-100/80 font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200'
                            : isHoliday && !outOfMonth
                              ? 'bg-rose-50/80 dark:bg-rose-950/25'
                              : isDayOff && !outOfMonth
                                ? 'bg-amber-50/80 dark:bg-amber-950/20'
                                : 'hover:bg-[var(--notika-green)]/[0.06] dark:hover:bg-[var(--notika-green)]/[0.08]',
                    )}
                  >
                    {/* Today ring indicator */}
                    {isToday && !isSelected && !isRangeAnchor && (
                      <span className='absolute inset-1 rounded-xl border-2 border-[var(--notika-green)]/30 sm:inset-1.5' />
                    )}

                    <span className='relative z-[1]'>{cell.date.getDate()}</span>

                    {/* Holiday label truncated under the number */}
                    {hLabel && !isSelected && !isRangeAnchor && !outOfMonth ? (
                      <span className='mt-0.5 hidden max-w-full truncate text-[9px] font-medium leading-none text-rose-600 dark:text-rose-400 sm:inline-block'>
                        {hLabel}
                      </span>
                    ) : null}

                    {/* Status dots */}
                    {!isSelected && !isRangeAnchor && !outOfMonth && (isHoliday || isDayOff) ? (
                      <span className='absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5'>
                        {isHoliday && <span className='h-1 w-1 rounded-full bg-rose-500 shadow-sm' />}
                        {isDayOff && <span className='h-1 w-1 rounded-full bg-amber-500 shadow-sm' />}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className='mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-[var(--notika-muted)]'>
        <span className='flex items-center gap-1.5'>
          <span className='inline-block h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/30' />
          Ngày lễ
        </span>
        <span className='flex items-center gap-1.5'>
          <span className='inline-block h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/30' />
          Nghỉ riêng
        </span>
        <span className='flex items-center gap-1.5'>
          <span className='inline-block h-2.5 w-5 rounded bg-[var(--notika-green)] shadow-sm' />
          Đang chọn
        </span>
        <span className='flex items-center gap-1.5'>
          <span className='inline-block h-2.5 w-2.5 rounded-full border-2 border-[var(--notika-green)]/40 bg-transparent' />
          Hôm nay
        </span>
      </div>
    </div>
  )
}
