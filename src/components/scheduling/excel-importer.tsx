/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useCallback, useRef, useState } from 'react'
import { read, utils, type WorkBook } from 'xlsx'
import { appToast } from '@/lib/app-toast'
import { cn } from '@/lib/styles'

type ImportType = 'doctors' | 'technicians' | 'machines' | 'procedures'

interface ExcelImporterProps {
  type: ImportType
  onImported?: () => void
  /**
   * Neu cung cap, nut "Import" se goi callback nay voi danh sach rows da parse
   * thay vi POST len API `/api/scheduling/shared/...`.
   * Dung khi muon them thang vao context hien tai (bo qua bang shared).
   */
  onDirectItems?: (items: Record<string, unknown>[]) => Promise<number> | number
}

const COLUMN_MAPS: Record<ImportType, { key: string; label: string; aliases: string[] }[]> = {
  doctors: [
    { key: 'code', label: 'Mã BS', aliases: ['mã bs', 'ma bs', 'code', 'mã', 'ma'] },
    { key: 'name', label: 'Tên BS', aliases: ['tên bs', 'ten bs', 'name', 'tên', 'ten', 'họ tên', 'ho ten'] },
    { key: 'amStart', label: 'Ca sáng BĐ', aliases: ['ca sáng bắt đầu', 'ca sang bat dau', 'am start', 'amstart', 'sáng bđ', 'sang bd'] },
    { key: 'amEnd', label: 'Ca sáng KT', aliases: ['ca sáng kết thúc', 'ca sang ket thuc', 'am end', 'amend', 'sáng kt', 'sang kt'] },
    { key: 'pmStart', label: 'Ca chiều BĐ', aliases: ['ca chiều bắt đầu', 'ca chieu bat dau', 'pm start', 'pmstart', 'chiều bđ', 'chieu bd'] },
    { key: 'pmEnd', label: 'Ca chiều KT', aliases: ['ca chiều kết thúc', 'ca chieu ket thuc', 'pm end', 'pmend', 'chiều kt', 'chieu kt'] },
  ],
  technicians: [
    { key: 'code', label: 'Mã KTV', aliases: ['mã ktv', 'ma ktv', 'code', 'mã', 'ma'] },
    { key: 'name', label: 'Tên KTV', aliases: ['tên ktv', 'ten ktv', 'name', 'tên', 'ten', 'họ tên', 'ho ten'] },
    { key: 'amStart', label: 'Ca sáng BĐ', aliases: ['ca sáng bắt đầu', 'ca sang bat dau', 'am start', 'amstart', 'sáng bđ', 'sang bd'] },
    { key: 'amEnd', label: 'Ca sáng KT', aliases: ['ca sáng kết thúc', 'ca sang ket thuc', 'am end', 'amend', 'sáng kt', 'sang kt'] },
    { key: 'pmStart', label: 'Ca chiều BĐ', aliases: ['ca chiều bắt đầu', 'ca chieu bat dau', 'pm start', 'pmstart', 'chiều bđ', 'chieu bd'] },
    { key: 'pmEnd', label: 'Ca chiều KT', aliases: ['ca chiều kết thúc', 'ca chieu ket thuc', 'pm end', 'pmend', 'chiều kt', 'chieu kt'] },
  ],
  machines: [
    { key: 'typeName', label: 'Loại máy', aliases: ['loại máy', 'loai may', 'type', 'typename', 'type_name', 'loại'] },
    { key: 'unitName', label: 'Tên máy', aliases: ['tên máy', 'ten may', 'unit', 'unitname', 'unit_name', 'đơn vị', 'don vi'] },
  ],
  procedures: [
    { key: 'name', label: 'Tên thủ thuật', aliases: ['tên', 'ten', 'name', 'tên thủ thuật', 'ten thu thuat', 'dịch vụ', 'dich vu', 'kỹ thuật', 'ky thuat'] },
    { key: 'durationM', label: 'Thời gian (phút)', aliases: ['thời gian', 'thoi gian', 'duration', 'phút', 'phut', 'thời gian thực hiện'] },
    { key: 'pillowM', label: 'TG BS có mặt', aliases: ['tg bs', 'pillow', 'bs có mặt', 'bs co mat', 'thời gian bs'] },
    { key: 'mainCodes', label: 'Mã BS chính', aliases: ['mã bs chính', 'ma bs chinh', 'main codes', 'bs chính', 'bs chinh'] },
    { key: 'substituteCodes', label: 'BS thay thế', aliases: ['bs thay thế', 'bs thay the', 'substitute', 'thay thế', 'thay the'] },
    { key: 'machineType', label: 'Loại máy', aliases: ['loại máy', 'loai may', 'machine type', 'machinetype', 'máy'] },
    { key: 'priority', label: 'Ưu tiên', aliases: ['ưu tiên', 'uu tien', 'priority'] },
  ],
}

const TYPE_LABELS: Record<ImportType, string> = {
  doctors: 'Bác sĩ',
  technicians: 'Kỹ thuật viên',
  machines: 'Máy',
  procedures: 'Dịch vụ kỹ thuật',
}

function matchColumn(header: string, aliases: string[]): boolean {
  const h = header.toLowerCase().trim()
  return aliases.some((a) => h.includes(a))
}

