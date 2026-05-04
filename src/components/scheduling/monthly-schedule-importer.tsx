/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { read, utils, type WorkBook } from 'xlsx'
import type { SchedDoctor, SchedTechnician, TechDayHours, TechShift } from '@/lib/scheduling/types'
import { appToast } from '@/lib/app-toast'
import { cn } from '@/lib/styles'

interface MonthlyScheduleImporterProps {
  doctors: SchedDoctor[]
  technicians: SchedTechnician[]
  onApply: (next: { doctors: SchedDoctor[]; technicians: SchedTechnician[] }) => void
}

/** Cac ma ca va gio tuong ung */
interface ShiftMapping {
  shift: TechShift
  hours: TechDayHours | null
}

/** Parse code trong cell -> ca + gio override.
 * Neu code khong nam trong bang map hoac la khoang trang -> tra ve null (khong co entry).
 */
function parseShiftCode(raw: string): ShiftMapping | null {
  const code = raw.trim().toUpperCase().replace(/\s+/g, '')
  if (!code) return null

  const amStart = (h: number, m: number) => h * 60 + m

  switch (code) {
    case 'X':
      return { shift: 'full', hours: { amStartM: amStart(7, 0), amEndM: amStart(11, 30), pmStartM: amStart(13, 0), pmEndM: amStart(20, 0) } }
    case 'HC':
      return { shift: 'full', hours: { amStartM: amStart(7, 0), amEndM: amStart(11, 30), pmStartM: amStart(13, 0), pmEndM: amStart(16, 30) } }
    case 'HC*':
      return { shift: 'full', hours: { amStartM: amStart(7, 0), amEndM: amStart(11, 30), pmStartM: amStart(13, 0), pmEndM: amStart(15, 30) } }
    case 'NG':
      return { shift: 'pm', hours: { pmStartM: amStart(16, 30), pmEndM: amStart(20, 0) } }
    case 'S':
      return { shift: 'am', hours: { amStartM: amStart(7, 0), amEndM: amStart(11, 30) } }
    case 'C':
      return { shift: 'pm', hours: { pmStartM: amStart(13, 0), pmEndM: amStart(20, 0) } }
    case 'N':
    case 'NO':
    case 'NL':
    case 'NV':
    case 'P':
    case 'NTS':
    case 'L':
      return { shift: 'off', hours: null }
    default:
      return null
  }
}

