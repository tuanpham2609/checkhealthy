/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { SchedDateField, SchedTimeField } from '@/components/scheduling/sched-aria-fields'
import { MonthCalendar } from '@/components/scheduling/month-calendar'
import { DaysOffManager } from '@/components/scheduling/days-off-manager'
import { buildAssignmentsCsv } from '@/lib/scheduling/csv-export'
import type {
  SchedAssignment,
  SchedContextPayload,
  SchedDoctor,
  SchedMachine,
  SchedPatient,
  SchedProcedure,
  SchedTechnician,
  SharedDoctor,
  SharedMachine,
  SharedProcedure,
  SharedTechnician,
  TimeWindowM,
} from '@/lib/scheduling/types'
import { minutesToLabel, parseTimeToMinutes } from '@/lib/scheduling/time'
import {
  buildDoctorDaySlices,
  buildMachineDaySlices,
  buildProcedureStats,
  estimateExtraSlots,
} from '@/lib/scheduling/stats'
import { inferDayBounds } from '@/lib/scheduling/engine'
import { validateMastersForSchedule } from '@/lib/scheduling/validate-masters'
import { appToast } from '@/lib/app-toast'
import { cn } from '@/lib/styles'
import { useQueryClient } from '@tanstack/react-query'
import { useScheduling } from '@/hooks/use-scheduling'
import { useHolidays } from '@/hooks/use-holidays'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useRouter } from 'next/navigation'
import { APP_DOCUMENT_TITLE } from '@/constants/app-document.constants'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserManager } from '@/components/scheduling/user-manager'
import { ExcelImporter } from '@/components/scheduling/excel-importer'
import { ConflictPanel } from '@/components/scheduling/conflict-panel'
import { ProcedureTimer } from '@/components/scheduling/procedure-timer'
import { NotikaSelect } from '@/components/scheduling/notika-select'
import { TechniciansEditor } from '@/components/scheduling/technicians-editor'

type MainTab = 'calendar' | 'doctors' | 'technicians' | 'machines' | 'procedures' | 'patients' | 'output' | 'users'

type OutputTab = 'results' | 'unsorted' | 'stats' | 'docTime' | 'machTime' | 'gantt' | 'estimate' | 'timer'

const BASE_NAV: { id: MainTab; label: string }[] = [
  { id: 'calendar', label: 'Lịch tháng' },
  { id: 'doctors', label: 'Bác sĩ' },
  { id: 'technicians', label: 'Kỹ thuật viên' },
  { id: 'machines', label: 'Máy' },
  { id: 'procedures', label: 'Thủ thuật' },
  { id: 'patients', label: 'Bệnh nhân' },
  { id: 'output', label: 'Kết quả & báo cáo' },
]

/** Ô bảng: gọn trên mobile, rộng dần từ sm */
const tableCell = 'px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3'

function newId(): string {
  return crypto.randomUUID()
}

