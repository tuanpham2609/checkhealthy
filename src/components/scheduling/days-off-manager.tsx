/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

'use client'

import { useState } from 'react'
import { SchedDateField } from '@/components/scheduling/sched-aria-fields'
import type { GlobalHoliday } from '@/lib/scheduling/types'
import { appToast } from '@/lib/app-toast'
import { cn } from '@/lib/styles'

interface DaysOffManagerProps {
  holidays: GlobalHoliday[]
  daysOff: string[]
  holidayBusy: boolean
  onAddHoliday: (body: { date: string; label: string; recurring: boolean }) => Promise<unknown>
  onRemoveHoliday: (id: string) => Promise<unknown>
  onDaysOffChange: (daysOff: string[]) => void
}

const btnAdd = cn(
  'min-h-[2.75rem] shrink-0 rounded-xl border border-[var(--notika-green)]/30 bg-[var(--notika-green-soft)] px-4 py-2 text-sm font-semibold text-[var(--notika-green)] shadow-sm transition',
  'hover:bg-[var(--notika-green)] hover:text-white disabled:opacity-50 dark:border-[var(--notika-green)]/25 dark:bg-[var(--notika-green)]/10 dark:hover:bg-[var(--notika-green)]',
)

const inputSm = cn(
  'min-h-[2.75rem] w-full rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2 text-sm text-[var(--notika-text)] outline-none transition',
  'placeholder:text-[var(--notika-muted)] focus:border-[var(--notika-green)] focus:ring-2 focus:ring-[var(--notika-green)]/20',
)

const sectionTitle = cn(
  'mb-4 flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[var(--notika-green)] dark:text-[var(--brand-soft)]',
)