function parseRows(wb: WorkBook, type: ImportType): Record<string, unknown>[] {
  const ws = wb.Sheets[wb.SheetNames[0]!]
  if (!ws) return []
  const raw = utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
  if (raw.length === 0) return []

  const colMap = COLUMN_MAPS[type]
  const headers = Object.keys(raw[0]!)
  const mapping: Record<string, string> = {}

  for (const col of colMap) {
    const match = headers.find((h) => matchColumn(h, col.aliases))
    if (match) mapping[col.key] = match
  }

  return raw.map((row) => {
    const out: Record<string, unknown> = {}
    for (const col of colMap) {
      const srcKey = mapping[col.key]
      let val: unknown = srcKey ? row[srcKey] : ''
      if (col.key === 'durationM' || col.key === 'pillowM') {
        if (typeof val === 'number' && Number.isFinite(val)) {
          // keep as number
        } else {
          const n = Number(String(val).replace(/[^\d.-]/g, ''))
          val = Number.isFinite(n) && n > 0 ? n : null
        }
      }
      if (col.key === 'priority') {
        const s = String(val).toLowerCase().trim()
        val = val === true || val === 1 || s === 'x' || s === 'true' || s === '1' || s === 'có' || s === 'co' || s === 'yes'
      }
      out[col.key] = val
    }
    return out
  }).filter((r) => {
    if (type === 'doctors' || type === 'technicians') return r.code && r.name
    if (type === 'machines') return r.typeName && r.unitName
    return r.name
  })
}

const inputCls = cn(
  'min-h-[2.75rem] w-full rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2 text-sm text-[var(--notika-text)] outline-none transition',
  'file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--notika-green-soft)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--notika-green)]',
  'focus:border-[var(--notika-green)] focus:ring-2 focus:ring-[var(--notika-green)]/20',
)

const btnPrimary = cn(
  'min-h-[2.5rem] rounded-xl border border-[var(--notika-green)]/30 bg-[var(--notika-green)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition',
  'hover:bg-[var(--notika-green)]/90 disabled:opacity-50',
)

const btnSecondary = cn(
  'min-h-[2.5rem] rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-4 py-1.5 text-sm font-medium text-[var(--notika-text)] shadow-sm transition',
  'hover:bg-[var(--muted)] disabled:opacity-50',
)

export function ExcelImporter({ type, onImported, onDirectItems }: ExcelImporterProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null)
  const [importing, setImporting] = useState(false)

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const buf = await file.arrayBuffer()
      const wb = read(buf, { type: 'array' })
      const rows = parseRows(wb, type)
      if (rows.length === 0) {
        appToast.warning('Không tìm thấy dữ liệu hợp lệ. Kiểm tra lại header cột.')
        return
      }
      setPreview(rows)
      appToast.info(`Tìm thấy ${rows.length} dòng — xem preview bên dưới`)
    } catch (err) {
      appToast.error('Lỗi đọc file Excel: ' + (err instanceof Error ? err.message : String(err)))
    }
  }, [type])

  const handleImport = useCallback(async () => {
    if (!preview?.length) return
    setImporting(true)
    try {
      if (onDirectItems) {
        const count = await onDirectItems(preview)
        appToast.success(`Đã thêm ${count} ${TYPE_LABELS[type]}`)
      } else {
        const res = await fetch(`/api/scheduling/shared/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: preview }),
        })
        if (!res.ok) {
          const d = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(d.error ?? 'Lỗi import')
        }
        const data = (await res.json()) as { imported: number }
        appToast.success(`Đã import ${data.imported} ${TYPE_LABELS[type]}`)
      }
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      onImported?.()
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : 'Lỗi import')
    } finally {
      setImporting(false)
    }
  }, [preview, type, onImported, onDirectItems])

  const handleCancel = useCallback(() => {
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }, [])

  const colMap = COLUMN_MAPS[type]

  return (
    <div className='space-y-4'>
      <div className='rounded-2xl border border-dashed border-[var(--notika-green)]/40 bg-[var(--notika-green-soft)]/30 p-4'>
        <p className='mb-2 text-xs font-semibold text-[var(--notika-green)]'>
          Import {TYPE_LABELS[type]} từ Excel
        </p>
        <input
          ref={fileRef}
          type='file'
          accept='.xlsx,.xls,.csv'
          className={inputCls}
          onChange={(e) => void handleFile(e)}
        />
        <p className='mt-2 text-[11px] text-[var(--notika-muted)]'>
          Cột mong đợi: {colMap.map((c) => c.label).join(' | ')}
        </p>
      </div>

      {preview && preview.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-semibold text-[var(--notika-text)]'>
              Preview: {preview.length} dòng
            </p>
            <div className='flex gap-2'>
              <button type='button' className={btnPrimary} disabled={importing} onClick={() => void handleImport()}>
                {importing ? 'Đang import...' : `Import ${preview.length} dòng`}
              </button>
              <button type='button' className={btnSecondary} onClick={handleCancel}>
                Hủy
              </button>
            </div>
          </div>

          <div className='max-h-[20rem] overflow-auto rounded-xl border border-[var(--notika-border)] shadow-sm'>
            <table className='w-full text-xs'>
              <thead>
                <tr className='sticky top-0 border-b border-[var(--notika-border)] bg-[#f3f5f7] dark:bg-[var(--muted)]'>
                  <th className='px-3 py-2 text-left font-semibold text-[var(--notika-muted)]'>#</th>
                  {colMap.map((c) => (
                    <th key={c.key} className='px-3 py-2 text-left font-semibold text-[var(--notika-muted)]'>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 50).map((row, i) => (
                  <tr key={i} className='border-b border-[var(--notika-border)]/30 bg-[var(--notika-card)]'>
                    <td className='px-3 py-1.5 text-[var(--notika-muted)]'>{i + 1}</td>
                    {colMap.map((c) => (
                      <td key={c.key} className='px-3 py-1.5 text-[var(--notika-text)]'>
                        {String(row[c.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 50 && (
              <p className='px-3 py-2 text-center text-xs text-[var(--notika-muted)]'>
                ...và {preview.length - 50} dòng nữa
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