export function SchedulingApp() {
  const sched = useScheduling()
  const {
    contextList,
    contextId,
    payload,
    setPayload,
    busy,
    error,
    clearErrors,
    bootstrapping,
    loadContext,
    refreshList,
    persistDaysOff,
    persistAssignments,
  } = sched

  const router = useRouter()
  const queryClient = useQueryClient()
  const hol = useHolidays()
  const { isSuperAdmin } = useCurrentUser()

  const MAIN_NAV = useMemo(() => {
    const nav = [...BASE_NAV]
    if (isSuperAdmin) nav.push({ id: 'users', label: 'Tài khoản' })
    return nav
  }, [isSuperAdmin])

  const [mainTab, setMainTab] = useState<MainTab>('calendar')
  const [outputTab, setOutputTab] = useState<OutputTab>('results')
  const [sessionPickerOpen, setSessionPickerOpen] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const viewMonthFromDate = payload?.schedulingDate
    ? payload.schedulingDate.slice(0, 7)
    : new Date().toISOString().slice(0, 7)
  const [viewMonth, setViewMonth] = useState(viewMonthFromDate)

  useEffect(() => {
    if (payload?.schedulingDate) {
      setViewMonth(payload.schedulingDate.slice(0, 7))
    }
  }, [payload?.schedulingDate])

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    queryClient.clear()
    try { localStorage.removeItem('sched-timer-state') } catch { /* noop */ }
    appToast.success('Đã đăng xuất')
    router.replace('/login')
  }, [router, queryClient])

  const feedbackMsg = localError ?? error

  useEffect(() => {
    if (!feedbackMsg) {
      appToast.dismiss('scheduling-error')
      return
    }
    appToast.error(feedbackMsg, { id: 'scheduling-error' })
  }, [feedbackMsg])

  const handleSave = useCallback(async () => {
    clearErrors()
    setLocalError(null)
    try {
      await sched.saveContext()
      appToast.success('Đã lưu bản lịch lên máy chủ')
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Lỗi lưu')
    }
  }, [sched, clearErrors])

  const handleRun = useCallback(
    async (mode: 'full' | 'preserve') => {
      if (!contextId || !payload) return
      const validationErrors = validateMastersForSchedule(payload.masters)
      if (validationErrors.length > 0) {
        setLocalError(validationErrors.join(' · '))
        return
      }
      clearErrors()
      setLocalError(null)
      try {
        await sched.saveContext()
        const data = await sched.runSchedule(mode)
        appToast.success(
          data.unscheduled.length > 0
            ? `Đã xếp lịch — còn ${data.unscheduled.length} ca chưa xếp`
            : 'Đã xếp lịch xong',
        )
        if (data.context.settings.autoSaveAfterSchedule) {
          const ok = window.confirm('Đã xếp lịch xong. Bạn có muốn lưu thêm một bản lịch mới (bản sao) không?')
          if (ok) {
            const name = window.prompt('Đặt tên cho bản lịch mới', `${data.context.name} — ${new Date().toLocaleString('vi-VN')}`)
            if (name?.trim()) {
              await sched.saveAsNew({ name: name.trim(), cloneFromId: contextId })
              appToast.success('Đã lưu bản sao bản lịch')
            }
          }
        }
        setOutputTab(data.unscheduled.length ? 'unsorted' : 'results')
      } catch (e) {
        setLocalError(e instanceof Error ? e.message : 'Lỗi xếp lịch')
      }
    },
    [contextId, payload, sched, clearErrors],
  )

  const exportCsv = useCallback(() => {
    if (!payload) return
    const csv = buildAssignmentsCsv(payload.masters, payload.assignments)
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeName = (payload.name || 'export').replace(/\s+/g, '-').replace(/[/\\?%*:|"<>]/g, '')
    a.download = `sap-lich-${safeName}.csv`
    a.click()
    URL.revokeObjectURL(url)
    appToast.success('Đã tải file CSV')
  }, [payload])

  const loadSharedIntoContext = useCallback(async (type: 'doctors' | 'technicians' | 'machines' | 'procedures') => {
    if (!payload) return
    try {
      const res = await fetch(`/api/scheduling/shared/${type}`)
      if (!res.ok) throw new Error('Lỗi tải danh sách chung')
      const { items } = (await res.json()) as { items: Record<string, unknown>[] }
      if (!items?.length) {
        appToast.info('Danh sách chung trống')
        return
      }

      const masters = { ...payload.masters }
      if (type === 'doctors') {
        const shared = items as unknown as SharedDoctor[]
        const existingCodes = new Set(masters.doctors.map((d) => d.code))
        const newDocs: SchedDoctor[] = shared
          .filter((s) => !existingCodes.has(s.code))
          .map((s) => ({
            id: crypto.randomUUID(),
            code: s.code,
            name: s.name,
            amStartM: parseTimeToMinutes(s.amStart),
            amEndM: parseTimeToMinutes(s.amEnd),
            pmStartM: parseTimeToMinutes(s.pmStart),
            pmEndM: parseTimeToMinutes(s.pmEnd),
            busy: [],
          }))
        masters.doctors = [...masters.doctors, ...newDocs]
        appToast.success(`Đã thêm ${newDocs.length} bác sĩ từ danh sách chung`)
      } else if (type === 'technicians') {
        const shared = items as unknown as SharedTechnician[]
        const existingCodes = new Set((masters.technicians ?? []).map((d) => d.code))
        const newTechs: SchedTechnician[] = shared
          .filter((s) => !existingCodes.has(s.code))
          .map((s) => ({
            id: crypto.randomUUID(),
            code: s.code,
            name: s.name,
            amStartM: parseTimeToMinutes(s.amStart),
            amEndM: parseTimeToMinutes(s.amEnd),
            pmStartM: parseTimeToMinutes(s.pmStart),
            pmEndM: parseTimeToMinutes(s.pmEnd),
            monthlyShifts: {},
            busy: [],
          }))
        masters.technicians = [...(masters.technicians ?? []), ...newTechs]
        appToast.success(`Đã thêm ${newTechs.length} KTV từ danh sách chung`)
      } else if (type === 'machines') {
        const shared = items as unknown as SharedMachine[]
        const existingKeys = new Set(masters.machines.map((m) => `${m.typeName}|${m.unitName}`))
        const newMachines: SchedMachine[] = shared
          .filter((s) => !existingKeys.has(`${s.typeName}|${s.unitName}`))
          .map((s) => ({
            id: crypto.randomUUID(),
            typeName: s.typeName,
            unitName: s.unitName,
            busy: [],
          }))
        masters.machines = [...masters.machines, ...newMachines]
        appToast.success(`Đã thêm ${newMachines.length} máy từ danh sách chung`)
      } else {
        const shared = items as unknown as SharedProcedure[]
        const existingNames = new Set(masters.procedures.map((p) => p.name))
        const newProcs: SchedProcedure[] = shared
          .filter((s) => !existingNames.has(s.name))
          .map((s) => ({
            id: crypto.randomUUID(),
            name: s.name,
            durationM: s.durationM,
            pillowM: s.pillowM,
            mainCodes: s.mainCodes,
            substituteCodes: s.substituteCodes,
            machineType: s.machineType,
            priority: s.priority,
            technicianCodes: s.technicianCodes ?? '',
          }))
        masters.procedures = [...masters.procedures, ...newProcs]
        appToast.success(`Đã thêm ${newProcs.length} thủ thuật từ danh sách chung`)
      }
      setPayload({ ...payload, masters })
    } catch (e) {
      appToast.error(e instanceof Error ? e.message : 'Lỗi tải danh sách chung')
    }
  }, [payload, setPayload])

  const handleCreate = useCallback(async () => {
    clearErrors()
    setLocalError(null)
    try {
      await sched.createSession()
      appToast.success('Đã tạo bản lịch mới')
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Lỗi tạo bản lịch mới')
    }
  }, [sched, clearErrors])

  const handleDeleteCurrent = useCallback(async () => {
    if (!contextId) return
    const ok = window.confirm('Xóa hẳn bản lịch này trên máy chủ? Không thể hoàn tác.')
    if (!ok) return
    clearErrors()
    setLocalError(null)
    try {
      await sched.deleteContext(contextId)
      appToast.success('Đã xóa bản lịch')
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Lỗi xóa bản lịch')
    }
  }, [contextId, sched, clearErrors])

  const handleDeleteById = useCallback(
    async (id: string) => {
      const ok = window.confirm('Xóa bản lịch này? Không thể hoàn tác.')
      if (!ok) return
      clearErrors()
      setLocalError(null)
      try {
        await sched.deleteContext(id)
        appToast.success('Đã xóa bản lịch')
      } catch (e) {
        setLocalError(e instanceof Error ? e.message : 'Lỗi xóa bản lịch')
      }
    },
    [sched, clearErrors],
  )

  const handleSaveAsNew = useCallback(async () => {
    if (!payload) return
    const name = window.prompt('Tên bản lịch mới', payload.name)
    if (!name?.trim()) return
    clearErrors()
    setLocalError(null)
    try {
      await sched.saveAsNew({
        name: name.trim(),
        schedulingDate: payload.schedulingDate,
        daysOff: payload.daysOff,
        settings: payload.settings,
        masters: payload.masters,
      })
      appToast.success('Đã lưu bản lịch mới')
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Lỗi lưu bản lịch mới')
    }
  }, [payload, sched, clearErrors])

  const stats = useMemo(() => {
    if (!payload) return []
    return buildProcedureStats(payload.masters, payload.assignments, payload.lastUnscheduled ?? [])
  }, [payload])

  const unscheduled = payload?.lastUnscheduled ?? []

  const dayBounds = useMemo(() => {
    if (!payload) return { dayStart: 7 * 60, dayEnd: 18 * 60 }
    return inferDayBounds(payload.masters)
  }, [payload])

  const doctorSlices = useMemo(() => {
    if (!payload) return []
    return buildDoctorDaySlices(payload.masters, payload.assignments)
  }, [payload])

  const machineSlices = useMemo(() => {
    if (!payload) return []
    return buildMachineDaySlices(payload.masters, payload.assignments)
  }, [payload])

  const estimates = useMemo(() => {
    if (!payload) return []
    return estimateExtraSlots(payload.masters, payload.assignments, payload.masters.procedures)
  }, [payload])

  return (
    <div className='flex min-h-dvh w-full min-w-0 max-w-full overflow-x-hidden bg-[var(--notika-content)] text-[var(--notika-text)]'>
      {sidebarOpen ? (
        <button
          type='button'
          className='fixed inset-0 z-40 bg-black/45 md:hidden'
          aria-label='Đóng menu'
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(14rem,calc(100dvw-1.5rem))] max-w-[85vw] flex-col border-r border-[var(--notika-sidebar-border)] bg-[var(--notika-sidebar)] pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] text-[var(--notika-text)] shadow-lg transition-transform duration-200 md:w-56 md:max-w-none md:translate-x-0 md:rounded-r-3xl md:pb-0 md:pt-0 md:shadow-md',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
        aria-label='Menu chính'
      >
        <div className='flex h-14 shrink-0 items-center border-b border-[var(--notika-sidebar-border)] px-4'>
          <span className='text-[15px] font-bold tracking-wide text-[var(--notika-green)]'>QLCV</span>
        </div>
        <nav className='flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3'>
          {MAIN_NAV.map(({ id, label }) => (
            <button
              key={id}
              type='button'
              onClick={() => {
                setMainTab(id)
                setSidebarOpen(false)
              }}
              className={cn(
                'rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                mainTab === id
                  ? 'bg-[var(--notika-green)] font-semibold text-white shadow-sm'
                  : 'text-[var(--notika-muted)] hover:bg-[var(--notika-sidebar-hover)] hover:text-[var(--notika-text)]',
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <div className='flex min-h-dvh min-w-0 max-w-full flex-1 flex-col md:pl-56'>
        <header className='sticky top-0 z-30 min-w-0 max-w-full border-b border-[var(--notika-border)] bg-[var(--notika-header)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'>
          <div className='flex min-w-0 max-w-full flex-col gap-3 px-3 py-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))] sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:px-5 sm:py-3 sm:pt-3'>
            <div className='flex min-w-0 items-center gap-2 sm:min-w-0 sm:flex-1'>
              <button
                type='button'
                className='min-h-11 shrink-0 rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2 text-xs font-semibold text-[var(--notika-text)] shadow-sm md:hidden'
                onClick={() => setSidebarOpen((o) => !o)}
              >
                Menu
              </button>
              <div className='min-w-0 flex-1'>
                <p className='text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--notika-muted)]'>Bảng điều khiển</p>
                <h1 className='line-clamp-2 font-sans text-sm font-semibold leading-snug text-[var(--notika-text)] sm:line-clamp-1 sm:text-lg'>
                  {APP_DOCUMENT_TITLE}
                </h1>
                {payload?.name ? (
                  <p className='truncate text-xs text-[var(--notika-muted)]'>{payload.name}</p>
                ) : null}
              </div>
            </div>
            <div className='flex w-full min-w-0 flex-col items-stretch gap-2 sm:w-auto sm:flex-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2'>
              <button
                type='button'
                className={cn(btnSecondary, 'min-h-11 w-full sm:w-auto')}
                onClick={() => {
                  void refreshList()
                  setSessionPickerOpen(true)
                }}
              >
                Mở bản lịch
              </button>
              <button type='button' className={cn(btnPrimary, 'min-h-11 w-full sm:w-auto')} onClick={() => void handleCreate()}>
                Tạo mới
              </button>
              <button
                type='button'
                onClick={() => void handleLogout()}
                className='min-h-11 w-full rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2 text-xs font-semibold text-[var(--notika-muted)] shadow-sm transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 sm:w-auto'
                title='Đăng xuất'
              >
                Đăng xuất
              </button>
              <ThemeToggle className='shrink-0 self-end sm:self-center' />
            </div>
          </div>
        </header>

        <main className='mx-auto w-full min-w-0 max-w-[1600px] flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-6'>
        {payload && contextId ? (
          <div className='mb-4 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:mb-6 sm:gap-3 lg:grid-cols-4'>
            {(
              [
                { n: payload.masters.patients.length, l: 'Bệnh nhân', c: 'var(--notika-green)' },
                { n: payload.assignments.length, l: 'Ca đã xếp', c: 'var(--notika-blue)' },
                { n: payload.masters.doctors.length, l: 'Bác sĩ', c: 'var(--notika-coral)' },
                { n: payload.masters.machines.length, l: 'Máy', c: 'var(--notika-purple)' },
              ] as const
            ).map((s) => (
              <div
                key={s.l}
                className='relative overflow-hidden rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] pt-1 shadow-sm'
              >
                <div className='absolute inset-x-0 top-0 h-1' style={{ backgroundColor: s.c }} aria-hidden />
                <div className='px-3 pb-3 pt-3.5 sm:px-4 sm:pt-4'>
                  <p className='text-xl font-bold tabular-nums text-[var(--notika-text)] sm:text-2xl'>{s.n}</p>
                  <p className='text-[10px] font-semibold uppercase tracking-wide text-[var(--notika-muted)] sm:text-[11px]'>{s.l}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {bootstrapping ? (
          <div
            className={cn(panelCls, 'py-14 text-center')}
          >
            <p className='text-sm font-medium text-muted-foreground'>Đang tải bản lịch gần nhất…</p>
          </div>
        ) : !contextId || !payload ? (
          <div className='rounded-2xl border-2 border-dashed border-[var(--notika-border)] bg-[var(--notika-card)] p-6 text-center shadow-sm sm:p-10'>
            <p className='text-muted-foreground'>
              Chưa có bản lịch nào. Bấm &quot;Tạo bản lịch mới&quot; hoặc mở danh sách đã lưu.
            </p>
            <button type='button' className={cn(btnPrimary, 'mt-5')} onClick={() => void handleCreate()}>
              Tạo bản lịch đầu tiên
            </button>
          </div>
        ) : (
          <>
            <section className={cn(panelCls, 'mb-8')}>
              <div className='flex flex-col gap-8'>
                <div className='grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-6'>
                  <div className='min-w-0 space-y-0'>
                    <label className={fieldLabelCls} htmlFor='sched-session-name'>
                      Tên bản lịch
                    </label>
                    <input
                      id='sched-session-name'
                      className={inputCls}
                      value={payload.name}
                      onChange={(e) => setPayload({ ...payload, name: e.target.value })}
                      placeholder='Ví dụ: Lịch sáng — phòng thủ thuật'
                      autoComplete='off'
                    />
                  </div>
                  <div className='min-w-0 w-full max-w-full space-y-0'>
                    <SchedDateField
                      label='Ngày làm việc'
                      ariaLabel='Ngày làm việc'
                      value={payload.schedulingDate}
                      onChange={(iso) => setPayload({ ...payload, schedulingDate: iso })}
                    />
                  </div>
                </div>
                <div className='border-t border-[var(--notika-border)] pt-8'>
                  <p className='mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--notika-green)]'>
                    Lưu và chạy xếp lịch
                  </p>
                  <div className='flex flex-col gap-3 sm:gap-4'>
                    <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3'>
                      <button type='button' className={cn(btnSecondary, 'min-h-11 w-full sm:w-auto')} disabled={busy} onClick={() => void handleSave()}>
                        Lưu lên máy chủ
                      </button>
                      <button type='button' className={cn(btnDanger, 'min-h-11 w-full sm:w-auto')} disabled={busy} onClick={() => void handleDeleteCurrent()}>
                        Xóa bản lịch này
                      </button>
                      <button type='button' className={cn(btnSecondary, 'min-h-11 w-full sm:w-auto')} disabled={busy} onClick={() => void handleSaveAsNew()}>
                        Lưu thành bản mới (đổi tên)
                      </button>
                      <button type='button' className={cn(btnSecondary, 'min-h-11 w-full sm:w-auto')} disabled={busy} onClick={exportCsv}>
                        Xuất file Excel (CSV)
                      </button>
                    </div>
                    <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3'>
                      <button type='button' className={cn(btnPrimary, 'min-h-11 w-full sm:w-auto')} disabled={busy} onClick={() => void handleRun('full')}>
                        Xếp lịch lại từ đầu
                      </button>
                      <button type='button' className={cn(btnPrimary, 'min-h-11 w-full sm:w-auto')} disabled={busy} onClick={() => void handleRun('preserve')}>
                        Xếp lịch, giữ các ca đã có
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={cn(panelCls, 'mb-8')}>
              <h2 className='mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-[var(--notika-green)]'>
                <span className='h-1 w-5 bg-[var(--notika-green)]' aria-hidden />
                Tuỳ chọn xếp lịch
              </h2>
              <div className='flex flex-col gap-6'>
                <label className='flex cursor-pointer items-start gap-3 rounded-lg py-1 text-sm leading-snug'>
                  <input
                    type='checkbox'
                    className='mt-0.5 size-[1.125rem] shrink-0 rounded border-[var(--notika-border)] text-[var(--notika-green)] accent-[var(--notika-green)] focus:ring-2 focus:ring-[var(--notika-green)]/25'
                    checked={payload.settings.autoSaveAfterSchedule}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        settings: { ...payload.settings, autoSaveAfterSchedule: e.target.checked },
                      })
                    }
                  />
                  <span>
                    <span className='font-medium text-foreground'>Hỏi có muốn lưu bản lịch mới sau khi xếp xong</span>
                    <span className='mt-1 block text-xs leading-relaxed text-muted-foreground'>
                      Khi bạn bấm xếp lịch và chạy xong, chương trình sẽ hỏi có muốn lưu thêm một bản sao (tên khác) hay không.
                    </span>
                  </span>
                </label>
                <label className='flex cursor-pointer items-start gap-3 rounded-lg py-1 text-sm leading-snug'>
                  <input
                    type='checkbox'
                    className='mt-0.5 size-[1.125rem] shrink-0 rounded border-[var(--notika-border)] text-[var(--notika-green)] accent-[var(--notika-green)] focus:ring-2 focus:ring-[var(--notika-green)]/25'
                    checked={payload.settings.allowAdjacentPillow}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        settings: { ...payload.settings, allowAdjacentPillow: e.target.checked },
                      })
                    }
                  />
                  <span>
                    <span className='font-medium text-foreground'>Cho hai ca khác loại của cùng bác sĩ được nối liền nhau</span>
                    <span className='mt-1 block text-xs leading-relaxed text-muted-foreground'>
                      Thông thường, giữa hai ca khác loại trên cùng một bác sĩ phải có ít nhất vài phút nghỉ (ô số bên dưới). Bật mục này thì không bắt buộc phải nghỉ ở giữa.
                    </span>
                  </span>
                </label>
                <label className='flex flex-col gap-2 text-sm'>
                  <span className='font-medium text-foreground'>Số phút nghỉ tối thiểu giữa hai ca khác loại (cùng bác sĩ)</span>
                  <span className='text-xs leading-relaxed text-muted-foreground'>
                    Chỉ áp dụng khi bạn không bật &quot;Cho hai ca… nối liền&quot; ở trên. Thường để 3 phút.
                  </span>
                  <input
                    type='number'
                    min={0}
                    className={cn(inputCls, 'w-full max-w-[10rem] sm:w-28')}
                    value={payload.settings.pillowGapMinutes}
                    placeholder='3'
                    title='Thường dùng 3 phút'
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        settings: {
                          ...payload.settings,
                          pillowGapMinutes: Number(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </label>
              </div>
            </section>

            <div
              className={cn(
                tabBarCls,
                'touch-scroll-x mb-8 min-w-0 max-w-full flex-nowrap overflow-x-auto overflow-y-hidden md:hidden',
              )}
            >
              {MAIN_NAV.map(({ id, label }) => (
                <button
                  key={id}
                  type='button'
                  className={cn(tabBtn, mainTab === id && tabBtnActive)}
                  onClick={() => setMainTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {mainTab === 'calendar' ? (
              <section className={cn(panelCls, 'space-y-8')}>
                <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                  <MonthCalendar
                    selectedDate={payload.schedulingDate}
                    viewMonth={viewMonth}
                    holidays={hol.holidays}
                    daysOff={payload.daysOff}
                    onSelectDate={(iso) => {
                      const isOff =
                        payload.daysOff.includes(iso) ||
                        hol.holidays.some((h) => {
                          if (h.date === iso) return true
                          if (h.recurring) {
                            const [, hm, hd] = h.date.split('-')
                            const [, dm, dd] = iso.split('-')
                            return hm === dm && hd === dd
                          }
                          return false
                        })
                      if (isOff) {
                        appToast.warning('Đây là ngày nghỉ — bạn vẫn có thể xếp lịch nếu cần')
                      }
                      setPayload({ ...payload, schedulingDate: iso })
                    }}
                    onChangeMonth={setViewMonth}
                    onDaysOffChange={(next) => {
                      setPayload({ ...payload, daysOff: next })
                      void persistDaysOff(next)
                    }}
                  />
                  <DaysOffManager
                    holidays={hol.holidays}
                    daysOff={payload.daysOff}
                    holidayBusy={hol.busy}
                    onAddHoliday={hol.addHoliday}
                    onRemoveHoliday={hol.removeHoliday}
                    onDaysOffChange={(next) => {
                      setPayload({ ...payload, daysOff: next })
                      void persistDaysOff(next)
                    }}
                  />
                </div>
              </section>
            ) : null}
            {mainTab === 'doctors' ? (
              <section className='space-y-6'>
                <ExcelImporter type='doctors' onImported={() => void loadSharedIntoContext('doctors')} />
                <LoadSharedButton type='doctors' onLoad={() => void loadSharedIntoContext('doctors')} busy={busy} />
                <DoctorsEditor
                  doctors={payload.masters.doctors}
                  onChange={(doctors) => setPayload({ ...payload, masters: { ...payload.masters, doctors } })}
                />
              </section>
            ) : null}
            {mainTab === 'technicians' ? (
              <section className='space-y-6'>
                <ExcelImporter type='technicians' onImported={() => void loadSharedIntoContext('technicians')} />
                <TechniciansEditor
                  technicians={payload.masters.technicians ?? []}
                  onChange={(technicians) => setPayload({ ...payload, masters: { ...payload.masters, technicians } })}
                  schedulingDate={payload.schedulingDate}
                  onLoadShared={() => void loadSharedIntoContext('technicians')}
                  onSaveContext={handleSave}
                  saving={busy}
                />
              </section>
            ) : null}
            {mainTab === 'machines' ? (
              <section className='space-y-6'>
                <ExcelImporter type='machines' onImported={() => void loadSharedIntoContext('machines')} />
                <LoadSharedButton type='machines' onLoad={() => void loadSharedIntoContext('machines')} busy={busy} />
                <MachinesEditor
                  machines={payload.masters.machines}
                  onChange={(machines) => setPayload({ ...payload, masters: { ...payload.masters, machines } })}
                />
              </section>
            ) : null}
            {mainTab === 'procedures' ? (
              <section className='space-y-6'>
                <ExcelImporter type='procedures' onImported={() => void loadSharedIntoContext('procedures')} />
                <LoadSharedButton type='procedures' onLoad={() => void loadSharedIntoContext('procedures')} busy={busy} />
                <ProceduresEditor
                  procedures={payload.masters.procedures}
                  doctors={payload.masters.doctors}
                  technicians={payload.masters.technicians ?? []}
                  machines={payload.masters.machines}
                  onChange={(procedures) => setPayload({ ...payload, masters: { ...payload.masters, procedures } })}
                />
              </section>
            ) : null}
            {mainTab === 'patients' ? (
              <PatientsEditor
                patients={payload.masters.patients}
                procedures={payload.masters.procedures}
                onChange={(patients) => setPayload({ ...payload, masters: { ...payload.masters, patients } })}
              />
            ) : null}

            {mainTab === 'output' ? (
              <section className='space-y-7'>
                <div
                  className={cn(tabBarCls, 'touch-scroll-x mb-6 min-w-0 max-w-full flex-nowrap overflow-x-auto overflow-y-hidden')}
                >
                  {(
                    [
                      ['results', 'Kết quả'],
                      ['timer', 'Thực hiện ca'],
                      ['unsorted', 'Chưa xếp'],
                      ['stats', 'Thống kê'],
                      ['docTime', 'Giờ bác sĩ tại ca'],
                      ['machTime', 'Giờ máy chạy'],
                      ['gantt', 'Biểu đồ theo bác sĩ'],
                      ['estimate', 'Ước tính còn xếp thêm được'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type='button'
                      className={cn(tabBtn, outputTab === id && tabBtnActive)}
                      onClick={() => setOutputTab(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {contextId && payload.assignments.length > 0 && (
                  <ConflictPanel
                    schedulingDate={payload.schedulingDate}
                    contextId={contextId}
                    assignments={payload.assignments}
                    masters={payload.masters}
                  />
                )}

                {outputTab === 'results' ? (
                  <ResultsTable
                    payload={payload}
                    onPatchPayload={(fn) => setPayload((p) => (p ? fn(p) : p))}
                    onUpdateAssignments={(next) => void persistAssignments(next)}
                  />
                ) : null}
                {outputTab === 'timer' ? (
                  <ProcedureTimer
                    assignments={payload.assignments
                      .slice()
                      .sort((a, b) => a.startM - b.startM)
                      .map((a) => {
                        const proc = payload.masters.procedures.find((p) => p.id === a.procedureId)
                        const pat = payload.masters.patients.find((p) => p.id === a.patientId)
                        const machine = payload.masters.machines.find((m) => m.id === a.machineId)
                        const docNames = a.doctorCodes
                          .map((c) => payload.masters.doctors.find((d) => d.code.toLowerCase() === c.toLowerCase())?.name ?? c)
                          .join(', ')
                        return {
                          id: a.id,
                          patientName: pat?.name ?? a.patientId,
                          procedureName: proc?.name ?? a.procedureId,
                          durationM: proc?.durationM ?? (a.endM - a.startM),
                          startM: a.startM,
                          endM: a.endM,
                          doctorNames: docNames,
                          machineLabel: machine ? `${machine.typeName} - ${machine.unitName}` : a.machineId,
                        }
                      })}
                  />
                ) : null}
                {outputTab === 'unsorted' ? <UnsortedTable payload={payload} unscheduled={unscheduled} /> : null}
                {outputTab === 'stats' ? <StatsTable rows={stats} /> : null}
                {outputTab === 'docTime' ? (
                  <SlicesTable
                    title='Bác sĩ — thời gian phải có mặt tại ca'
                    rows={doctorSlices.map((s) => ({
                      label: s.doctorName,
                      patientName: s.patientName,
                      procedureName: s.procedureName,
                      pillowStartM: s.pillowStartM,
                      pillowEndM: s.pillowEndM,
                    }))}
                  />
                ) : null}
                {outputTab === 'machTime' ? (
                  <SlicesTable
                    title='Máy — từ lúc bắt đầu đến lúc xong ca'
                    rows={machineSlices.map((s) => ({
                      label: s.label,
                      patientName: s.patientName,
                      procedureName: s.procedureName,
                      startM: s.startM,
                      endM: s.endM,
                    }))}
                  />
                ) : null}
                {outputTab === 'gantt' ? (
                  <GanttChart dayBounds={dayBounds} slices={doctorSlices} />
                ) : null}
                {outputTab === 'estimate' ? <EstimateTable rows={estimates} /> : null}
              </section>
            ) : null}

            {mainTab === 'users' && isSuperAdmin ? (
              <section className={panelCls}>
                <UserManager />
              </section>
            ) : null}
          </>
        )}
        </main>
      </div>

      {sessionPickerOpen ? (
        <SessionPickerModal
          contexts={contextList}
          currentId={contextId}
          busy={busy}
          onClose={() => setSessionPickerOpen(false)}
          onPick={async (id) => {
            setSessionPickerOpen(false)
            try {
              await loadContext(id)
              appToast.success('Đã mở bản lịch')
            } catch (e) {
              appToast.error(e instanceof Error ? e.message : 'Không mở được bản lịch')
            }
          }}
          onRefresh={() => {
            void refreshList()
            appToast.info('Đã làm mới danh sách bản lịch')
          }}
          onDelete={(id) => void handleDeleteById(id)}
        />
      ) : null}
    </div>
  )
}

const panelCls = cn(
  'min-w-0 max-w-full rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-5 shadow-sm sm:p-6',
  'dark:border-[var(--notika-border)] dark:bg-[var(--notika-card)]',
)

const fieldLabelCls = cn(
  'mb-2.5 block text-xs font-semibold uppercase tracking-wide text-[var(--notika-green)] dark:text-[var(--brand-soft)]',
)

const subLabelCls =
  'mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground'

const tableWrapCls = cn(
  'touch-scroll-x max-w-full overflow-x-auto rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] shadow-sm',
  'dark:border-[var(--notika-border)] dark:bg-[var(--notika-card)]',
)

const theadCls = cn(
  'border-b border-[var(--notika-border)] bg-[#f8fafb]',
  'text-xs font-semibold uppercase tracking-wide text-[var(--notika-green)]',
  'dark:border-[var(--notika-border)] dark:bg-[var(--muted)] dark:text-[var(--brand-soft)]',
)

const btnPrimary = cn(
  'rounded-xl border border-transparent bg-[var(--notika-green)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition',
  'hover:bg-[var(--notika-green-hover)] active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100',
)

const btnSecondary = cn(
  'rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-4 py-2.5 text-sm font-medium text-[var(--notika-text)] shadow-sm transition',
  'hover:bg-[#f8f9fa] disabled:opacity-50 dark:border-[var(--notika-border)] dark:bg-[var(--notika-card)] dark:hover:bg-[var(--muted)]',
)

const btnDanger = cn(
  'rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-900 shadow-sm transition',
  'hover:border-rose-300 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100',
)

const inputCls = cn(
  'min-h-[2.75rem] w-full rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-4 py-3 text-sm text-[var(--notika-text)] outline-none transition',
  'placeholder:text-[var(--notika-muted)] focus:border-[var(--notika-green)] focus:ring-2 focus:ring-[var(--notika-green)]/20 focus:ring-offset-1 focus:ring-offset-[var(--notika-content)]',
  'dark:border-[var(--notika-border)] dark:bg-[var(--notika-card)] dark:focus:ring-offset-[var(--notika-content)]',
)

const tabBarCls = cn(
  'flex flex-wrap gap-1 rounded-xl border border-[var(--notika-border)] bg-[#f8fafb] p-1.5',
  'dark:border-[var(--notika-border)] dark:bg-[var(--muted)]',
)

const tabBtn = cn(
  'shrink-0 whitespace-nowrap rounded-lg border border-transparent px-2.5 py-2 text-sm font-medium text-[var(--notika-muted)] transition sm:px-3',
  'hover:bg-white hover:text-[var(--notika-text)] dark:hover:bg-[var(--notika-card)] dark:hover:text-[var(--notika-text)]',
)

const tabBtnActive = cn(
  'rounded-lg border-[var(--notika-border)] bg-white font-semibold text-[var(--notika-green)] shadow-sm',
  'dark:border-[var(--notika-border)] dark:bg-[var(--notika-card)] dark:text-[var(--brand-soft)]',
)

function SessionPickerModal({
  contexts,
  currentId,
  busy,
  onClose,
  onPick,
  onRefresh,
  onDelete,
}: {
  contexts: { id: string; name: string; scheduling_date: string; updated_at: string }[]
  currentId: string | null
  busy: boolean
  onClose: () => void
  onPick: (id: string) => void
  onRefresh: () => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center bg-foreground/25 p-0 backdrop-blur-md sm:items-center sm:p-6'
      role='dialog'
      aria-modal='true'
    >
      <div className='flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] shadow-[0_12px_40px_rgba(0,0,0,0.15)] sm:max-h-[80vh] sm:rounded-2xl'>
        <div className='flex flex-col gap-2 border-b border-[var(--notika-border)] bg-[#f8fafb] px-4 py-3 dark:bg-[var(--muted)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-4'>
          <h3 className='text-base font-semibold text-[var(--notika-green)]'>Bản lịch đã lưu</h3>
          <button type='button' className={cn(btnSecondary, 'min-h-11 w-full sm:w-auto')} onClick={onRefresh} disabled={busy}>
            Làm mới danh sách
          </button>
        </div>
        <ul className='min-h-0 flex-1 touch-scroll-x overflow-auto p-3 sm:p-4'>
          {contexts.map((c) => (
            <li key={c.id}>
              <div
                className={cn(
                  'flex items-stretch gap-3 rounded-xl px-2 py-2',
                  currentId === c.id && 'bg-[var(--notika-green-soft)] dark:bg-[var(--muted)]',
                )}
              >
                <button
                  type='button'
                  className='min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left text-sm text-foreground hover:bg-[#f0f2f4] dark:hover:bg-[var(--muted)]'
                  onClick={() => onPick(c.id)}
                >
                  <div className='font-medium'>{c.name || '(Chưa đặt tên)'}</div>
                  <div className='text-xs text-muted-foreground'>
                    {c.scheduling_date} · cập nhật {new Date(c.updated_at).toLocaleString('vi-VN')}
                  </div>
                </button>
                <button
                  type='button'
                  className='shrink-0 self-center rounded-xl border-2 border-red-200 bg-red-50/80 px-3 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-800/55 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50'
                  disabled={busy}
                  title='Xóa bản lịch'
                  aria-label={`Xóa bản lịch ${c.name || c.id}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(c.id)
                  }}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
          {contexts.length === 0 ? <li className='px-4 py-10 text-center text-sm text-muted-foreground'>Chưa có bản lịch nào.</li> : null}
        </ul>
        <div className='shrink-0 border-t border-[var(--notika-border)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 sm:pb-4'>
          <button type='button' className={cn(btnSecondary, 'min-h-11 w-full')} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

function DoctorsEditor({
  doctors,
  onChange,
}: {
  doctors: SchedDoctor[]
  onChange: (d: SchedDoctor[]) => void
}) {
  const update = (i: number, patch: Partial<SchedDoctor>) => {
    const next = doctors.map((d, idx) => (idx === i ? { ...d, ...patch } : d))
    onChange(next)
  }
  const add = () =>
    onChange([
      ...doctors,
      {
        id: newId(),
        code: '',
        name: '',
        amStartM: null,
        amEndM: null,
        pmStartM: null,
        pmEndM: null,
        busy: [],
      },
    ])
  return (
    <section className={cn(panelCls, 'space-y-6')}>
      <div className='flex flex-col gap-4 border-b border-[var(--notika-border)] pb-5 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-lg font-semibold text-foreground'>Danh sách bác sĩ</h2>
        <button type='button' className={btnSecondary} onClick={add}>
          Thêm bác sĩ
        </button>
      </div>
      <p className='text-sm leading-relaxed text-muted-foreground'>
        Mã bác sĩ phải trùng với phần nhập ở mục Thủ thuật (ví dụ A, B). Ca nghỉ: nhập giờ bắt đầu và kết thúc giống nhau (ví dụ 07:30–07:30).
      </p>
      <div className='space-y-6'>
        {doctors.map((d, i) => (
          <div key={d.id} className='rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-4 sm:p-5'>
            <div className='mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <input
                className={inputCls}
                value={d.code}
                onChange={(e) => update(i, { code: e.target.value })}
                placeholder='Mã bác sĩ (vd A, B)'
                autoComplete='off'
              />
              <input
                className={inputCls}
                value={d.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder='Họ tên bác sĩ'
                autoComplete='name'
              />
              <div className='sm:col-span-2'>
                <p className={subLabelCls}>Buổi sáng — giờ vào / giờ ra</p>
                <div className='flex flex-wrap gap-3'>
                  <SchedTimeField
                    ariaLabel={`Bác sĩ ${d.name || d.code || i + 1}: giờ bắt đầu ca sáng`}
                    value={d.amStartM}
                    onChange={(m) => update(i, { amStartM: m })}
                  />
                  <SchedTimeField
                    ariaLabel={`Bác sĩ ${d.name || d.code || i + 1}: giờ kết thúc ca sáng`}
                    value={d.amEndM}
                    onChange={(m) => update(i, { amEndM: m })}
                  />
                </div>
              </div>
              <div className='sm:col-span-2'>
                <p className={subLabelCls}>Buổi chiều — giờ vào / giờ ra</p>
                <div className='flex flex-wrap gap-3'>
                  <SchedTimeField
                    ariaLabel={`Bác sĩ ${d.name || d.code || i + 1}: giờ bắt đầu ca chiều`}
                    value={d.pmStartM}
                    onChange={(m) => update(i, { pmStartM: m })}
                  />
                  <SchedTimeField
                    ariaLabel={`Bác sĩ ${d.name || d.code || i + 1}: giờ kết thúc ca chiều`}
                    value={d.pmEndM}
                    onChange={(m) => update(i, { pmEndM: m })}
                  />
                </div>
              </div>
            </div>
            <BusyEditor
              label='Những lúc bác sĩ không xếp ca'
              busy={d.busy}
              onChange={(busy) => update(i, { busy })}
            />
            <button type='button' className='mt-4 text-sm font-medium text-red-600 hover:underline dark:text-red-400' onClick={() => onChange(doctors.filter((_, idx) => idx !== i))}>
              Xóa bác sĩ
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function MachinesEditor({
  machines,
  onChange,
}: {
  machines: SchedMachine[]
  onChange: (m: SchedMachine[]) => void
}) {
  const update = (i: number, patch: Partial<SchedMachine>) => {
    onChange(machines.map((m, idx) => (idx === i ? { ...m, ...patch } : m)))
  }
  const add = () =>
    onChange([
      ...machines,
      { id: newId(), typeName: '', unitName: '', busy: [] },
    ])
  return (
    <section className={cn(panelCls, 'space-y-6')}>
      <div className='flex flex-col gap-4 border-b border-[var(--notika-border)] pb-5 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-lg font-semibold text-foreground'>Danh sách máy</h2>
        <button type='button' className={btnSecondary} onClick={add}>
          Thêm máy
        </button>
      </div>
      <p className='text-sm leading-relaxed text-muted-foreground'>
        Một loại máy có thể có nhiều máy riêng (ví dụ cùng loại &quot;Điện xung&quot; nhưng tên máy 1, máy 2).
      </p>
      <div className='space-y-6'>
        {machines.map((m, i) => (
          <div key={m.id} className='rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-4 sm:p-5'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <input
                className={inputCls}
                value={m.typeName}
                onChange={(e) => update(i, { typeName: e.target.value })}
                placeholder='Loại máy (vd Điện xung, Siêu âm)'
                autoComplete='off'
              />
              <input
                className={inputCls}
                value={m.unitName}
                onChange={(e) => update(i, { unitName: e.target.value })}
                placeholder='Tên riêng từng máy'
                autoComplete='off'
              />
            </div>
            <BusyEditor label='Những lúc máy không dùng được' busy={m.busy} onChange={(busy) => update(i, { busy })} />
            <button type='button' className='mt-4 text-sm font-medium text-red-600 hover:underline dark:text-red-400' onClick={() => onChange(machines.filter((_, idx) => idx !== i))}>
              Xóa máy
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProceduresEditor({
  procedures,
  doctors,
  technicians,
  machines,
  onChange,
}: {
  procedures: SchedProcedure[]
  doctors: SchedDoctor[]
  technicians: SchedTechnician[]
  machines: SchedMachine[]
  onChange: (p: SchedProcedure[]) => void
}) {
  const machineTypes = useMemo(() => {
    const set = new Set<string>()
    machines.forEach((m) => { if (m.typeName.trim()) set.add(m.typeName.trim()) })
    return [...set].sort((a, b) => a.localeCompare(b, 'vi'))
  }, [machines])
  const update = (i: number, patch: Partial<SchedProcedure>) => {
    onChange(procedures.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  }
  const add = () =>
    onChange([
      ...procedures,
      {
        id: newId(),
        name: '',
        durationM: null,
        pillowM: null,
        mainCodes: '',
        substituteCodes: '',
        machineType: '',
        priority: false,
        technicianCodes: '',
      },
    ])
  return (
    <section className={cn(panelCls, 'space-y-6')}>
      <div className='flex flex-col gap-4 border-b border-[var(--notika-border)] pb-5 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-lg font-semibold text-foreground'>Danh sách thủ thuật</h2>
        <button type='button' className={btnSecondary} onClick={add}>
          Thêm thủ thuật
        </button>
      </div>
      <p className='text-sm leading-relaxed text-muted-foreground'>
        Thời lượng ca = thời gian làm cho một bệnh nhân. Thời gian bác sĩ tại chỗ = lúc bác sĩ phải có mặt trong ca.
        Chọn bác sĩ chính và thay thế từ danh sách, chọn loại máy từ dropdown.
      </p>
      <div className='space-y-6'>
        {procedures.map((p, i) => (
          <div key={p.id} className='rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-4 sm:p-5'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <input
                className={inputCls}
                value={p.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder='Tên thủ thuật'
                autoComplete='off'
              />
              <label className='block'>
                <span className={subLabelCls}>Loại máy</span>
                <div className='mt-1'>
                  <NotikaSelect
                    placeholder='— Chọn loại máy —'
                    value={p.machineType}
                    onChange={(v) => update(i, { machineType: v })}
                    options={machineTypes.map((t) => ({ id: t, label: t }))}
                    disabled={machineTypes.length === 0}
                    aria-label='Loại máy cho thủ thuật'
                  />
                </div>
                {machineTypes.length === 0 && (
                  <p className='mt-1 text-[11px] text-amber-600'>Chưa có máy nào. Thêm ở tab &quot;Máy&quot; trước.</p>
                )}
              </label>
              <div className='sm:col-span-2'>
                <span className={subLabelCls}>Thời lượng một ca (phút)</span>
                <div className='mt-1 flex flex-wrap items-center gap-2'>
                  <input
                    type='text'
                    inputMode='numeric'
                    className={cn(inputCls, 'w-24')}
                    value={p.durationM == null ? '' : String(p.durationM)}
                    placeholder='phút'
                    onChange={(e) => {
                      const v = e.target.value.trim()
                      if (v === '') update(i, { durationM: null })
                      else if (/^\d+$/.test(v)) update(i, { durationM: Number(v) })
                    }}
                  />
                  {[10, 15, 20, 30, 45, 60].map((m) => (
                    <button
                      key={m}
                      type='button'
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
                        p.durationM === m
                          ? 'border-[var(--notika-green)] bg-[var(--notika-green)] text-white'
                          : 'border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] hover:bg-[var(--notika-green-soft)]',
                      )}
                      onClick={() => update(i, { durationM: m })}
                    >
                      {m}&apos;
                    </button>
                  ))}
                  {p.durationM != null && (
                    <span className='text-xs text-[var(--notika-muted)]'>
                      = {Math.floor(p.durationM / 60) > 0 ? `${Math.floor(p.durationM / 60)}h` : ''}{p.durationM % 60 > 0 ? `${p.durationM % 60}p` : p.durationM >= 60 ? '' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className='sm:col-span-2'>
                <span className={subLabelCls}>Thời gian bác sĩ phải có mặt (phút)</span>
                <div className='mt-1 flex flex-wrap items-center gap-2'>
                  <input
                    type='text'
                    inputMode='numeric'
                    className={cn(inputCls, 'w-24')}
                    value={p.pillowM == null ? '' : String(p.pillowM)}
                    placeholder='phút'
                    onChange={(e) => {
                      const v = e.target.value.trim()
                      if (v === '') update(i, { pillowM: null })
                      else if (/^\d+$/.test(v)) update(i, { pillowM: Number(v) })
                    }}
                  />
                  {[3, 5, 10, 15, 20].map((m) => (
                    <button
                      key={m}
                      type='button'
                      className={cn(
                        'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
                        p.pillowM === m
                          ? 'border-[var(--notika-green)] bg-[var(--notika-green)] text-white'
                          : 'border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] hover:bg-[var(--notika-green-soft)]',
                      )}
                      onClick={() => update(i, { pillowM: m })}
                    >
                      {m}&apos;
                    </button>
                  ))}
                  {p.durationM != null && p.pillowM != null && p.pillowM > 0 && (
                    <span className={cn('text-xs', p.pillowM > p.durationM ? 'font-semibold text-rose-600' : 'text-[var(--notika-muted)]')}>
                      {p.pillowM > p.durationM ? 'Lỗi: > thời lượng ca' : `BS ${Math.round(p.pillowM / p.durationM * 100)}% ca`}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className={subLabelCls}>Bác sĩ chính</span>
                {doctors.length > 0 ? (
                  <div className='mt-1 flex flex-wrap gap-2'>
                    {doctors.map((d) => {
                      const selected = p.mainCodes.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
                      const isChecked = selected.includes(d.code.toLowerCase())
                      return (
                        <label key={d.id} className={cn(
                          'flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
                          isChecked
                            ? 'border-[var(--notika-green)] bg-[var(--notika-green)] text-white'
                            : 'border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] hover:bg-[var(--notika-green-soft)]',
                        )}>
                          <input
                            type='checkbox'
                            className='sr-only'
                            checked={isChecked}
                            onChange={() => {
                              const codes = p.mainCodes.split(',').map((s) => s.trim()).filter(Boolean)
                              const next = isChecked
                                ? codes.filter((c) => c.toLowerCase() !== d.code.toLowerCase())
                                : [...codes, d.code]
                              update(i, { mainCodes: next.join(',') })
                            }}
                          />
                          <span className='font-bold'>{d.code}</span>
                          <span className='opacity-70'>({d.name})</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <p className='mt-1 text-[11px] text-amber-600'>Chưa có bác sĩ nào. Thêm ở tab &quot;Bác sĩ&quot; trước.</p>
                )}
              </div>
              <div>
                <span className={subLabelCls}>Bác sĩ thay thế</span>
                {doctors.length > 0 ? (
                  <div className='mt-1 flex flex-wrap gap-2'>
                    {doctors.map((d) => {
                      const selected = p.substituteCodes.split('--').map((s) => s.trim().toLowerCase()).filter(Boolean)
                      const isChecked = selected.includes(d.code.toLowerCase())
                      const mainSelected = p.mainCodes.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
                      const isMainDoc = mainSelected.includes(d.code.toLowerCase())
                      return (
                        <label key={d.id} className={cn(
                          'flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
                          isMainDoc && 'opacity-30',
                          isChecked
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] hover:bg-blue-50 dark:hover:bg-blue-950/20',
                        )}>
                          <input
                            type='checkbox'
                            className='sr-only'
                            checked={isChecked}
                            disabled={isMainDoc}
                            onChange={() => {
                              const codes = p.substituteCodes.split('--').map((s) => s.trim()).filter(Boolean)
                              const next = isChecked
                                ? codes.filter((c) => c.toLowerCase() !== d.code.toLowerCase())
                                : [...codes, d.code]
                              update(i, { substituteCodes: next.join('--') })
                            }}
                          />
                          <span className='font-bold'>{d.code}</span>
                          <span className='opacity-70'>({d.name})</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <p className='mt-1 text-[11px] text-amber-600'>Chưa có bác sĩ nào.</p>
                )}
              </div>
              <div className='sm:col-span-2'>
                <span className={subLabelCls}>KTV được phép thực hiện (tuỳ chọn)</span>
                {technicians.length > 0 ? (
                  <div className='mt-1 flex flex-wrap gap-2'>
                    {technicians.map((t) => {
                      const selected = (p.technicianCodes ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
                      const isChecked = selected.includes(t.code.toLowerCase())
                      return (
                        <label key={t.id} className={cn(
                          'flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
                          isChecked
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-text)] hover:bg-amber-50 dark:hover:bg-amber-950/20',
                        )}>
                          <input
                            type='checkbox'
                            className='sr-only'
                            checked={isChecked}
                            onChange={() => {
                              const codes = (p.technicianCodes ?? '').split(',').map((s) => s.trim()).filter(Boolean)
                              const next = isChecked
                                ? codes.filter((c) => c.toLowerCase() !== t.code.toLowerCase())
                                : [...codes, t.code]
                              update(i, { technicianCodes: next.join(',') })
                            }}
                          />
                          <span className='font-bold'>{t.code}</span>
                          <span className='opacity-70'>({t.name})</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <p className='mt-1 text-[11px] text-[var(--notika-muted)]'>
                    Chưa có KTV nào. Nếu thủ thuật không cần KTV, bỏ qua trường này.
                  </p>
                )}
              </div>
              <label className='flex cursor-pointer items-start gap-3 text-sm sm:col-span-2 sm:items-center'>
                <input
                  type='checkbox'
                  className='mt-0.5 size-[1.125rem] shrink-0 rounded border-[var(--notika-border)] accent-[var(--notika-green)] sm:mt-0'
                  checked={p.priority}
                  onChange={(e) => update(i, { priority: e.target.checked })}
                />
                Ưu tiên xếp lịch trước
              </label>
            </div>
            <button type='button' className='mt-4 text-sm font-medium text-red-600 hover:underline dark:text-red-400' onClick={() => onChange(procedures.filter((_, idx) => idx !== i))}>
              Xóa thủ thuật
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function PatientsEditor({
  patients,
  procedures,
  onChange,
}: {
  patients: SchedPatient[]
  procedures: SchedProcedure[]
  onChange: (p: SchedPatient[]) => void
}) {
  const update = (i: number, patch: Partial<SchedPatient>) => {
    onChange(patients.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  }
  const add = () =>
    onChange([
      ...patients,
      {
        id: newId(),
        name: '',
        admissionM: null,
        highPriority: false,
        procedureIds: [],
        busy: [],
      },
    ])
  return (
    <section className={cn(panelCls, 'space-y-6')}>
      <div className='flex flex-col gap-4 border-b border-[var(--notika-border)] pb-5 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-lg font-semibold text-foreground'>Danh sách bệnh nhân</h2>
        <button type='button' className={btnSecondary} onClick={add}>
          Thêm bệnh nhân
        </button>
      </div>
      <div className='space-y-6'>
        {patients.map((p, i) => (
          <div key={p.id} className='rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-4 sm:p-5'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <input
                className={inputCls}
                value={p.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder='Tên hoặc mã bệnh nhân'
                autoComplete='name'
              />
              <div>
                <SchedTimeField
                  label='Giờ vào viện (thường cách lúc chỉ định khoảng 1 phút)'
                  ariaLabel={`Bệnh nhân ${p.name || i + 1}: giờ vào viện`}
                  value={p.admissionM}
                  onChange={(m) => update(i, { admissionM: m })}
                />
              </div>
              <label className='flex cursor-pointer items-start gap-3 text-sm sm:col-span-2 sm:items-center'>
                <input
                  type='checkbox'
                  className='mt-0.5 size-[1.125rem] shrink-0 rounded border-[var(--notika-border)] accent-[var(--notika-green)] sm:mt-0'
                  checked={p.highPriority}
                  onChange={(e) => update(i, { highPriority: e.target.checked })}
                />
                Ưu tiên cao khi xếp lịch
              </label>
            </div>
            <div className='mt-5'>
              <p className={subLabelCls}>Thủ thuật</p>
              <div className='flex flex-wrap gap-2.5'>
                {procedures.map((proc) => {
                  const on = p.procedureIds.includes(proc.id)
                  return (
                    <label key={proc.id} className='flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs dark:border-zinc-700'>
                      <input
                        type='checkbox'
                        className='size-4 shrink-0 rounded accent-[var(--notika-green)]'
                        checked={on}
                        onChange={() => {
                          const set = new Set(p.procedureIds)
                          if (set.has(proc.id)) set.delete(proc.id)
                          else set.add(proc.id)
                          update(i, { procedureIds: [...set] })
                        }}
                      />
                      {proc.name.trim() ? proc.name : '(Thủ thuật chưa đặt tên)'}
                    </label>
                  )
                })}
              </div>
            </div>
            <BusyEditor label='Những lúc bệnh nhân không đến được' busy={p.busy} onChange={(busy) => update(i, { busy })} />
            <button type='button' className='mt-4 text-sm font-medium text-red-600 hover:underline dark:text-red-400' onClick={() => onChange(patients.filter((_, idx) => idx !== i))}>
              Xóa bệnh nhân này
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function BusyEditor({
  label,
  busy,
  onChange,
}: {
  label: string
  busy: TimeWindowM[]
  onChange: (b: TimeWindowM[]) => void
}) {
  return (
    <div className='mt-5 border-t border-[var(--notika-border)] pt-5'>
      <p className={subLabelCls}>{label}</p>
      <div className='space-y-3'>
        {busy.map((b, idx) => (
          <div key={`busy-${idx}`} className='flex flex-wrap items-center gap-3'>
            <SchedTimeField
              ariaLabel={`${label}: giờ bắt đầu đoạn ${idx + 1}`}
              value={b.startM}
              onChange={(m) => {
                const next = busy.map((x, j) => (j === idx ? { ...x, startM: m } : x))
                onChange(next)
              }}
            />
            <span className='text-sm text-zinc-400'>—</span>
            <SchedTimeField
              ariaLabel={`${label}: giờ kết thúc đoạn ${idx + 1}`}
              value={b.endM}
              onChange={(m) => {
                const next = busy.map((x, j) => (j === idx ? { ...x, endM: m } : x))
                onChange(next)
              }}
            />
            <button
              type='button'
              className='text-xs font-medium text-red-600 hover:underline dark:text-red-400'
              onClick={() => onChange(busy.filter((_, j) => j !== idx))}
            >
              Xóa
            </button>
          </div>
        ))}
        <button
          type='button'
          className='text-sm font-medium text-[var(--notika-green)] underline decoration-[var(--notika-green)]/40 underline-offset-2'
          onClick={() => onChange([...busy, { startM: null, endM: null }])}
        >
          + Thêm một khoảng thời gian bận
        </button>
      </div>
    </div>
  )
}

function ResultsTable({
  payload,
  onPatchPayload,
  onUpdateAssignments,
}: {
  payload: SchedContextPayload
  onPatchPayload: (fn: (p: SchedContextPayload) => SchedContextPayload) => void
  onUpdateAssignments: (a: SchedAssignment[]) => void
}) {
  const procById = useMemo(() => new Map(payload.masters.procedures.map((p) => [p.id, p])), [payload.masters.procedures])
  const patientById = useMemo(() => new Map(payload.masters.patients.map((p) => [p.id, p])), [payload.masters.patients])
  const machineById = useMemo(() => new Map(payload.masters.machines.map((m) => [m.id, m])), [payload.masters.machines])

  return (
    <div className={tableWrapCls}>
      <table className='min-w-full text-left text-sm'>
        <thead className={theadCls}>
          <tr>
            <th className={tableCell}>Bệnh nhân</th>
            <th className={tableCell}>Thủ thuật</th>
            <th className={tableCell}>Bắt đầu ca</th>
            <th className={tableCell}>Hết giờ bác sĩ có mặt</th>
            <th className={tableCell}>Kết thúc ca</th>
            <th className={tableCell}>Bác sĩ</th>
            <th className={tableCell}>Máy</th>
            <th className={tableCell}>Chỉnh nhanh</th>
          </tr>
        </thead>
        <tbody>
          {[...payload.assignments]
            .sort((a, b) => a.startM - b.startM)
            .map((a) => (
              <tr key={a.id} className='border-b border-border/65 dark:border-border/35'>
                <td className={tableCell}>{patientById.get(a.patientId)?.name ?? a.patientId}</td>
                <td className={tableCell}>{procById.get(a.procedureId)?.name ?? a.procedureId}</td>
                <td className={tableCell}>
                  <SchedTimeField
                    ariaLabel={`Giờ bắt đầu ca — ${patientById.get(a.patientId)?.name ?? a.patientId}`}
                    value={a.startM}
                    onChange={(m) => {
                      if (m === null) return
                      const proc = procById.get(a.procedureId)
                      const dur =
                        proc?.durationM != null && proc.durationM > 0 ? proc.durationM : a.endM - a.startM
                      const pil =
                        proc?.pillowM != null && proc.pillowM >= 0 ? proc.pillowM : a.pillowEndM - a.startM
                      const next = payload.assignments.map((x) =>
                        x.id === a.id
                          ? {
                              ...x,
                              startM: m,
                              pillowEndM: m + pil,
                              endM: m + dur,
                            }
                          : x,
                      )
                      onUpdateAssignments(next)
                    }}
                  />
                </td>
                <td className={tableCell}>{minutesToLabel(a.pillowEndM)}</td>
                <td className={tableCell}>{minutesToLabel(a.endM)}</td>
                <td className={tableCell}>{a.doctorCodes.join(', ')}</td>
                <td className={tableCell}>
                  {machineById.get(a.machineId)?.typeName} — {machineById.get(a.machineId)?.unitName}
                </td>
                <td className={cn(tableCell, 'align-top')}>
                  <div className='flex max-w-[200px] flex-col gap-2'>
                    <button
                      type='button'
                      className='text-left text-xs font-semibold text-[var(--notika-green)] underline decoration-[var(--notika-green)]/45 underline-offset-2'
                      onClick={() =>
                        onPatchPayload((p) => ({
                          ...p,
                          masters: {
                            ...p.masters,
                            patients: p.masters.patients.map((pt) =>
                              pt.id === a.patientId ? { ...pt, highPriority: true } : pt,
                            ),
                          },
                        }))
                      }
                    >
                      Ưu tiên bệnh nhân này
                    </button>
                    <button
                      type='button'
                      className='text-left text-xs font-medium text-zinc-700 underline dark:text-zinc-300'
                      onClick={() => {
                        const adm = patientById.get(a.patientId)?.admissionM
                        const raw = window.prompt('Giờ vào viện mới (HH:MM)', minutesToLabel(adm ?? a.startM))
                        const mm = raw ? parseTimeToMinutes(raw) : null
                        if (mm === null) return
                        onPatchPayload((p) => ({
                          ...p,
                          masters: {
                            ...p.masters,
                            patients: p.masters.patients.map((pt) =>
                              pt.id === a.patientId ? { ...pt, admissionM: mm } : pt,
                            ),
                          },
                        }))
                      }}
                    >
                      Sửa giờ vào viện
                    </button>
                    <button
                      type='button'
                      className='text-left text-xs font-medium text-zinc-700 underline dark:text-zinc-300'
                      onClick={() =>
                        onPatchPayload((p) => ({
                          ...p,
                          masters: {
                            ...p.masters,
                            patients: p.masters.patients.map((pt) =>
                              pt.id === a.patientId
                                ? { ...pt, busy: [...pt.busy, { startM: 9 * 60, endM: 9 * 60 + 15 }] }
                                : pt,
                            ),
                          },
                        }))
                      }
                    >
                      + Thêm giờ bệnh nhân bận (mẫu 9:00–9:15)
                    </button>
                    <button
                      type='button'
                      className='text-left text-xs font-medium text-zinc-700 underline dark:text-zinc-300'
                      onClick={() =>
                        onPatchPayload((p) => ({
                          ...p,
                          masters: {
                            ...p.masters,
                            doctors: p.masters.doctors.map((d) =>
                              a.doctorCodes.map((c) => c.toLowerCase()).includes(d.code.toLowerCase())
                                ? { ...d, busy: [...d.busy, { startM: a.startM, endM: a.pillowEndM }] }
                                : d,
                            ),
                          },
                        }))
                      }
                    >
                      + Thêm giờ bác sĩ bận (theo ca này)
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          {payload.assignments.length === 0 ? (
            <tr>
              <td colSpan={8} className={cn(tableCell, 'py-8 text-center text-sm text-zinc-500 sm:py-10')}>
                Chưa có ca nào. Hãy bấm xếp lịch ở phần trên.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

function UnsortedTable({
  payload,
  unscheduled,
}: {
  payload: SchedContextPayload
  unscheduled: { patientId: string; procedureId: string; reason: string }[]
}) {
  const procById = new Map(payload.masters.procedures.map((p) => [p.id, p]))
  const patientById = new Map(payload.masters.patients.map((p) => [p.id, p]))
  return (
    <div className={tableWrapCls}>
      <table className='min-w-full text-left text-sm'>
        <thead className={theadCls}>
          <tr>
            <th className={tableCell}>Bệnh nhân</th>
            <th className={tableCell}>Thủ thuật</th>
            <th className={tableCell}>Lý do</th>
          </tr>
        </thead>
        <tbody>
          {unscheduled.map((u, i) => (
            <tr key={`${u.patientId}-${u.procedureId}-${i}`} className='border-b border-border/65 dark:border-border/35'>
              <td className={tableCell}>{patientById.get(u.patientId)?.name ?? u.patientId}</td>
              <td className={tableCell}>{procById.get(u.procedureId)?.name ?? u.procedureId}</td>
              <td className={cn(tableCell, 'text-zinc-600 dark:text-zinc-400')}>{u.reason}</td>
            </tr>
          ))}
          {unscheduled.length === 0 ? (
            <tr>
              <td colSpan={3} className={cn(tableCell, 'py-8 text-center text-sm text-zinc-500 sm:py-10')}>
                Không có ca chưa xếp.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

function StatsTable({ rows }: { rows: ReturnType<typeof buildProcedureStats> }) {
  return (
    <div className={tableWrapCls}>
      <table className='min-w-full text-left text-sm'>
        <thead className={theadCls}>
          <tr>
            <th className={tableCell}>Thủ thuật</th>
            <th className={tableCell}>Tổng số ca cần xếp</th>
            <th className={tableCell}>Đã xếp</th>
            <th className={tableCell}>Chưa xếp</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.procedureId} className='border-b border-border/65 dark:border-border/35'>
              <td className={tableCell}>{r.name}</td>
              <td className={tableCell}>{r.requested}</td>
              <td className={tableCell}>{r.scheduled}</td>
              <td className={tableCell}>{r.unscheduled}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SlicesTable({
  title,
  rows,
}: {
  title: string
  rows: {
    label: string
    procedureName: string
    patientName: string
    pillowStartM?: number
    pillowEndM?: number
    startM?: number
    endM?: number
  }[]
}) {
  return (
    <div className={panelCls}>
      <h3 className='mb-4 text-base font-semibold text-[var(--notika-green)]'>{title}</h3>
      <div className='touch-scroll-x max-w-full overflow-x-auto rounded-2xl border border-[var(--notika-border)]'>
        <table className='min-w-full text-left text-sm'>
          <thead className={theadCls}>
            <tr>
              <th className={tableCell}>Đối tượng</th>
              <th className={tableCell}>Bệnh nhân</th>
              <th className={tableCell}>Thủ thuật</th>
              <th className={tableCell}>Bắt đầu</th>
              <th className={tableCell}>Kết thúc</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className='border-b border-border/65 dark:border-border/35'>
                <td className={tableCell}>{r.label}</td>
                <td className={tableCell}>{r.patientName}</td>
                <td className={tableCell}>{r.procedureName}</td>
                <td className={tableCell}>
                  {minutesToLabel((r.startM ?? r.pillowStartM) as number)}
                </td>
                <td className={tableCell}>{minutesToLabel((r.endM ?? r.pillowEndM) as number)}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className={cn(tableCell, 'py-8 text-center text-sm text-zinc-500 sm:py-10')}>
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GanttChart({
  dayBounds,
  slices,
}: {
  dayBounds: { dayStart: number; dayEnd: number }
  slices: ReturnType<typeof buildDoctorDaySlices>
}) {
  const byDoctor = useMemo(() => {
    const m = new Map<string, typeof slices>()
    for (const s of slices) {
      const k = s.doctorName
      const arr = m.get(k) ?? []
      arr.push(s)
      m.set(k, arr)
    }
    return m
  }, [slices])

  const span = Math.max(1, dayBounds.dayEnd - dayBounds.dayStart)

  return (
    <div className={cn(panelCls, 'space-y-7')}>
      <h3 className='text-base font-semibold text-[var(--notika-green)]'>
        Biểu đồ thời gian bác sĩ phải có mặt
      </h3>
      {[...byDoctor.entries()].map(([doc, segs]) => (
        <div key={doc}>
          <div className='mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200'>{doc}</div>
          <div className='relative h-12 w-full rounded-xl border border-[var(--notika-border)] bg-[#f0f2f4] dark:bg-[var(--muted)]'>
            {segs.map((s, i) => {
              const left = ((s.pillowStartM - dayBounds.dayStart) / span) * 100
              const width = ((s.pillowEndM - s.pillowStartM) / span) * 100
              return (
                <div
                  key={i}
                  title={`${s.patientName} · ${s.procedureName}`}
                  className='absolute top-2 h-8 rounded-lg bg-[var(--notika-green)] text-center text-[10px] font-medium leading-8 text-white shadow-sm'
                  style={{ left: `${Math.max(0, left)}%`, width: `${Math.max(0.5, width)}%` }}
                />
              )
            })}
          </div>
          <div className='mt-2 flex justify-between text-[11px] text-zinc-500'>
            <span>{minutesToLabel(dayBounds.dayStart)}</span>
            <span>{minutesToLabel(dayBounds.dayEnd)}</span>
          </div>
        </div>
      ))}
      {byDoctor.size === 0 ? <p className='text-sm text-zinc-500'>Chưa có ca để vẽ.</p> : null}
    </div>
  )
}

function EstimateTable({ rows }: { rows: { procedureId: string; name: string; estimate: number }[] }) {
  return (
    <div className={tableWrapCls}>
      <table className='min-w-full text-left text-sm'>
        <thead className={theadCls}>
          <tr>
            <th className={tableCell}>Thủ thuật</th>
            <th className={tableCell}>Ước tính còn xếp thêm được bao nhiêu ca</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.procedureId} className='border-b border-border/65 dark:border-border/35'>
              <td className={tableCell}>{r.name}</td>
              <td className={tableCell}>{r.estimate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={cn(tableCell, 'text-xs text-zinc-500')}>
        Con số tính sơ bộ theo chỗ trống của máy và thời gian bác sĩ còn lại trong ngày; chỉ để tham khảo.
      </p>
    </div>
  )
}

function LoadSharedButton({ type, onLoad, busy }: { type: string; onLoad: () => void; busy: boolean }) {
  const labels: Record<string, string> = { doctors: 'bác sĩ', machines: 'máy', procedures: 'thủ thuật' }
  return (
    <button
      type='button'
      className={cn(
        'w-full rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-4 py-3 text-sm font-medium text-[var(--notika-green)] shadow-sm transition',
        'hover:bg-[var(--notika-green-soft)] disabled:opacity-50',
      )}
      disabled={busy}
      onClick={onLoad}
    >
      Tải danh sách {labels[type] ?? type} chung vào bản lịch này
    </button>
  )
}
