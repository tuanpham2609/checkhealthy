/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * Select tùy chỉnh (React Aria) — đồng bộ UI với các field Notika, không dùng <select> native.
 */

'use client'

import { useContext } from 'react'
import {
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectStateContext,
  SelectValue,
} from 'react-aria-components'
import { cn } from '@/lib/styles'

export interface NotikaSelectOption {
  id: string
  label: string
}

export interface NotikaSelectProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  options: NotikaSelectOption[]
  disabled?: boolean
  'aria-label'?: string
}

const triggerCls = cn(
  'flex min-h-[2.75rem] w-full min-w-0 cursor-default items-center justify-between gap-2 rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2.5 text-left text-sm text-[var(--notika-text)]',
  'outline-none transition-[border-color,box-shadow,background-color]',
  'data-[focus-visible]:border-[var(--notika-green)] data-[focus-visible]:ring-2 data-[focus-visible]:ring-[var(--notika-green)]/20 data-[focus-visible]:ring-offset-1 data-[focus-visible]:ring-offset-[var(--notika-content)]',
  'data-[open]:border-[var(--notika-green)] data-[open]:shadow-sm',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  'dark:border-[var(--notika-border)] dark:bg-[var(--notika-card)]',
)

const popoverCls = cn(
  'w-[var(--trigger-width)] max-w-[min(100vw-1.5rem,var(--trigger-width))] overflow-hidden rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-1 shadow-lg',
  'dark:border-[var(--notika-border)] dark:bg-[var(--notika-card)] dark:shadow-black/30',
)

const listBoxCls = 'max-h-60 min-w-0 overflow-y-auto overflow-x-hidden py-0.5 outline-none'

const itemCls = cn(
  'mx-0.5 cursor-default rounded-lg px-3 py-2.5 text-sm text-[var(--notika-text)] outline-none transition-colors',
  'data-[focused]:bg-[var(--notika-green-soft)] data-[focused]:text-[var(--notika-text)]',
  'data-[selected]:bg-[var(--notika-green)] data-[selected]:font-semibold data-[selected]:text-white',
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-40',
)

function ChevronDown({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-[var(--notika-muted)] transition-transform duration-200',
        open && 'rotate-180 text-[var(--notika-green)]',
      )}
      aria-hidden
    >
      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M6 9l6 6 6-6' />
      </svg>
    </span>
  )
}

function SelectTriggerChevron() {
  const state = useContext(SelectStateContext)
  return <ChevronDown open={Boolean(state?.isOpen)} />
}

export function NotikaSelect({
  placeholder,
  value,
  onChange,
  options,
  disabled,
  'aria-label': ariaLabel,
}: NotikaSelectProps) {
  const validIds = new Set(options.map((o) => o.id))
  const selectedKey = value && validIds.has(value) ? value : null

  return (
    <Select
      placeholder={placeholder}
      selectedKey={selectedKey}
      onSelectionChange={(k) => {
        if (k == null) onChange('')
        else onChange(String(k))
      }}
      isDisabled={disabled}
      aria-label={ariaLabel}
      className='w-full min-w-0'
    >
      <Button className={triggerCls}>
        <SelectValue
          className={cn(
            'min-w-0 flex-1 truncate font-normal',
            'data-[placeholder]:text-[var(--notika-muted)]',
          )}
        />
        <SelectTriggerChevron />
      </Button>
      <Popover
        className={popoverCls}
        placement='bottom start'
        offset={6}
        shouldFlip
      >
        <ListBox className={listBoxCls} selectionMode='single' items={options}>
          {(item) => (
            <ListBoxItem id={item.id} textValue={item.label} className={itemCls}>
              {item.label}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  )
}