/** Bo dau, chuan hoa ten de so sanh */
function normalizeName(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[()\-.*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Match loose: "BS. PHỐ" -> "pho", "NƯƠNG (máy 1)" -> "nuong may 1" */
function matchesName(target: string, candidate: string): boolean {
  const a = normalizeName(target)
  const b = normalizeName(candidate)
  if (!a || !b) return false
  if (a === b) return true
  // Loai prefix BS
  const aStrip = a.replace(/^bs\.?\s*/i, '').trim()
  const bStrip = b.replace(/^bs\.?\s*/i, '').trim()
  if (aStrip && bStrip && (aStrip === bStrip || aStrip.includes(bStrip) || bStrip.includes(aStrip))) return true
  // So sanh tu dau tien (ho/ten rieng)
  const aFirst = aStrip.split(' ')[0] ?? ''
  const bFirst = bStrip.split(' ')[0] ?? ''
  if (aFirst.length >= 2 && aFirst === bFirst) return true
  return false
}

interface ParsedRow {
  rawName: string
  isDoctor: boolean
  shifts: Record<string, ShiftMapping>
}

interface ParsedSheet {
  name: string
  year: number
  month: number
  dayColumns: Map<number, number>
  rows: ParsedRow[]
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** Parse 1 sheet lich thang dang ma tran.
 * Format mong doi:
 *  - 1 hang tieu de chua "THANG X/YYYY" (de tim thang/nam)
 *  - 1 hang chua cac so ngay (01..31)
 *  - Cac hang sau: col B = ten, col A = STT (rong cho BS, co so cho KTV)
 */
function parseSheet(wb: WorkBook, sheetName: string): ParsedSheet | null {
  const sh = wb.Sheets[sheetName]
  if (!sh) return null
  const rows = utils.sheet_to_json<string[]>(sh, { header: 1, raw: false, defval: '' })
  if (!rows.length) return null

  // Tim thang/nam tu bat ky cell nao
  let year = new Date().getFullYear()
  let month = new Date().getMonth() + 1
  for (const row of rows.slice(0, 5)) {
    for (const cell of row) {
      const text = String(cell ?? '')
      const m = text.match(/TH[ÁA]NG\s*(\d{1,2})[./-](\d{4})/i)
      if (m) {
        month = Number(m[1])
        year = Number(m[2])
        break
      }
      const m2 = text.match(/T(\d{1,2})[./-](\d{4})/i)
      if (m2 && !m) {
        month = Number(m2[1])
        year = Number(m2[2])
      }
    }
  }

  // Tim hang chua cac so ngay 1..31
  let dayRowIdx = -1
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const row = rows[i] ?? []
    let hits = 0
    for (let c = 0; c < row.length; c++) {
      const v = Number(String(row[c] ?? '').trim())
      if (Number.isInteger(v) && v >= 1 && v <= 31) hits++
    }
    if (hits >= 15) {
      dayRowIdx = i
      break
    }
  }
  if (dayRowIdx < 0) return null

  const dayHeader = rows[dayRowIdx] ?? []
  const dayColumns = new Map<number, number>()
  for (let c = 0; c < dayHeader.length; c++) {
    const v = Number(String(dayHeader[c] ?? '').trim())
    if (Number.isInteger(v) && v >= 1 && v <= 31) {
      dayColumns.set(c, v)
    }
  }

  // Du lieu bat dau tu sau hang ngay + hang thu (T2, T3,...)
  const dataStart = dayRowIdx + 2

  const parsedRows: ParsedRow[] = []
  for (let r = dataStart; r < rows.length; r++) {
    const row = rows[r] ?? []
    const colA = String(row[0] ?? '').trim()
    const colB = String(row[1] ?? '').trim()
    if (!colB) continue

    // Dung khi gap dong "Ghi chu"
    if (/ghi\s*ch/i.test(colB)) break

    // BS: colA rong (khong phai so), name bat dau bang "BS"
    // KTV: colA la so (1, 2, 3,...)
    const aNum = Number(colA)
    const isDoctor = (!colA || !Number.isInteger(aNum)) && /^bs/i.test(colB)
    const isTech = Number.isInteger(aNum) && aNum >= 1

    if (!isDoctor && !isTech) continue

    const shifts: Record<string, ShiftMapping> = {}
    for (const [colIdx, day] of dayColumns) {
      const cell = String(row[colIdx] ?? '').trim()
      const parsed = parseShiftCode(cell)
      if (!parsed) continue
      const iso = `${year}-${pad2(month)}-${pad2(day)}`
      shifts[iso] = parsed
    }

    parsedRows.push({ rawName: colB, isDoctor, shifts })
  }

  return { name: sheetName, year, month, dayColumns, rows: parsedRows }
}

interface MatchResult {
  parsedName: string
  isDoctor: boolean
  shiftCount: number
  matchedCode?: string
  matchedName?: string
  willCreate: boolean
}

export function MonthlyScheduleImporter({ doctors, technicians, onApply }: MonthlyScheduleImporterProps) {
  const [sheets, setSheets] = useState<ParsedSheet[]>([])
  const [autoCreateMissing, setAutoCreateMissing] = useState(true)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setBusy(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = read(buf, { type: 'array' })
      const parsed: ParsedSheet[] = []
      for (const name of wb.SheetNames) {
        const s = parseSheet(wb, name)
        if (s && s.rows.length > 0) parsed.push(s)
      }
      if (!parsed.length) {
        appToast.warning('Không tìm thấy sheet nào có định dạng lịch tháng hợp lệ')
        setSheets([])
        return
      }
      setSheets(parsed)
      appToast.success(`Đã đọc ${parsed.length} sheet`)
    } catch (e) {
      appToast.error(e instanceof Error ? e.message : 'Lỗi đọc file')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [])

  const matches: MatchResult[] = useMemo(() => {
    const out: MatchResult[] = []
    for (const sheet of sheets) {
      for (const row of sheet.rows) {
        const shiftCount = Object.keys(row.shifts).length
        if (row.isDoctor) {
          const found = doctors.find((d) => matchesName(row.rawName, d.name) || matchesName(row.rawName, d.code))
          out.push({
            parsedName: row.rawName,
            isDoctor: true,
            shiftCount,
            matchedCode: found?.code,
            matchedName: found?.name,
            willCreate: !found && autoCreateMissing,
          })
        } else {
          const found = technicians.find((t) => matchesName(row.rawName, t.name) || matchesName(row.rawName, t.code))
          out.push({
            parsedName: row.rawName,
            isDoctor: false,
            shiftCount,
            matchedCode: found?.code,
            matchedName: found?.name,
            willCreate: !found && autoCreateMissing,
          })
        }
      }
    }
    return out
  }, [sheets, doctors, technicians, autoCreateMissing])

  const summary = useMemo(() => {
    const doctorCount = matches.filter((m) => m.isDoctor).length
    const techCount = matches.length - doctorCount
    const matchedCount = matches.filter((m) => m.matchedCode).length
    const createCount = matches.filter((m) => m.willCreate).length
    const skipCount = matches.filter((m) => !m.matchedCode && !m.willCreate).length
    return { doctorCount, techCount, matchedCount, createCount, skipCount, total: matches.length }
  }, [matches])

  const applyImport = useCallback(() => {
    if (!sheets.length) return

    const docsMap = new Map(doctors.map((d) => [d.code.toLowerCase(), { ...d }]))
    const techsMap = new Map(technicians.map((t) => [t.code.toLowerCase(), { ...t }]))

    let createdDocs = 0
    let createdTechs = 0
    let updated = 0

    const newCode = (existing: Map<string, unknown>, prefix: string): string => {
      let i = existing.size + 1
      while (existing.has(`${prefix}${i}`.toLowerCase())) i++
      return `${prefix}${i}`
    }

    for (const sheet of sheets) {
      for (const row of sheet.rows) {
        if (!Object.keys(row.shifts).length) continue

        if (row.isDoctor) {
          let doc = doctors.find((d) => matchesName(row.rawName, d.name) || matchesName(row.rawName, d.code))
          if (!doc) {
            if (!autoCreateMissing) continue
            const code = newCode(docsMap, 'BS')
            doc = {
              id: crypto.randomUUID(),
              code,
              name: row.rawName,
              amStartM: 7 * 60,
              amEndM: 11 * 60 + 30,
              pmStartM: 13 * 60,
              pmEndM: 17 * 60,
              busy: [],
            }
            docsMap.set(code.toLowerCase(), doc)
            createdDocs++
          } else {
            doc = docsMap.get(doc.code.toLowerCase()) ?? { ...doc }
          }
          const monthlyShifts = { ...(doc.monthlyShifts ?? {}) }
          const dayHours: Record<string, TechDayHours> = { ...(doc.dayHours ?? {}) }
          for (const [iso, map] of Object.entries(row.shifts)) {
            if (map.shift === 'full') {
              delete monthlyShifts[iso]
            } else {
              monthlyShifts[iso] = map.shift
            }
            if (map.shift === 'off' || !map.hours) {
              delete dayHours[iso]
            } else {
              const diff =
                map.hours.amStartM !== (doc.amStartM ?? null) ||
                map.hours.amEndM !== (doc.amEndM ?? null) ||
                map.hours.pmStartM !== (doc.pmStartM ?? null) ||
                map.hours.pmEndM !== (doc.pmEndM ?? null)
              if (diff) dayHours[iso] = map.hours
              else delete dayHours[iso]
            }
          }
          doc.monthlyShifts = Object.keys(monthlyShifts).length > 0 ? monthlyShifts : undefined
          doc.dayHours = Object.keys(dayHours).length > 0 ? dayHours : undefined
          docsMap.set(doc.code.toLowerCase(), doc)
          updated++
        } else {
          let tech = technicians.find((t) => matchesName(row.rawName, t.name) || matchesName(row.rawName, t.code))
          if (!tech) {
            if (!autoCreateMissing) continue
            const code = newCode(techsMap, 'K')
            tech = {
              id: crypto.randomUUID(),
              code,
              name: row.rawName,
              amStartM: 7 * 60,
              amEndM: 11 * 60 + 30,
              pmStartM: 13 * 60,
              pmEndM: 17 * 60,
              monthlyShifts: {},
              busy: [],
            }
            techsMap.set(code.toLowerCase(), tech)
            createdTechs++
          } else {
            tech = techsMap.get(tech.code.toLowerCase()) ?? { ...tech, monthlyShifts: { ...tech.monthlyShifts } }
          }
          const monthlyShifts = { ...(tech.monthlyShifts ?? {}) }
          const dayHours: Record<string, TechDayHours> = { ...(tech.dayHours ?? {}) }
          for (const [iso, map] of Object.entries(row.shifts)) {
            if (map.shift === 'full') {
              delete monthlyShifts[iso]
            } else {
              monthlyShifts[iso] = map.shift
            }
            if (map.shift === 'off' || !map.hours) {
              delete dayHours[iso]
            } else {
              const diff =
                map.hours.amStartM !== (tech.amStartM ?? null) ||
                map.hours.amEndM !== (tech.amEndM ?? null) ||
                map.hours.pmStartM !== (tech.pmStartM ?? null) ||
                map.hours.pmEndM !== (tech.pmEndM ?? null)
              if (diff) dayHours[iso] = map.hours
              else delete dayHours[iso]
            }
          }
          tech.monthlyShifts = monthlyShifts
          tech.dayHours = Object.keys(dayHours).length > 0 ? dayHours : undefined
          techsMap.set(tech.code.toLowerCase(), tech)
          updated++
        }
      }
    }

    onApply({
      doctors: Array.from(docsMap.values()),
      technicians: Array.from(techsMap.values()),
    })

    appToast.success(
      `Đã áp dụng lịch: cập nhật ${updated} người` +
        (createdDocs > 0 ? ` · tạo ${createdDocs} BS mới` : '') +
        (createdTechs > 0 ? ` · tạo ${createdTechs} KTV mới` : ''),
    )
    setSheets([])
  }, [sheets, doctors, technicians, autoCreateMissing, onApply])

  const cardCls = 'rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-4'

  return (
    <div className={cn(cardCls, 'space-y-4')}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h3 className='text-base font-bold text-[var(--notika-text)]'>Import lịch tháng (BS + KTV)</h3>
          <p className='mt-1 text-xs text-[var(--notika-muted)]'>
            Import file Excel dạng ma trận (mỗi hàng = 1 người, mỗi cột = 1 ngày).
            Nhận diện các mã: X · HC · HC* · NG · S · C · N · NO · NL · NV · P · NTS · L
          </p>
        </div>

        <label className={cn(
          'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--notika-green)] bg-[var(--notika-green)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition',
          'hover:bg-[var(--notika-green)]/90 active:scale-[0.98]',
          busy && 'cursor-not-allowed opacity-60',
        )}>
          <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
            <path d='M7 1v9M3 6l4 4 4-4M2 13h10' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
          {busy ? 'Đang đọc…' : 'Chọn file .xlsx'}
          <input
            ref={inputRef}
            type='file'
            accept='.xlsx,.xls'
            className='hidden'
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleFile(f)
            }}
          />
        </label>
      </div>

      {sheets.length > 0 && (
        <div className='space-y-3'>
          <div className='rounded-xl border border-[var(--notika-border)] bg-[var(--notika-content)] p-3'>
            <div className='grid grid-cols-2 gap-3 text-sm sm:grid-cols-5'>
              <Stat label='Sheet' value={sheets.length} />
              <Stat label='BS' value={summary.doctorCount} />
              <Stat label='KTV' value={summary.techCount} />
              <Stat label='Đã khớp' value={summary.matchedCount} color='text-emerald-600' />
              <Stat label='Sẽ tạo mới' value={summary.createCount} color='text-indigo-600' />
            </div>
            {summary.skipCount > 0 && (
              <p className='mt-2 text-xs text-amber-600'>
                ⚠ Có {summary.skipCount} người không khớp và sẽ bị bỏ qua (tắt &quot;tự tạo mới&quot;)
              </p>
            )}
          </div>

          <label className='flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1 text-sm'>
            <input
              type='checkbox'
              className='size-[1.125rem] rounded border-[var(--notika-border)] accent-[var(--notika-green)]'
              checked={autoCreateMissing}
              onChange={(e) => setAutoCreateMissing(e.target.checked)}
            />
            <span className='text-[var(--notika-text)]'>
              Tự động tạo mới BS/KTV nếu không khớp với danh sách hiện tại
            </span>
          </label>

          <div className='max-h-80 overflow-auto rounded-xl border border-[var(--notika-border)]'>
            <table className='w-full text-xs'>
              <thead className='sticky top-0 bg-[var(--notika-content)] text-left'>
                <tr className='text-[var(--notika-muted)]'>
                  <th className='px-3 py-2 font-semibold'>Loại</th>
                  <th className='px-3 py-2 font-semibold'>Tên trong file</th>
                  <th className='px-3 py-2 font-semibold'>Khớp với</th>
                  <th className='px-3 py-2 font-semibold text-center'>Số ngày</th>
                  <th className='px-3 py-2 font-semibold'>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m, i) => (
                  <tr key={i} className='border-t border-[var(--notika-border)]/60'>
                    <td className='px-3 py-2'>
                      <span className={cn(
                        'rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase',
                        m.isDoctor
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
                      )}>
                        {m.isDoctor ? 'BS' : 'KTV'}
                      </span>
                    </td>
                    <td className='px-3 py-2 font-medium text-[var(--notika-text)]'>{m.parsedName}</td>
                    <td className='px-3 py-2'>
                      {m.matchedCode ? (
                        <span className='text-emerald-600'>
                          <b>{m.matchedCode}</b> · {m.matchedName}
                        </span>
                      ) : m.willCreate ? (
                        <span className='text-indigo-600'>Sẽ tạo mới</span>
                      ) : (
                        <span className='text-amber-600'>Không khớp — bỏ qua</span>
                      )}
                    </td>
                    <td className='px-3 py-2 text-center tabular-nums'>{m.shiftCount}</td>
                    <td className='px-3 py-2 text-[var(--notika-muted)]'>
                      {m.shiftCount > 0 ? 'Ghi đè lịch tháng' : 'Không có ca — bỏ qua'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='flex flex-wrap justify-end gap-2'>
            <button
              type='button'
              onClick={() => setSheets([])}
              className='rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2 text-sm font-semibold text-[var(--notika-muted)] hover:bg-[var(--muted)]'
            >
              Huỷ
            </button>
            <button
              type='button'
              onClick={applyImport}
              className='rounded-xl border border-[var(--notika-green)] bg-[var(--notika-green)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--notika-green)]/90 active:scale-[0.98]'
            >
              Áp dụng vào bản lịch
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className='rounded-lg bg-[var(--notika-card)] px-3 py-2'>
      <div className='text-[10px] font-bold uppercase tracking-wide text-[var(--notika-muted)]'>{label}</div>
      <div className={cn('text-lg font-bold tabular-nums text-[var(--notika-text)]', color)}>{value}</div>
    </div>
  )
}
