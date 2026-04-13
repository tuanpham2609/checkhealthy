/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * TimeField / DateField từ React Aria (Adobe): nhất quán giữa Chrome, Safari, Firefox,
 * hỗ trợ bàn phím & đọc màn hình; không phụ thuộc <input type="time"> native.
 */

'use client'

import { parseDate, Time, today, getLocalTimeZone } from '@internationalized/date'
import type { CalendarDate } from '@internationalized/date'
import { DateField, DateInput, DateSegment, Label, TimeField } from 'react-aria-components'
import { cn } from '@/lib/styles'

function segmentClassName(segment: { isPlaceholder?: boolean }): string {
  return cn(
    'rounded px-0.5 tabular-nums text-foreground outline-none',
    'focus:bg-[color-mix(in_oklch,var(--highlight)_22%,transparent)] focus:text-foreground',
    'dark:focus:bg-[color-mix(in_oklch,var(--highlight)_26%,transparent)]',
    segment.isPlaceholder && 'text-muted-foreground',
  )
}

const labelCls =
  'mb-2.5 block text-xs font-semibold uppercase tracking-wide text-[var(--highlight-strong)] dark:text-[var(--highlight)]'

const dateInputShell = cn(
  'flex min-h-[2.75rem] w-full min-w-0 max-w-full items-center rounded-xl border border-[color-mix(in_oklch,var(--border)_68%,var(--highlight)_32%)] bg-card px-3 py-2.5 text-sm',
  'focus-within:border-[var(--highlight-strong)] focus-within:ring-2 focus-within:ring-[color-mix(in_oklch,var(--highlight)_28%,transparent)] focus-within:ring-offset-2 focus-within:ring-offset-background',
  'dark:border-[color-mix(in_oklch,var(--border)_78%,var(--highlight)_22%)] dark:bg-[color-mix(in_oklch,var(--card)_90%,var(--muted)_10%)] dark:focus-within:border-[var(--highlight)]',
)

/** Giờ: đủ rộng cho HH:MM, không kéo ngang cả khung */
const timeInputShell = cn(
  'flex min-h-[2.75rem] w-full min-w-[7.25rem] max-w-[10.25rem] items-center rounded-xl border border-[color-mix(in_oklch,var(--border)_68%,var(--highlight)_32%)] bg-card px-3 py-2.5 text-sm',
  'focus-within:border-[var(--highlight-strong)] focus-within:ring-2 focus-within:ring-[color-mix(in_oklch,var(--highlight)_28%,transparent)] focus-within:ring-offset-2 focus-within:ring-offset-background',
  'dark:border-[color-mix(in_oklch,var(--border)_78%,var(--highlight)_22%)] dark:bg-[color-mix(in_oklch,var(--card)_90%,var(--muted)_10%)] dark:focus-within:border-[var(--highlight)]',
)

export function SchedTimeField({
  value,
  onChange,
  label,
  ariaLabel,
}: {
  value: number | null
  onChange: (minutes: number | null) => void
  label?: string
  ariaLabel: string
}) {
  const tv = value != null ? new Time(Math.floor(value / 60) % 24, value % 60) : null
  return (
    <div className='w-full min-w-0 max-w-[10.25rem]'>
      <TimeField
        value={tv}
        onChange={(t) => {
          if (!t) {
            onChange(null)
            return
          }
          onChange(t.hour * 60 + t.minute)
        }}
        hourCycle={24}
        aria-label={label ? undefined : ariaLabel}
      >
      {label ? <Label className={labelCls}>{label}</Label> : null}
      <DateInput className={timeInputShell}>
        {(segment) => <DateSegment segment={segment} className={segmentClassName(segment)} />}
      </DateInput>
    </TimeField>
    </div>
  )
}

function calendarFromIso(value: string): CalendarDate {
  const v = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    try {
      return parseDate(v)
    } catch {
      /* fall through */
    }
  }
  return today(getLocalTimeZone())
}

export function SchedDateField({
  value,
  onChange,
  label,
  ariaLabel,
}: {
  value: string
  onChange: (isoYmd: string) => void
  label?: string
  ariaLabel: string
}) {
  const cal = calendarFromIso(value)
  return (
    <div className='w-full min-w-0 max-w-full'>
      <DateField
        value={cal}
        onChange={(d) => {
          if (!d) return
          onChange(d.toString())
        }}
        aria-label={label ? undefined : ariaLabel}
      >
        {label ? <Label className={labelCls}>{label}</Label> : null}
        <DateInput className={dateInputShell}>
          {(segment) => <DateSegment segment={segment} className={segmentClassName(segment)} />}
        </DateInput>
      </DateField>
    </div>
  )
}
