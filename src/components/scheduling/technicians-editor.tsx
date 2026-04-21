/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useMemo, useState } from 'react'
import type { SchedTechnician, TechShift } from '@/lib/scheduling/types'
import { minutesToLabel, parseTimeToMinutes } from '@/lib/scheduling/time'
import { appToast } from '@/lib/app-toast'
import { cn } from '@/lib/styles'

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]

const SHIFT_LABEL: Record<TechShift, string> = {
  off: 'Nghỉ',
  am: 'Sáng',
  pm: 'Chiều',
  full: 'Cả ngày',
}

const SHIFT_ORDER: TechShift[] = ['full', 'am', 'pm', 'off']

type ClickMode = 'cycle' | 'range'

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

function newId(): string {
  return crypto.randomUUID()
}

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

interface TechniciansEditorProps {
  technicians: SchedTechnician[]
  onChange: (next: SchedTechnician[]) => void
  schedulingDate: string
  onLoadShared?: () => void
}

const inputCls = cn(
  'min-h-[2.5rem] w-full rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2 text-sm text-[var(--notika-text)] outline-none transition',
  'placeholder:text-[var(--notika-muted)] focus:border-[var(--notika-green)] focus:ring-2 focus:ring-[var(--notika-green)]/20',
)

const btnPrimary = cn(
  'min-h-[2.5rem] rounded-xl border border-[var(--notika-green)]/30 bg-[var(--notika-green)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition',
  'hover:bg-[var(--notika-green)]/90 disabled:opacity-50',
)

const btnSecondary = cn(
  'min-h-[2.5rem] rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-1.5 text-xs font-medium text-[var(--notika-text)] shadow-sm transition',
  'hover:bg-[var(--muted)]',
)

const btnGhost = cn(
  'rounded-lg border border-[var(--notika-border)] bg-transparent px-2 py-1 text-xs text-[var(--notika-muted)] transition',
  'hover:border-rose-300 hover:text-rose-600',
)

