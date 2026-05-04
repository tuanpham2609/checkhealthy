/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
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

/**
 * Tim header row trong sheet bang cach quet 20 dong dau, dong nao co >=2 cell match
 * voi aliases cua loai du lieu thi coi la header. Tra ve { startRow, headers } hoac null.
 */
function detectHeaderRow(
  rows: unknown[][],
  colMap: { key: string; aliases: string[] }[],
): { startRow: number; headers: string[] } | null {
  const limit = Math.min(rows.length, 20)
  for (let i = 0; i < limit; i++) {
    const row = rows[i] ?? []
    const cells = row.map((c) => String(c ?? '').trim()).filter((c) => c.length > 0)
    if (cells.length < 2) continue
    let matchCount = 0
    for (const col of colMap) {
      if (cells.some((cell) => matchColumn(cell, col.aliases))) matchCount++
    }
    if (matchCount >= 2) {
      return { startRow: i, headers: row.map((c) => String(c ?? '').trim()) }
    }
  }
  return null
}

/**
 * Quet tat ca cac sheet trong workbook va tra ve sheet co header row khop nhat
 * voi loai du lieu can import. Vi du file may moc co 3 sheet thi se chon dung
 * sheet "May moc" thay vi sheet bang gia dich vu.
 */
function pickBestSheet(
  wb: WorkBook,
  type: ImportType,
): { sheetName: string; startRow: number; headers: string[]; rows: unknown[][] } | null {
  const colMap = COLUMN_MAPS[type]
  let best: { sheetName: string; startRow: number; headers: string[]; rows: unknown[][]; score: number } | null = null

  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name]
    if (!ws) continue
    const rows = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })
    if (!rows.length) continue
    const detected = detectHeaderRow(rows, colMap)
    if (!detected) continue
    let score = 0
    for (const col of colMap) {
      if (detected.headers.some((h) => matchColumn(h, col.aliases))) score++
    }
    if (!best || score > best.score) {
      best = { sheetName: name, ...detected, rows, score }
    }
  }

  if (!best) return null
  return {
    sheetName: best.sheetName,
    startRow: best.startRow,
    headers: best.headers,
    rows: best.rows,
  }
}

function parseRows(wb: WorkBook, type: ImportType): { rows: Record<string, unknown>[]; sheetName: string | null } {
  const detected = pickBestSheet(wb, type)
  if (!detected) return { rows: [], sheetName: null }

  const colMap = COLUMN_MAPS[type]
  const { headers, rows: allRows, startRow, sheetName } = detected

  // Build mapping key -> column index (dung index thay vi ten cot vi co the trung ten/ rong)
  const indexMap: Record<string, number> = {}
  for (const col of colMap) {
    const idx = headers.findIndex((h) => matchColumn(h, col.aliases))
    if (idx >= 0) indexMap[col.key] = idx
  }

  const dataRows = allRows.slice(startRow + 1)
  const parsed = dataRows.map((row) => {
    const out: Record<string, unknown> = {}
    for (const col of colMap) {
      const idx = indexMap[col.key]
      let val: unknown = idx != null && idx >= 0 ? row[idx] : ''
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
    if (type === 'doctors' || type === 'technicians') return String(r.code ?? '').trim() && String(r.name ?? '').trim()
    if (type === 'machines') return String(r.typeName ?? '').trim() && String(r.unitName ?? '').trim()
    return String(r.name ?? '').trim()
  })

  return { rows: parsed, sheetName }
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
  const [detectedSheet, setDetectedSheet] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const buf = await file.arrayBuffer()
      const wb = read(buf, { type: 'array' })
      const { rows, sheetName } = parseRows(wb, type)
      if (rows.length === 0) {
        appToast.warning(
          `Không tìm thấy dữ liệu hợp lệ${
            wb.SheetNames.length > 1 ? ` (đã quét ${wb.SheetNames.length} sheet)` : ''
          }. Kiểm tra header cột: ${COLUMN_MAPS[type].map((c) => c.label).join(' | ')}`,
        )
        return
      }
      setPreview(rows)
      setDetectedSheet(sheetName)
      appToast.info(
        sheetName
          ? `Sheet "${sheetName}": tìm thấy ${rows.length} dòng — xem preview bên dưới`
          : `Tìm thấy ${rows.length} dòng — xem preview bên dưới`,
      )
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
      setDetectedSheet(null)
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
    setDetectedSheet(null)
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
              {detectedSheet ? (
                <span className='ml-2 rounded-md bg-[var(--notika-green-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--notika-green)]'>
                  Sheet: {detectedSheet}
                </span>
              ) : null}
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