function formatViDate(iso: string): string {
  try {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}

export function DaysOffManager({
  holidays,
  daysOff,
  holidayBusy,
  onAddHoliday,
  onRemoveHoliday,
  onDaysOffChange,
}: DaysOffManagerProps) {
  const [hDate, setHDate] = useState('')
  const [hLabel, setHLabel] = useState('')
  const [hRecurring, setHRecurring] = useState(false)

  const [offDate, setOffDate] = useState('')

  async function handleAddHoliday() {
    if (!hDate) {
      appToast.warning('Chọn ngày trước khi thêm')
      return
    }
    try {
      await onAddHoliday({ date: hDate, label: hLabel || 'Ngày lễ', recurring: hRecurring })
      appToast.success('Đã thêm ngày lễ chung')
      setHDate('')
      setHLabel('')
      setHRecurring(false)
    } catch (e) {
      appToast.error(e instanceof Error ? e.message : 'Lỗi thêm ngày lễ')
    }
  }

  async function handleRemoveHoliday(id: string) {
    try {
      await onRemoveHoliday(id)
      appToast.success('Đã xóa ngày lễ chung')
    } catch (e) {
      appToast.error(e instanceof Error ? e.message : 'Lỗi xóa ngày lễ')
    }
  }

  function handleAddDayOff() {
    if (!offDate) {
      appToast.warning('Chọn ngày trước khi thêm')
      return
    }
    if (daysOff.includes(offDate)) {
      appToast.info('Ngày này đã có trong danh sách nghỉ riêng')
      return
    }
    onDaysOffChange([...daysOff, offDate].sort())
    appToast.success('Đã thêm ngày nghỉ riêng')
    setOffDate('')
  }

  function handleRemoveDayOff(date: string) {
    onDaysOffChange(daysOff.filter((d) => d !== date))
    appToast.success('Đã bỏ ngày nghỉ riêng')
  }

  return (
    <div className='space-y-8'>
      {/* Ngày lễ chung */}
      <section>
        <h4 className={sectionTitle}>
          <span className='inline-block h-1 w-4 rounded-full bg-rose-500' aria-hidden />
          Ngày lễ chung (toàn app)
        </h4>

        <div className='mb-4 rounded-2xl border border-[var(--notika-border)] bg-[#f8fafb] p-4 dark:bg-[var(--muted)]'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='min-w-0'>
              <SchedDateField
                label='Ngày'
                ariaLabel='Ngày lễ'
                value={hDate || new Date().toISOString().slice(0, 10)}
                onChange={setHDate}
              />
            </div>
            <div className='min-w-0'>
              <label className='mb-2.5 block text-xs font-semibold uppercase tracking-wide text-[var(--notika-green)]'>
                Tên ngày lễ
              </label>
              <input
                type='text'
                className={inputSm}
                value={hLabel}
                onChange={(e) => setHLabel(e.target.value)}
                placeholder='Tết, 30/4, Giỗ tổ…'
              />
            </div>
          </div>
          <div className='mt-3 flex flex-wrap items-center gap-3'>
            <label className='flex cursor-pointer items-center gap-2 rounded-lg py-1 text-sm'>
              <input
                type='checkbox'
                className='size-[1.125rem] shrink-0 rounded border-[var(--notika-border)] accent-[var(--notika-green)] focus:ring-2 focus:ring-[var(--notika-green)]/25'
                checked={hRecurring}
                onChange={(e) => setHRecurring(e.target.checked)}
              />
              <span className='text-sm font-medium text-[var(--notika-text)]'>Lặp hàng năm</span>
            </label>
            <button type='button' className={btnAdd} disabled={holidayBusy} onClick={handleAddHoliday}>
              + Thêm ngày lễ
            </button>
          </div>
        </div>

        {holidays.length > 0 ? (
          <ul className='space-y-1.5'>
            {holidays.map((h) => (
              <li
                key={h.id}
                className='flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-2.5 dark:border-rose-900/40 dark:bg-rose-950/20'
              >
                <span className='inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500 shadow-sm shadow-rose-500/30' />
                <span className='min-w-0 flex-1'>
                  <span className='font-semibold text-rose-900 dark:text-rose-100'>{h.label || 'Ngày lễ'}</span>
                  <span className='ml-2 text-xs text-rose-700/70 dark:text-rose-400/70'>
                    {formatViDate(h.date)}
                    {h.recurring ? ' · lặp hàng năm' : ''}
                  </span>
                </span>
                <button
                  type='button'
                  className='shrink-0 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-bold text-rose-600 shadow-sm transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50'
                  disabled={holidayBusy}
                  onClick={() => handleRemoveHoliday(h.id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className='rounded-xl border border-dashed border-[var(--notika-border)] px-4 py-6 text-center text-sm text-[var(--notika-muted)]'>
            Chưa có ngày lễ chung. Thêm ngày lễ/chủ nhật ở form bên trên.
          </div>
        )}
      </section>

      {/* Ngày nghỉ riêng */}
      <section>
        <h4 className={sectionTitle}>
          <span className='inline-block h-1 w-4 rounded-full bg-amber-500' aria-hidden />
          Ngày nghỉ riêng (bản lịch này)
        </h4>

        <div className='mb-4 rounded-2xl border border-[var(--notika-border)] bg-[#f8fafb] p-4 dark:bg-[var(--muted)]'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
            <div className='min-w-0 flex-1'>
              <SchedDateField
                label='Ngày'
                ariaLabel='Ngày nghỉ riêng'
                value={offDate || new Date().toISOString().slice(0, 10)}
                onChange={setOffDate}
              />
            </div>
            <button type='button' className={cn(btnAdd, 'w-full sm:w-auto')} onClick={handleAddDayOff}>
              + Thêm ngày nghỉ
            </button>
          </div>
        </div>

        {daysOff.length > 0 ? (
          <ul className='flex flex-wrap gap-2'>
            {daysOff.map((d) => (
              <li
                key={d}
                className='group flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 shadow-sm transition hover:border-amber-300 dark:border-amber-800/50 dark:bg-amber-950/25 dark:text-amber-200'
              >
                <span className='inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500' />
                {formatViDate(d)}
                <button
                  type='button'
                  className='ml-0.5 rounded-md px-1 text-base font-bold text-amber-600 transition hover:bg-amber-200 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-800/50 dark:hover:text-amber-100'
                  onClick={() => handleRemoveDayOff(d)}
                  aria-label={`Bỏ ngày nghỉ ${d}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className='rounded-xl border border-dashed border-[var(--notika-border)] px-4 py-6 text-center text-sm text-[var(--notika-muted)]'>
            Chưa có ngày nghỉ riêng. Thêm ở form bên trên hoặc click vào ngày trên lịch tháng.
          </div>
        )}
      </section>
    </div>
  )
}
