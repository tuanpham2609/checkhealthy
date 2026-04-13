/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { SchedDateField, SchedTimeField } from '@/components/scheduling/sched-aria-fields'
import { buildAssignmentsCsv } from '@/lib/scheduling/csv-export'
import type {
  SchedAssignment,
  SchedContextPayload,
  SchedDoctor,
  SchedMachine,
  SchedPatient,
  SchedProcedure,
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
import { cn } from '@/lib/styles'

type MainTab = 'doctors' | 'machines' | 'procedures' | 'patients' | 'output'

type OutputTab = 'results' | 'unsorted' | 'stats' | 'docTime' | 'machTime' | 'gantt' | 'estimate'

function newId(): string {
  return crypto.randomUUID()
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? res.statusText)
  }
  return data
}

export function SchedulingApp() {
  const [contextList, setContextList] = useState<{ id: string; name: string; scheduling_date: string; updated_at: string }[]>([])
  const [contextId, setContextId] = useState<string | null>(null)
  const [payload, setPayload] = useState<SchedContextPayload | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('doctors')
  const [outputTab, setOutputTab] = useState<OutputTab>('results')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionPickerOpen, setSessionPickerOpen] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(true)

  const refreshList = useCallback(async () => {
    const res = await fetch('/api/scheduling/contexts')
    const data = await parseJson<{ contexts: typeof contextList }>(res)
    setContextList(data.contexts)
  }, [])

  const loadContext = useCallback(async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/scheduling/contexts/${id}`)
      const data = await parseJson<SchedContextPayload>(res)
      setPayload(data)
      setContextId(id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải bản lịch')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/scheduling/contexts')
        const data = await parseJson<{ contexts: typeof contextList }>(res)
        if (cancelled) return
        setContextList(data.contexts)
        const latest = data.contexts[0]
        if (latest?.id) {
          await loadContext(latest.id)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Lỗi tải danh sách bản lịch')
        }
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadContext])

  const saveContext = useCallback(async () => {
    if (!contextId || !payload) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/scheduling/contexts/${contextId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          schedulingDate: payload.schedulingDate,
          settings: payload.settings,
          masters: payload.masters,
        }),
      })
      await parseJson<{ ok: boolean }>(res)
      await refreshList()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi lưu')
    } finally {
      setBusy(false)
    }
  }, [contextId, payload, refreshList])

  const run = useCallback(
    async (mode: 'full' | 'preserve') => {
      if (!contextId || !payload) return
      const validationErrors = validateMastersForSchedule(payload.masters)
      if (validationErrors.length > 0) {
        setError(validationErrors.join(' · '))
        return
      }
      setBusy(true)
      setError(null)
      try {
        await saveContext()
        const res = await fetch(`/api/scheduling/contexts/${contextId}/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode }),
        })
        const data = await parseJson<{ context: SchedContextPayload; unscheduled: { patientId: string; procedureId: string; reason: string }[] }>(
          res,
        )
        const nextCtx = data.context
        setPayload(nextCtx)
        if (nextCtx.settings.autoSaveAfterSchedule) {
          const ok = window.confirm('Đã xếp lịch xong. Bạn có muốn lưu thêm một bản lịch mới (bản sao) không?')
          if (ok) {
            const name = window.prompt('Đặt tên cho bản lịch mới', `${nextCtx.name} — ${new Date().toLocaleString('vi-VN')}`)
            if (name?.trim()) {
              const cloneRes = await fetch('/api/scheduling/contexts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), cloneFromId: contextId }),
              })
              const clone = await parseJson<{ id: string }>(cloneRes)
              await loadContext(clone.id)
              await refreshList()
            }
          }
        }
        setOutputTab(data.unscheduled.length ? 'unsorted' : 'results')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi xếp lịch')
      } finally {
        setBusy(false)
      }
    },
    [contextId, loadContext, payload, refreshList, saveContext],
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
  }, [payload])

  const createSession = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/scheduling/contexts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await parseJson<{ id: string }>(res)
      await refreshList()
      await loadContext(data.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tạo bản lịch mới')
    } finally {
      setBusy(false)
    }
  }, [loadContext, refreshList])

  const deleteCurrentContext = useCallback(async () => {
    if (!contextId) return
    const ok = window.confirm('Xóa hẳn bản lịch này trên máy chủ? Không thể hoàn tác.')
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/scheduling/contexts/${contextId}`, { method: 'DELETE' })
      await parseJson<{ ok: boolean }>(res)
      setContextId(null)
      setPayload(null)
      await refreshList()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi xóa bản lịch')
    } finally {
      setBusy(false)
    }
  }, [contextId, refreshList])

  const deleteContextById = useCallback(
    async (id: string) => {
      const ok = window.confirm('Xóa bản lịch này? Không thể hoàn tác.')
      if (!ok) return
      setBusy(true)
      setError(null)
      try {
        const res = await fetch(`/api/scheduling/contexts/${id}`, { method: 'DELETE' })
        await parseJson<{ ok: boolean }>(res)
        if (id === contextId) {
          setContextId(null)
          setPayload(null)
        }
        await refreshList()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi xóa bản lịch')
      } finally {
        setBusy(false)
      }
    },
    [contextId, refreshList],
  )

  const saveAsNew = useCallback(async () => {
    if (!payload) return
    const name = window.prompt('Tên bản lịch mới', payload.name)
    if (!name?.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/scheduling/contexts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          schedulingDate: payload.schedulingDate,
          settings: payload.settings,
          masters: payload.masters,
        }),
      })
      const data = await parseJson<{ id: string }>(res)
      await refreshList()
      await loadContext(data.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi lưu bản lịch mới')
    } finally {
      setBusy(false)
    }
  }, [loadContext, payload, refreshList])

  const persistAssignments = useCallback(async (next: SchedAssignment[]) => {
    if (!contextId) return
    const res = await fetch(`/api/scheduling/contexts/${contextId}/assignments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments: next }),
    })
    await parseJson<{ ok: boolean }>(res)
    setPayload((p) => (p ? { ...p, assignments: next } : p))
  }, [contextId])

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
    <div className={shellBg}>
      <div className='mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10'>
        <header className='mb-10 flex flex-col gap-6 border-b border-[color-mix(in_oklch,var(--highlight)_20%,var(--border))] pb-8 dark:border-[color-mix(in_oklch,var(--border)_88%,var(--highlight)_12%)] lg:flex-row lg:items-end lg:justify-between'>
          <div className='min-w-0 max-w-3xl'>
            <p className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--highlight-strong)] dark:text-[var(--highlight)]'>
              Quản lý công việc
            </p>
            <h1 className='font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]'>
              Phần mềm quản lý công việc
            </h1>
          </div>
          <div className='flex shrink-0 flex-wrap gap-3'>
            <button
              type='button'
              className={btnSecondary}
              onClick={() => {
                void refreshList().then(() => setSessionPickerOpen(true))
              }}
            >
              Mở bản lịch đã lưu
            </button>
            <button type='button' className={btnPrimary} onClick={() => void createSession()}>
              Tạo bản lịch mới
            </button>
          </div>
        </header>

        {error ? (
          <div
            className='mb-5 rounded-2xl border border-rose-200/90 bg-gradient-to-br from-rose-50 to-white px-4 py-3 text-sm text-rose-950 shadow-sm dark:border-rose-900/45 dark:from-rose-950/40 dark:to-card/20 dark:text-rose-50'
            role='alert'
          >
            {error}
          </div>
        ) : null}

        {bootstrapping ? (
          <div
            className={cn(
              panelCls,
              'py-14 text-center shadow-[0_8px_32px_-14px_color-mix(in_oklch,var(--highlight-strong)_16%,transparent)]',
            )}
          >
            <p className='text-sm font-medium text-muted-foreground'>Đang tải bản lịch gần nhất…</p>
          </div>
        ) : !contextId || !payload ? (
          <div className='rounded-2xl border-2 border-dashed border-[color-mix(in_oklch,var(--highlight)_36%,var(--border))] bg-card/80 p-10 text-center shadow-sm backdrop-blur-sm dark:border-[color-mix(in_oklch,var(--highlight)_28%,var(--border))] dark:bg-card/45'>
            <p className='text-muted-foreground'>
              Chưa có bản lịch nào. Bấm &quot;Tạo bản lịch mới&quot; hoặc mở danh sách đã lưu.
            </p>
            <button type='button' className={cn(btnPrimary, 'mt-5')} onClick={() => void createSession()}>
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
                <div className='border-t border-[color-mix(in_oklch,var(--highlight)_20%,var(--border))] pt-8 dark:border-zinc-700/80'>
                  <p className='mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--highlight-strong)] dark:text-[var(--highlight)]'>
                    Lưu và chạy xếp lịch
                  </p>
                  <div className='flex flex-col gap-4'>
                    <div className='flex flex-wrap gap-3'>
                      <button type='button' className={btnSecondary} disabled={busy} onClick={() => void saveContext()}>
                        Lưu lên máy chủ
                      </button>
                      <button type='button' className={btnDanger} disabled={busy} onClick={() => void deleteCurrentContext()}>
                        Xóa bản lịch này
                      </button>
                      <button type='button' className={btnSecondary} disabled={busy} onClick={() => void saveAsNew()}>
                        Lưu thành bản mới (đổi tên)
                      </button>
                      <button type='button' className={btnSecondary} disabled={busy} onClick={exportCsv}>
                        Xuất file Excel (CSV)
                      </button>
                    </div>
                    <div className='flex flex-wrap gap-3'>
                      <button type='button' className={btnPrimary} disabled={busy} onClick={() => void run('full')}>
                        Xếp lịch lại từ đầu
                      </button>
                      <button type='button' className={btnPrimary} disabled={busy} onClick={() => void run('preserve')}>
                        Xếp lịch, giữ các ca đã có
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={cn(panelCls, 'mb-8')}>
              <h2 className='mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-[var(--highlight-strong)] dark:text-[var(--highlight)]'>
                <span className='h-1.5 w-5 rounded-full bg-[var(--highlight-strong)] dark:bg-[var(--highlight)]' aria-hidden />
                Tuỳ chọn xếp lịch
              </h2>
              <div className='flex flex-col gap-6'>
                <label className='flex cursor-pointer items-start gap-3 rounded-lg py-1 text-sm leading-snug'>
                  <input
                    type='checkbox'
                    className='mt-0.5 size-[1.125rem] shrink-0 rounded border-zinc-300 text-[var(--highlight-strong)] accent-[var(--highlight-strong)] focus:ring-2 focus:ring-[color-mix(in_oklch,var(--highlight)_40%,transparent)] dark:border-zinc-600'
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
                    className='mt-0.5 size-[1.125rem] shrink-0 rounded border-zinc-300 text-[var(--highlight-strong)] accent-[var(--highlight-strong)] focus:ring-2 focus:ring-[color-mix(in_oklch,var(--highlight)_40%,transparent)] dark:border-zinc-600'
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

            <div className={cn(tabBarCls, 'mb-8')}>
              {(
                [
                  ['doctors', 'Bác sĩ'],
                  ['machines', 'Máy'],
                  ['procedures', 'Thủ thuật'],
                  ['patients', 'Bệnh nhân'],
                  ['output', 'Kết quả và báo cáo'],
                ] as const
              ).map(([id, label]) => (
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

            {mainTab === 'doctors' ? (
              <DoctorsEditor
                doctors={payload.masters.doctors}
                onChange={(doctors) => setPayload({ ...payload, masters: { ...payload.masters, doctors } })}
              />
            ) : null}
            {mainTab === 'machines' ? (
              <MachinesEditor
                machines={payload.masters.machines}
                onChange={(machines) => setPayload({ ...payload, masters: { ...payload.masters, machines } })}
              />
            ) : null}
            {mainTab === 'procedures' ? (
              <ProceduresEditor
                procedures={payload.masters.procedures}
                onChange={(procedures) => setPayload({ ...payload, masters: { ...payload.masters, procedures } })}
              />
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
                <div className={cn(tabBarCls, 'mb-6')}>
                  {(
                    [
                      ['results', 'Kết quả'],
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

                {outputTab === 'results' ? (
                  <ResultsTable
                    payload={payload}
                    onPatchPayload={(fn) => setPayload((p) => (p ? fn(p) : p))}
                    onUpdateAssignments={(next) => void persistAssignments(next)}
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
          </>
        )}
      </div>

      {sessionPickerOpen ? (
        <SessionPickerModal
          contexts={contextList}
          currentId={contextId}
          busy={busy}
          onClose={() => setSessionPickerOpen(false)}
          onPick={(id) => {
            setSessionPickerOpen(false)
            void loadContext(id)
          }}
          onRefresh={() => void refreshList()}
          onDelete={(id) => void deleteContextById(id)}
        />
      ) : null}
    </div>
  )
}

const shellBg = cn(
  'relative min-h-dvh text-foreground',
  'bg-[radial-gradient(ellipse_120%_80%_at_50%_-12%,color-mix(in_oklch,var(--highlight)_20%,transparent),transparent_58%)]',
  'bg-gradient-to-b from-[color-mix(in_oklch,var(--highlight)_10%,var(--background))] via-[var(--background)] to-[color-mix(in_oklch,var(--highlight)_7%,var(--muted))]',
  'dark:bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,color-mix(in_oklch,var(--highlight)_14%,transparent),transparent_52%)]',
  'dark:bg-gradient-to-b dark:from-[oklch(0.2_0.042_162)] dark:via-[var(--background)] dark:to-[oklch(0.14_0.038_168)]',
)

const panelCls = cn(
  'rounded-2xl border border-[color-mix(in_oklch,var(--border)_72%,var(--highlight)_28%)] bg-card/[0.93] p-6 shadow-[0_8px_36px_-14px_color-mix(in_oklch,var(--highlight-strong)_20%,transparent),0_1px_0_0_rgba(255,255,255,0.55)_inset] backdrop-blur-md ring-1 ring-white/65 sm:p-8',
  'dark:border-[color-mix(in_oklch,var(--border)_82%,var(--highlight)_18%)] dark:bg-card/90 dark:shadow-[0_16px_48px_-24px_rgba(0,0,0,0.55)] dark:ring-white/[0.07]',
)

const fieldLabelCls = cn(
  'mb-2.5 block text-xs font-semibold uppercase tracking-wide text-[var(--highlight-strong)] dark:text-[var(--highlight)]',
)

const subLabelCls =
  'mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground'

const tableWrapCls = cn(
  'overflow-x-auto rounded-2xl border border-[color-mix(in_oklch,var(--border)_75%,var(--highlight)_25%)] bg-card/[0.97] shadow-[0_6px_28px_-12px_color-mix(in_oklch,var(--highlight-strong)_14%,transparent)] ring-1 ring-white/50 dark:border-[color-mix(in_oklch,var(--border)_88%,var(--highlight)_12%)] dark:bg-card/88 dark:ring-white/[0.06]',
)

const theadCls = cn(
  'border-b border-[color-mix(in_oklch,var(--highlight)_18%,var(--border))]',
  'bg-[color-mix(in_oklch,var(--highlight)_7%,var(--muted))]',
  'text-xs font-semibold uppercase tracking-wide text-[var(--highlight-strong)]',
  'dark:border-[color-mix(in_oklch,var(--border)_90%,var(--highlight)_10%)] dark:bg-[color-mix(in_oklch,var(--highlight)_8%,var(--muted))] dark:text-[var(--highlight)]',
)

const btnPrimary = cn(
  'rounded-xl bg-gradient-to-br from-[var(--highlight-strong)] via-[color-mix(in_oklch,var(--highlight-strong)_65%,var(--highlight)_35%)] to-[var(--highlight)] px-5 py-3 text-sm font-semibold text-white shadow-md',
  'shadow-[0_6px_22px_-8px_color-mix(in_oklch,var(--highlight-strong)_50%,transparent)] transition',
  'hover:brightness-[1.06] hover:shadow-[0_8px_28px_-8px_color-mix(in_oklch,var(--highlight-strong)_45%,transparent)] active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100',
)

const btnSecondary = cn(
  'rounded-xl border border-[color-mix(in_oklch,var(--highlight)_30%,var(--border))] bg-card px-5 py-3 text-sm font-medium text-foreground shadow-sm transition',
  'hover:border-[color-mix(in_oklch,var(--highlight)_48%,var(--border))] hover:bg-[color-mix(in_oklch,var(--highlight)_9%,var(--card))]',
  'disabled:opacity-50 dark:border-[color-mix(in_oklch,var(--border)_85%,var(--highlight)_15%)] dark:bg-card/80 dark:hover:bg-[color-mix(in_oklch,var(--highlight)_12%,var(--card))]',
)

const btnDanger = cn(
  'rounded-xl border border-rose-200/95 bg-gradient-to-br from-rose-50 to-white px-5 py-3 text-sm font-semibold text-rose-900 shadow-sm transition',
  'hover:border-rose-300 hover:from-rose-100 disabled:opacity-50 dark:border-rose-900/45 dark:from-rose-950/50 dark:to-card/30 dark:text-rose-100 dark:hover:from-rose-950/65',
)

const inputCls = cn(
  'min-h-[2.75rem] w-full rounded-xl border border-[color-mix(in_oklch,var(--border)_68%,var(--highlight)_32%)] bg-card px-4 py-3 text-sm text-foreground outline-none transition',
  'placeholder:text-muted-foreground focus:border-[var(--highlight-strong)] focus:ring-2 focus:ring-[color-mix(in_oklch,var(--highlight)_28%,transparent)] focus:ring-offset-2 focus:ring-offset-background',
  'dark:border-[color-mix(in_oklch,var(--border)_80%,var(--highlight)_20%)] dark:bg-[color-mix(in_oklch,var(--card)_92%,var(--muted)_8%)] dark:focus:border-[var(--highlight)] dark:focus:ring-offset-background',
)

const tabBarCls = cn(
  'flex flex-wrap gap-2 rounded-xl border border-[color-mix(in_oklch,var(--border)_78%,var(--highlight)_22%)]',
  'bg-[color-mix(in_oklch,var(--highlight)_8%,var(--muted))] p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)] dark:border-[color-mix(in_oklch,var(--border)_85%,var(--highlight)_15%)] dark:bg-[color-mix(in_oklch,var(--highlight)_6%,var(--muted))] dark:shadow-none',
)

const tabBtn = cn(
  'rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition',
  'hover:bg-[color-mix(in_oklch,var(--highlight)_12%,transparent)] hover:text-foreground',
  'dark:hover:bg-[color-mix(in_oklch,var(--highlight)_10%,transparent)] dark:hover:text-foreground',
)

const tabBtnActive = cn(
  'border-[color-mix(in_oklch,var(--highlight)_42%,var(--border))] bg-card font-semibold text-[var(--highlight-strong)] shadow-sm ring-1 ring-[color-mix(in_oklch,var(--highlight)_22%,transparent)]',
  'dark:border-[color-mix(in_oklch,var(--highlight)_35%,var(--border))] dark:bg-[color-mix(in_oklch,var(--card)_95%,var(--muted)_5%)] dark:text-[var(--highlight)] dark:ring-[color-mix(in_oklch,var(--highlight)_18%,transparent)]',
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
      className='fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-5 backdrop-blur-md sm:p-6'
      role='dialog'
      aria-modal='true'
    >
      <div className='max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--border)_75%,var(--highlight)_25%)] bg-card shadow-2xl shadow-[0_24px_64px_-16px_color-mix(in_oklch,var(--highlight-strong)_25%,transparent)] ring-1 ring-white/60 dark:border-[color-mix(in_oklch,var(--border)_82%,var(--highlight)_18%)] dark:bg-card dark:ring-white/[0.08]'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-[color-mix(in_oklch,var(--highlight)_14%,var(--border))] bg-[color-mix(in_oklch,var(--highlight)_8%,var(--muted))] px-5 py-4 dark:border-[color-mix(in_oklch,var(--border)_88%,var(--highlight)_12%)] dark:bg-[color-mix(in_oklch,var(--highlight)_6%,var(--muted))]'>
          <h3 className='font-semibold text-[var(--highlight-strong)] dark:text-[var(--highlight)]'>Bản lịch đã lưu</h3>
          <button type='button' className={btnSecondary} onClick={onRefresh} disabled={busy}>
            Làm mới danh sách
          </button>
        </div>
        <ul className='max-h-[55vh] overflow-auto p-3 sm:p-4'>
          {contexts.map((c) => (
            <li key={c.id}>
              <div
                className={cn(
                  'flex items-stretch gap-3 rounded-xl px-2 py-2',
                  currentId === c.id && 'bg-[color-mix(in_oklch,var(--highlight)_12%,transparent)] dark:bg-zinc-800/80',
                )}
              >
                <button
                  type='button'
                  className='min-w-0 flex-1 rounded-lg px-3 py-2.5 text-left text-sm text-foreground hover:bg-[color-mix(in_oklch,var(--highlight)_10%,var(--muted))] dark:hover:bg-[color-mix(in_oklch,var(--highlight)_8%,var(--muted))]'
                  onClick={() => onPick(c.id)}
                >
                  <div className='font-medium'>{c.name || '(Chưa đặt tên)'}</div>
                  <div className='text-xs text-muted-foreground'>
                    {c.scheduling_date} · cập nhật {new Date(c.updated_at).toLocaleString('vi-VN')}
                  </div>
                </button>
                <button
                  type='button'
                  className='shrink-0 self-center rounded-lg border-2 border-red-200 bg-red-50/80 px-3 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-800/55 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50'
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
        <div className='border-t border-[color-mix(in_oklch,var(--border)_90%,var(--highlight)_10%)] p-4 dark:border-[color-mix(in_oklch,var(--border)_88%,var(--highlight)_12%)]'>
          <button type='button' className={cn(btnSecondary, 'w-full')} onClick={onClose}>
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
      <div className='flex flex-col gap-4 border-b border-[color-mix(in_oklch,var(--highlight)_15%,var(--border))] pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700/80'>
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
          <div key={d.id} className='rounded-xl border border-[color-mix(in_oklch,var(--highlight)_18%,var(--border))] bg-[color-mix(in_oklch,var(--highlight)_7%,var(--card))] p-4 sm:p-5 dark:border-[color-mix(in_oklch,var(--border)_82%,var(--highlight)_18%)] dark:bg-[color-mix(in_oklch,var(--card)_90%,var(--muted)_10%)]'>
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
      <div className='flex flex-col gap-4 border-b border-[color-mix(in_oklch,var(--highlight)_15%,var(--border))] pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700/80'>
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
          <div key={m.id} className='rounded-xl border border-[color-mix(in_oklch,var(--highlight)_18%,var(--border))] bg-[color-mix(in_oklch,var(--highlight)_7%,var(--card))] p-4 sm:p-5 dark:border-[color-mix(in_oklch,var(--border)_82%,var(--highlight)_18%)] dark:bg-[color-mix(in_oklch,var(--card)_90%,var(--muted)_10%)]'>
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
  onChange,
}: {
  procedures: SchedProcedure[]
  onChange: (p: SchedProcedure[]) => void
}) {
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
      },
    ])
  return (
    <section className={cn(panelCls, 'space-y-6')}>
      <div className='flex flex-col gap-4 border-b border-[color-mix(in_oklch,var(--highlight)_15%,var(--border))] pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700/80'>
        <h2 className='text-lg font-semibold text-foreground'>Danh sách thủ thuật</h2>
        <button type='button' className={btnSecondary} onClick={add}>
          Thêm thủ thuật
        </button>
      </div>
      <p className='text-sm leading-relaxed text-muted-foreground'>
        Thời lượng ca = thời gian làm cho một bệnh nhân. Thời gian bác sĩ tại chỗ = lúc bác sĩ phải có mặt trong ca. Bác sĩ
        chính nhiều người thì ghi A, B (dấu phẩy). Bác sĩ thay thế ghi kiểu B--C--D.
      </p>
      <div className='space-y-6'>
        {procedures.map((p, i) => (
          <div key={p.id} className='rounded-xl border border-[color-mix(in_oklch,var(--highlight)_18%,var(--border))] bg-[color-mix(in_oklch,var(--highlight)_7%,var(--card))] p-4 sm:p-5 dark:border-[color-mix(in_oklch,var(--border)_82%,var(--highlight)_18%)] dark:bg-[color-mix(in_oklch,var(--card)_90%,var(--muted)_10%)]'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <input
                className={inputCls}
                value={p.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder='Tên thủ thuật'
                autoComplete='off'
              />
              <input
                className={inputCls}
                value={p.machineType}
                onChange={(e) => update(i, { machineType: e.target.value })}
                placeholder='Loại máy (trùng tên ở mục Danh sách máy)'
                autoComplete='off'
              />
              <label className='block'>
                <span className={subLabelCls}>Thời lượng một ca (phút)</span>
                <input
                  type='text'
                  inputMode='numeric'
                  className={inputCls}
                  value={p.durationM == null ? '' : String(p.durationM)}
                  placeholder='Ví dụ: 20'
                  onChange={(e) => {
                    const v = e.target.value.trim()
                    if (v === '') update(i, { durationM: null })
                    else if (/^\d+$/.test(v)) update(i, { durationM: Number(v) })
                  }}
                />
              </label>
              <label className='block'>
                <span className={subLabelCls}>Thời gian bác sĩ phải có mặt (phút)</span>
                <input
                  type='text'
                  inputMode='numeric'
                  className={inputCls}
                  value={p.pillowM == null ? '' : String(p.pillowM)}
                  placeholder='Ví dụ: 5'
                  onChange={(e) => {
                    const v = e.target.value.trim()
                    if (v === '') update(i, { pillowM: null })
                    else if (/^\d+$/.test(v)) update(i, { pillowM: Number(v) })
                  }}
                />
              </label>
              <input
                className={inputCls}
                value={p.mainCodes}
                onChange={(e) => update(i, { mainCodes: e.target.value })}
                placeholder='Bác sĩ chính: A hoặc A,B'
                autoComplete='off'
              />
              <input
                className={inputCls}
                value={p.substituteCodes}
                onChange={(e) => update(i, { substituteCodes: e.target.value })}
                placeholder='Bác sĩ thay thế: B--C--D'
                autoComplete='off'
              />
              <label className='flex cursor-pointer items-start gap-3 text-sm sm:col-span-2 sm:items-center'>
                <input
                  type='checkbox'
                  className='mt-0.5 size-[1.125rem] shrink-0 rounded border-zinc-300 accent-[var(--highlight-strong)] sm:mt-0 dark:border-zinc-600'
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
      <div className='flex flex-col gap-4 border-b border-[color-mix(in_oklch,var(--highlight)_15%,var(--border))] pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700/80'>
        <h2 className='text-lg font-semibold text-foreground'>Danh sách bệnh nhân</h2>
        <button type='button' className={btnSecondary} onClick={add}>
          Thêm bệnh nhân
        </button>
      </div>
      <div className='space-y-6'>
        {patients.map((p, i) => (
          <div key={p.id} className='rounded-xl border border-[color-mix(in_oklch,var(--highlight)_18%,var(--border))] bg-[color-mix(in_oklch,var(--highlight)_7%,var(--card))] p-4 sm:p-5 dark:border-[color-mix(in_oklch,var(--border)_82%,var(--highlight)_18%)] dark:bg-[color-mix(in_oklch,var(--card)_90%,var(--muted)_10%)]'>
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
                  className='mt-0.5 size-[1.125rem] shrink-0 rounded border-zinc-300 accent-[var(--highlight-strong)] sm:mt-0 dark:border-zinc-600'
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
                    <label key={proc.id} className='flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs dark:border-zinc-700'>
                      <input
                        type='checkbox'
                        className='size-4 shrink-0 rounded accent-[var(--highlight-strong)]'
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
    <div className='mt-5 border-t border-[color-mix(in_oklch,var(--highlight)_12%,var(--border))] pt-5 dark:border-zinc-700/70'>
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
          className='text-sm font-medium text-[var(--highlight-strong)] underline decoration-[color-mix(in_oklch,var(--highlight)_45%,transparent)] underline-offset-2 dark:text-[var(--highlight)]'
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
            <th className='px-4 py-3'>Bệnh nhân</th>
            <th className='px-4 py-3'>Thủ thuật</th>
            <th className='px-4 py-3'>Bắt đầu ca</th>
            <th className='px-4 py-3'>Hết giờ bác sĩ có mặt</th>
            <th className='px-4 py-3'>Kết thúc ca</th>
            <th className='px-4 py-3'>Bác sĩ</th>
            <th className='px-4 py-3'>Máy</th>
            <th className='px-4 py-3'>Chỉnh nhanh</th>
          </tr>
        </thead>
        <tbody>
          {[...payload.assignments]
            .sort((a, b) => a.startM - b.startM)
            .map((a) => (
              <tr key={a.id} className='border-b border-border/65 dark:border-border/35'>
                <td className='px-4 py-3'>{patientById.get(a.patientId)?.name ?? a.patientId}</td>
                <td className='px-4 py-3'>{procById.get(a.procedureId)?.name ?? a.procedureId}</td>
                <td className='px-4 py-3'>
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
                <td className='px-4 py-3'>{minutesToLabel(a.pillowEndM)}</td>
                <td className='px-4 py-3'>{minutesToLabel(a.endM)}</td>
                <td className='px-4 py-3'>{a.doctorCodes.join(', ')}</td>
                <td className='px-4 py-3'>
                  {machineById.get(a.machineId)?.typeName} — {machineById.get(a.machineId)?.unitName}
                </td>
                <td className='px-4 py-3 align-top'>
                  <div className='flex max-w-[200px] flex-col gap-2'>
                    <button
                      type='button'
                      className='text-left text-xs font-semibold text-[var(--highlight-strong)] underline decoration-[color-mix(in_oklch,var(--highlight)_50%,transparent)] underline-offset-2 dark:text-[var(--highlight)]'
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
              <td colSpan={8} className='px-4 py-10 text-center text-zinc-500'>
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
            <th className='px-4 py-3'>Bệnh nhân</th>
            <th className='px-4 py-3'>Thủ thuật</th>
            <th className='px-4 py-3'>Lý do</th>
          </tr>
        </thead>
        <tbody>
          {unscheduled.map((u, i) => (
            <tr key={`${u.patientId}-${u.procedureId}-${i}`} className='border-b border-border/65 dark:border-border/35'>
              <td className='px-4 py-3'>{patientById.get(u.patientId)?.name ?? u.patientId}</td>
              <td className='px-4 py-3'>{procById.get(u.procedureId)?.name ?? u.procedureId}</td>
              <td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>{u.reason}</td>
            </tr>
          ))}
          {unscheduled.length === 0 ? (
            <tr>
              <td colSpan={3} className='px-4 py-10 text-center text-zinc-500'>
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
            <th className='px-4 py-3'>Thủ thuật</th>
            <th className='px-4 py-3'>Tổng số ca cần xếp</th>
            <th className='px-4 py-3'>Đã xếp</th>
            <th className='px-4 py-3'>Chưa xếp</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.procedureId} className='border-b border-border/65 dark:border-border/35'>
              <td className='px-4 py-3'>{r.name}</td>
              <td className='px-4 py-3'>{r.requested}</td>
              <td className='px-4 py-3'>{r.scheduled}</td>
              <td className='px-4 py-3'>{r.unscheduled}</td>
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
      <h3 className='mb-4 text-base font-semibold text-[var(--highlight-strong)] dark:text-[var(--highlight)]'>{title}</h3>
      <div className='overflow-x-auto rounded-xl border border-[color-mix(in_oklch,var(--highlight)_12%,var(--border))] dark:border-zinc-700/80'>
        <table className='min-w-full text-left text-sm'>
          <thead className={theadCls}>
            <tr>
              <th className='px-4 py-3'>Đối tượng</th>
              <th className='px-4 py-3'>Bệnh nhân</th>
              <th className='px-4 py-3'>Thủ thuật</th>
              <th className='px-4 py-3'>Bắt đầu</th>
              <th className='px-4 py-3'>Kết thúc</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className='border-b border-border/65 dark:border-border/35'>
                <td className='px-4 py-3'>{r.label}</td>
                <td className='px-4 py-3'>{r.patientName}</td>
                <td className='px-4 py-3'>{r.procedureName}</td>
                <td className='px-4 py-3'>
                  {minutesToLabel((r.startM ?? r.pillowStartM) as number)}
                </td>
                <td className='px-4 py-3'>{minutesToLabel((r.endM ?? r.pillowEndM) as number)}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-4 py-10 text-center text-zinc-500'>
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
      <h3 className='text-base font-semibold text-[var(--highlight-strong)] dark:text-[var(--highlight)]'>
        Biểu đồ thời gian bác sĩ phải có mặt
      </h3>
      {[...byDoctor.entries()].map(([doc, segs]) => (
        <div key={doc}>
          <div className='mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200'>{doc}</div>
          <div className='relative h-12 w-full rounded-xl border border-[color-mix(in_oklch,var(--highlight)_15%,var(--border))] bg-[color-mix(in_oklch,var(--highlight)_6%,var(--muted))] dark:border-zinc-600 dark:bg-zinc-800/80'>
            {segs.map((s, i) => {
              const left = ((s.pillowStartM - dayBounds.dayStart) / span) * 100
              const width = ((s.pillowEndM - s.pillowStartM) / span) * 100
              return (
                <div
                  key={i}
                  title={`${s.patientName} · ${s.procedureName}`}
                  className='absolute top-2 h-8 rounded-lg bg-gradient-to-r from-[var(--highlight-strong)] to-[var(--highlight)] text-center text-[10px] font-medium leading-8 text-white shadow-sm ring-1 ring-white/20'
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
            <th className='px-4 py-3'>Thủ thuật</th>
            <th className='px-4 py-3'>Ước tính còn xếp thêm được bao nhiêu ca</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.procedureId} className='border-b border-border/65 dark:border-border/35'>
              <td className='px-4 py-3'>{r.name}</td>
              <td className='px-4 py-3'>{r.estimate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className='px-4 py-3 text-xs text-zinc-500'>
        Con số tính sơ bộ theo chỗ trống của máy và thời gian bác sĩ còn lại trong ngày; chỉ để tham khảo.
      </p>
    </div>
  )
}