export function TechniciansEditor({ technicians, onChange, schedulingDate, onLoadShared }: TechniciansEditorProps) {
  const initialMonth = schedulingDate ? schedulingDate.slice(0, 7) : goToday()
  const [viewMonth, setViewMonth] = useState(initialMonth)
  const [selectedId, setSelectedId] = useState<string | null>(technicians[0]?.id ?? null)
  const [clickMode, setClickMode] = useState<ClickMode>('cycle')
  const [rangeShift, setRangeShift] = useState<TechShift>('off')
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [hoverDate, setHoverDate] = useState<string | null>(null)

  const selected = useMemo(
    () => technicians.find((t) => t.id === selectedId) ?? technicians[0] ?? null,
    [technicians, selectedId],
  )

  const [viewY, viewM] = viewMonth.split('-').map(Number)

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

  const addTechnician = () => {
    const tech: SchedTechnician = {
      id: newId(),
      code: '',
      name: '',
      amStartM: 7 * 60 + 30,
      amEndM: 11 * 60 + 30,
      pmStartM: 13 * 60 + 30,
      pmEndM: 17 * 60,
      monthlyShifts: {},
      busy: [],
    }
    const next = [...technicians, tech]
    onChange(next)
    setSelectedId(tech.id)
  }

  const updateTech = (id: string, patch: Partial<SchedTechnician>) => {
    onChange(technicians.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const removeTech = (id: string) => {
    const ok = window.confirm('Xóa KTV này?')
    if (!ok) return
    onChange(technicians.filter((t) => t.id !== id))
    if (selectedId === id) setSelectedId(null)
    appToast.success('Đã xóa KTV')
  }

  const toggleDayShift = (iso: string) => {
    if (!selected) return
    const current = selected.monthlyShifts[iso]
    const idx = current ? SHIFT_ORDER.indexOf(current) : -1
    const nextShift = SHIFT_ORDER[(idx + 1) % SHIFT_ORDER.length] ?? 'full'
    const nextMap = { ...selected.monthlyShifts }
    if (nextShift === 'full') {
      delete nextMap[iso]
    } else {
      nextMap[iso] = nextShift
    }
    updateTech(selected.id, { monthlyShifts: nextMap })
  }

  const setDayShift = (iso: string, shift: TechShift) => {
    if (!selected) return
    const nextMap = { ...selected.monthlyShifts }
    if (shift === 'full') {
      delete nextMap[iso]
    } else {
      nextMap[iso] = shift
    }
    updateTech(selected.id, { monthlyShifts: nextMap })
  }

  const clearMonth = () => {
    if (!selected) return
    const ok = window.confirm(`Xóa toàn bộ lịch tháng ${viewM}/${viewY} của KTV ${selected.name}?`)
    if (!ok) return
    const nextMap = { ...selected.monthlyShifts }
    const prefix = `${viewY}-${pad2(viewM!)}`
    for (const k of Object.keys(nextMap)) {
      if (k.startsWith(prefix)) delete nextMap[k]
    }
    updateTech(selected.id, { monthlyShifts: nextMap })
    appToast.success('Đã xóa lịch tháng')
  }

  const bulkOffWeekends = () => {
    if (!selected) return
    const nextMap = { ...selected.monthlyShifts }
    const daysInMonth = new Date(viewY!, viewM!, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewY!, viewM! - 1, d)
      const dow = date.getDay()
      if (dow === 0 || dow === 6) {
        nextMap[toYYYYMMDD(date)] = 'off'
      }
    }
    updateTech(selected.id, { monthlyShifts: nextMap })
    appToast.success('Đã đánh dấu nghỉ T7 + CN')
  }

  const rangePreviewSet = useMemo(() => {
    if (clickMode !== 'range' || !rangeStart || !hoverDate) return new Set<string>()
    return new Set(expandDateRange(rangeStart, hoverDate))
  }, [clickMode, rangeStart, hoverDate])

  const applyShiftToRange = (startIso: string, endIso: string, shift: TechShift) => {
    if (!selected) return
    const list = expandDateRange(startIso, endIso)
    const nextMap = { ...selected.monthlyShifts }
    for (const iso of list) {
      if (shift === 'full') {
        delete nextMap[iso]
      } else {
        nextMap[iso] = shift
      }
    }
    updateTech(selected.id, { monthlyShifts: nextMap })
    appToast.success(`Đã áp dụng "${SHIFT_LABEL[shift]}" cho ${list.length} ngày`)
  }

  const handleDayClick = (iso: string) => {
    if (!selected) return
    if (clickMode === 'cycle') {
      toggleDayShift(iso)
      return
    }
    if (!rangeStart) {
      setRangeStart(iso)
      return
    }
    applyShiftToRange(rangeStart, iso, rangeShift)
    setRangeStart(null)
    setHoverDate(null)
  }

  const cancelRange = () => {
    setRangeStart(null)
    setHoverDate(null)
  }

  const switchClickMode = (m: ClickMode) => {
    setClickMode(m)
    cancelRange()
  }

  const shiftPickBtn = (active: boolean, color: string) => cn(
    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition',
    active
      ? `${color} text-white shadow-sm`
      : 'border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] hover:bg-[var(--muted)]',
  )

  return (
    <div className='space-y-5'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h3 className='text-base font-bold text-[var(--notika-text)]'>Kỹ thuật viên</h3>
        <div className='flex flex-wrap items-center gap-2'>
          {onLoadShared && (
            <button type='button' className={btnSecondary} onClick={onLoadShared}>
              + Từ danh sách chung
            </button>
          )}
          <button type='button' className={btnPrimary} onClick={addTechnician}>
            + Thêm KTV
          </button>
        </div>
      </div>

      {technicians.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-[var(--notika-border)] bg-[var(--notika-card)] p-8 text-center'>
          <p className='mb-2 text-sm font-semibold text-[var(--notika-text)]'>Chưa có KTV nào</p>
          <p className='text-xs text-[var(--notika-muted)]'>Thêm mới hoặc tải từ danh sách chung để bắt đầu</p>
        </div>
      ) : (
        <div className='grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]'>
          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-[var(--notika-muted)]'>
              Danh sách ({technicians.length})
            </p>
            <div className='max-h-[30rem] space-y-1 overflow-auto rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-2'>
              {technicians.map((t) => {
                const offCount = Object.values(t.monthlyShifts).filter((s) => s === 'off').length
                return (
                  <button
                    key={t.id}
                    type='button'
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition',
                      selected?.id === t.id
                        ? 'bg-[var(--notika-green-soft)] text-[var(--notika-green)]'
                        : 'text-[var(--notika-text)] hover:bg-[var(--muted)]',
                    )}
                  >
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='rounded-md bg-[var(--notika-green)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--notika-green)]'>
                          {t.code || '?'}
                        </span>
                        <span className='truncate font-semibold'>{t.name || 'Chưa đặt tên'}</span>
                      </div>
                      {offCount > 0 && (
                        <p className='mt-0.5 text-[11px] text-rose-500'>
                          {offCount} ngày nghỉ
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {selected && (
            <div className='space-y-4 rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-4'>
              <div className='grid gap-3 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--notika-muted)]'>
                    Mã KTV
                  </label>
                  <input
                    className={inputCls}
                    value={selected.code}
                    onChange={(e) => updateTech(selected.id, { code: e.target.value })}
                    placeholder='VD: K1'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--notika-muted)]'>
                    Họ tên
                  </label>
                  <input
                    className={inputCls}
                    value={selected.name}
                    onChange={(e) => updateTech(selected.id, { name: e.target.value })}
                    placeholder='Nguyễn Văn A'
                  />
                </div>
              </div>

              <div>
                <p className='mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--notika-muted)]'>
                  Giờ làm mặc định (áp dụng khi không có ca riêng trong tháng)
                </p>
                <div className='grid gap-3 sm:grid-cols-2 md:grid-cols-4'>
                  <TimeInput
                    label='Sáng BĐ'
                    value={selected.amStartM}
                    onChange={(v) => updateTech(selected.id, { amStartM: v })}
                  />
                  <TimeInput
                    label='Sáng KT'
                    value={selected.amEndM}
                    onChange={(v) => updateTech(selected.id, { amEndM: v })}
                  />
                  <TimeInput
                    label='Chiều BĐ'
                    value={selected.pmStartM}
                    onChange={(v) => updateTech(selected.id, { pmStartM: v })}
                  />
                  <TimeInput
                    label='Chiều KT'
                    value={selected.pmEndM}
                    onChange={(v) => updateTech(selected.id, { pmEndM: v })}
                  />
                </div>
              </div>

              <div className='rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-content)] p-3'>
                <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                  <div className='flex items-center gap-1.5'>
                    <button
                      type='button'
                      aria-label='Tháng trước'
                      title='Tháng trước'
                      className='flex h-9 w-9 items-center justify-center rounded-full border border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] shadow-sm transition hover:bg-[var(--muted)] hover:border-[var(--notika-green)]/40 active:scale-95'
                      onClick={() => setViewMonth(shiftMonth(viewMonth, -1))}
                    >
                      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' className='shrink-0'>
                        <path d='M10 3 5 8l5 5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
                      </svg>
                    </button>
                    <div className='px-2 text-sm font-semibold text-[var(--notika-text)] min-w-[7rem] text-center'>
                      {MONTH_NAMES[viewM! - 1]} {viewY}
                    </div>
                    <button
                      type='button'
                      aria-label='Tháng sau'
                      title='Tháng sau'
                      className='flex h-9 w-9 items-center justify-center rounded-full border border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] shadow-sm transition hover:bg-[var(--muted)] hover:border-[var(--notika-green)]/40 active:scale-95'
                      onClick={() => setViewMonth(shiftMonth(viewMonth, 1))}
                    >
                      <svg width='16' height='16' viewBox='0 0 16 16' fill='none' className='shrink-0'>
                        <path d='M6 3l5 5-5 5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
                      </svg>
                    </button>
                    <button
                      type='button'
                      className={cn(btnSecondary, 'ml-1 rounded-full px-3')}
                      onClick={() => setViewMonth(goToday())}
                    >
                      Hôm nay
                    </button>
                  </div>
                  <div className='flex flex-wrap items-center gap-1'>
                    <button type='button' className={btnGhost} onClick={bulkOffWeekends}>
                      Nghỉ T7 + CN
                    </button>
                    <button type='button' className={btnGhost} onClick={clearMonth}>
                      Xóa tháng này
                    </button>
                  </div>
                </div>

                <div className='mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-2.5 py-2'>
                  <span className='text-[10px] font-bold uppercase tracking-wide text-[var(--notika-muted)]'>Cách thao tác:</span>
                  <button
                    type='button'
                    onClick={() => switchClickMode('cycle')}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition',
                      clickMode === 'cycle'
                        ? 'border-[var(--notika-green)] bg-[var(--notika-green)] text-white shadow-sm'
                        : 'border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] hover:bg-[var(--muted)]',
                    )}
                  >
                    Click = đổi ca
                  </button>
                  <button
                    type='button'
                    onClick={() => switchClickMode('range')}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition',
                      clickMode === 'range'
                        ? 'border-[var(--notika-green)] bg-[var(--notika-green)] text-white shadow-sm'
                        : 'border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] hover:bg-[var(--muted)]',
                    )}
                  >
                    Chọn từ → đến
                  </button>

                  {clickMode === 'range' && (
                    <>
                      <span className='mx-1 h-5 w-px bg-[var(--notika-border)]' />
                      <span className='text-[10px] font-bold uppercase tracking-wide text-[var(--notika-muted)]'>Áp ca:</span>
                      <button type='button' onClick={() => setRangeShift('off')} className={shiftPickBtn(rangeShift === 'off', 'bg-rose-500 border-rose-500')}>
                        <span className='inline-block h-1.5 w-1.5 rounded-full bg-white/80' /> Nghỉ
                      </button>
                      <button type='button' onClick={() => setRangeShift('am')} className={shiftPickBtn(rangeShift === 'am', 'bg-amber-500 border-amber-500')}>
                        <span className='inline-block h-1.5 w-1.5 rounded-full bg-white/80' /> Sáng
                      </button>
                      <button type='button' onClick={() => setRangeShift('pm')} className={shiftPickBtn(rangeShift === 'pm', 'bg-sky-500 border-sky-500')}>
                        <span className='inline-block h-1.5 w-1.5 rounded-full bg-white/80' /> Chiều
                      </button>
                      <button type='button' onClick={() => setRangeShift('full')} className={shiftPickBtn(rangeShift === 'full', 'bg-emerald-500 border-emerald-500')}>
                        <span className='inline-block h-1.5 w-1.5 rounded-full bg-white/80' /> Cả ngày
                      </button>
                      {rangeStart && (
                        <span className='ml-1 flex items-center gap-1.5 text-[11px] text-[var(--notika-muted)]'>
                          Bắt đầu: <b className='text-[var(--notika-text)]'>{rangeStart}</b>
                          <button
                            type='button'
                            onClick={cancelRange}
                            className='rounded-md border border-[var(--notika-border)] px-1.5 py-0.5 text-[10px] hover:bg-[var(--muted)]'
                          >
                            Huỷ
                          </button>
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className='mb-2 flex flex-wrap gap-3 text-[11px] text-[var(--notika-muted)]'>
                  <LegendDot color='bg-emerald-400' label='Cả ngày' />
                  <LegendDot color='bg-amber-400' label='Sáng' />
                  <LegendDot color='bg-sky-400' label='Chiều' />
                  <LegendDot color='bg-rose-400' label='Nghỉ' />
                  <span className='ml-auto text-[11px]'>
                    {clickMode === 'cycle'
                      ? 'Click = đổi ca · double-click = xoá'
                      : 'Click ngày bắt đầu → click ngày kết thúc'}
                  </span>
                </div>

                <div className='grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[var(--notika-muted)]'>
                  {WEEKDAY_LABELS.map((w) => (
                    <div key={w} className='py-1'>{w}</div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-1'>
                  {weeks.flat().map((cell, idx) => {
                    const iso = toYYYYMMDD(cell.date)
                    const shift = selected.monthlyShifts[iso]
                    const isToday = iso === toYYYYMMDD(new Date())
                    const dow = cell.date.getDay()
                    const isWeekend = dow === 0 || dow === 6
                    const isRangeAnchor = clickMode === 'range' && rangeStart === iso
                    const isInPreview = rangePreviewSet.has(iso)
                    const previewColor =
                      rangeShift === 'off' ? 'border-rose-400 bg-rose-100 text-rose-800 dark:bg-rose-950/50'
                      : rangeShift === 'am' ? 'border-amber-400 bg-amber-100 text-amber-800 dark:bg-amber-950/50'
                      : rangeShift === 'pm' ? 'border-sky-400 bg-sky-100 text-sky-800 dark:bg-sky-950/50'
                      : 'border-emerald-400 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50'
                    return (
                      <button
                        key={idx}
                        type='button'
                        disabled={!cell.inMonth}
                        onClick={() => cell.inMonth && handleDayClick(iso)}
                        onDoubleClick={() => cell.inMonth && clickMode === 'cycle' && setDayShift(iso, 'full')}
                        onMouseEnter={() => cell.inMonth && clickMode === 'range' && rangeStart && setHoverDate(iso)}
                        onFocus={() => cell.inMonth && clickMode === 'range' && rangeStart && setHoverDate(iso)}
                        className={cn(
                          'relative flex h-14 flex-col items-center justify-center rounded-lg border text-xs transition',
                          cell.inMonth
                            ? 'cursor-pointer border-[var(--notika-border)] bg-[var(--notika-card)] hover:border-[var(--notika-green)]'
                            : 'cursor-default border-transparent opacity-30',
                          isToday && cell.inMonth && !isRangeAnchor && 'ring-2 ring-[var(--notika-green)]',
                          !isRangeAnchor && !isInPreview && shift === 'off' && 'border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:border-rose-800/50',
                          !isRangeAnchor && !isInPreview && shift === 'am' && 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800/50',
                          !isRangeAnchor && !isInPreview && shift === 'pm' && 'border-sky-300 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:border-sky-800/50',
                          isInPreview && !isRangeAnchor && previewColor,
                          isRangeAnchor && 'border-[var(--notika-green)] bg-[var(--notika-green)] text-white ring-2 ring-[var(--notika-green)]/40',
                        )}
                      >
                        <span className={cn('text-[13px] font-semibold', isWeekend && cell.inMonth && !shift && !isRangeAnchor && !isInPreview && 'text-rose-500')}>
                          {cell.date.getDate()}
                        </span>
                        {shift && !isRangeAnchor && !isInPreview && (
                          <span className='mt-0.5 text-[9px] font-bold uppercase'>
                            {SHIFT_LABEL[shift]}
                          </span>
                        )}
                        {isInPreview && !isRangeAnchor && (
                          <span className='mt-0.5 text-[9px] font-bold uppercase'>
                            {SHIFT_LABEL[rangeShift]}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className='mt-3 flex flex-wrap items-center justify-between gap-2 text-xs'>
                  <div className='flex items-center gap-2'>
                    <span className='text-[var(--notika-muted)]'>Thống kê tháng:</span>
                    <span className='font-semibold text-rose-600'>
                      {Object.entries(selected.monthlyShifts).filter(([k, v]) => k.startsWith(`${viewY}-${pad2(viewM!)}`) && v === 'off').length} ngày nghỉ
                    </span>
                  </div>
                  <div className='flex items-center justify-end gap-3 text-right'>
                    <button
                      type='button'
                      className='rounded-lg border border-rose-300 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/30'
                      onClick={() => removeTech(selected.id)}
                    >
                      Xóa KTV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className='inline-flex items-center gap-1'>
      <span className={cn('inline-block h-2.5 w-2.5 rounded-full', color)} />
      {label}
    </span>
  )
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (v: number | null) => void
}) {
  const text = value === null ? '' : minutesToLabel(value)
  return (
    <div>
      <label className='mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--notika-muted)]'>
        {label}
      </label>
      <input
        type='time'
        className={inputCls}
        value={text}
        onChange={(e) => {
          const v = e.target.value.trim()
          if (!v) {
            onChange(null)
            return
          }
          const parsed = parseTimeToMinutes(v)
          onChange(parsed)
        }}
      />
    </div>
  )
}
