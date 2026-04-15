/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { minutesToLabel } from '@/lib/scheduling/time'
import { cn } from '@/lib/styles'

interface TimerAssignment {
  id: string
  patientName: string
  procedureName: string
  durationM: number
  startM: number
  endM: number
  doctorNames: string
  machineLabel: string
}

interface ProcedureTimerProps {
  assignments: TimerAssignment[]
}

type TimerState = 'idle' | 'running' | 'paused' | 'done'

const STORAGE_KEY = 'sched-timer-state'

interface PersistedState {
  activeId: string | null
  elapsed: number
  state: TimerState
  ts: number
  completedIds: string[]
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedState
  } catch {
    return null
  }
}

function savePersisted(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* noop */ }
}

function playBeep(frequency = 880, duration = 200, count = 3) {
  try {
    const ctx = new AudioContext()
    let t = ctx.currentTime
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = frequency
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration / 1000)
      osc.start(t)
      osc.stop(t + duration / 1000)
      t += (duration + 100) / 1000
    }
  } catch { /* Web Audio not available */ }
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* ── SVG Countdown Ring ────────────────────────────────── */

const RING_SIZE = 180
const RING_STROKE = 10
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function CountdownRing({
  progress,
  remaining,
  timerState,
}: {
  progress: number
  remaining: number
  timerState: TimerState
}) {
  const offset = RING_CIRCUMFERENCE * (1 - Math.min(1, progress))
  const strokeColor =
    timerState === 'done'
      ? '#ef4444'
      : progress >= 0.9
        ? '#ef4444'
        : progress >= 0.75
          ? '#f59e0b'
          : '#22c55e'

  return (
    <div className='relative mx-auto' style={{ width: RING_SIZE, height: RING_SIZE }}>
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        className='-rotate-90'
      >
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill='none'
          stroke='var(--notika-border)'
          strokeWidth={RING_STROKE}
          opacity={0.3}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill='none'
          stroke={strokeColor}
          strokeWidth={RING_STROKE}
          strokeLinecap='round'
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className='transition-all duration-1000'
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className={cn(
          'font-mono text-3xl font-bold tabular-nums tracking-tight sm:text-4xl',
          timerState === 'done' ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--notika-text)]',
        )}>
          {timerState === 'done' ? 'HẾT GIỜ' : formatCountdown(remaining)}
        </span>
        {timerState !== 'done' && (
          <span className='mt-0.5 text-[11px] text-[var(--notika-muted)]'>
            còn lại
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Day Timeline ──────────────────────────────────────── */

function DayTimeline({
  assignments,
  activeId,
  completedIds,
  timerState,
}: {
  assignments: TimerAssignment[]
  activeId: string | null
  completedIds: Set<string>
  timerState: TimerState
}) {
  if (assignments.length === 0) return null

  const dayStart = Math.min(...assignments.map((a) => a.startM))
  const dayEnd = Math.max(...assignments.map((a) => a.endM))
  const span = dayEnd - dayStart || 1

  const hours: number[] = []
  const firstHour = Math.floor(dayStart / 60)
  const lastHour = Math.ceil(dayEnd / 60)
  for (let h = firstHour; h <= lastHour; h++) hours.push(h)

  return (
    <div className='rounded-2xl border border-[var(--notika-border)] bg-[var(--notika-card)] p-4'>
      <p className='mb-3 text-xs font-semibold text-[var(--notika-muted)]'>
        Timeline cả ngày · {minutesToLabel(dayStart)} – {minutesToLabel(dayEnd)}
      </p>
      <div className='relative h-10 rounded-lg bg-[var(--notika-border)]/20'>
        {/* Hour markers */}
        {hours.map((h) => {
          const m = h * 60
          const pct = ((m - dayStart) / span) * 100
          if (pct < 0 || pct > 100) return null
          return (
            <div
              key={h}
              className='absolute top-0 h-full border-l border-[var(--notika-border)]/30'
              style={{ left: `${pct}%` }}
            >
              <span className='absolute -top-4 -translate-x-1/2 text-[9px] tabular-nums text-[var(--notika-muted)]'>
                {h}:00
              </span>
            </div>
          )
        })}
        {/* Assignment blocks */}
        {assignments.map((a) => {
          const left = ((a.startM - dayStart) / span) * 100
          const width = ((a.endM - a.startM) / span) * 100
          const isActive = a.id === activeId && timerState !== 'idle'
          const isDone = completedIds.has(a.id)
          return (
            <div
              key={a.id}
              className={cn(
                'absolute top-1 h-8 rounded-md border text-[9px] font-medium leading-none transition-all',
                'flex items-center justify-center overflow-hidden px-0.5',
                isActive
                  ? 'z-10 border-[var(--notika-green)] bg-[var(--notika-green)] text-white shadow-md'
                  : isDone
                    ? 'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'border-[var(--notika-border)] bg-[var(--notika-card)] text-[var(--notika-muted)]',
              )}
              style={{ left: `${left}%`, width: `${Math.max(width, 1.5)}%` }}
              title={`${a.patientName} · ${a.procedureName} · ${minutesToLabel(a.startM)}–${minutesToLabel(a.endM)}`}
            >
              {width > 4 && <span className='truncate'>{a.patientName.split(' ').pop()}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Summary Stats ─────────────────────────────────────── */

function DaySummary({
  total,
  completed,
  totalMinutes,
  completedMinutes,
}: {
  total: number
  completed: number
  totalMinutes: number
  completedMinutes: number
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
      {[
        { label: 'Tổng ca', value: String(total), sub: `${totalMinutes} phút` },
        { label: 'Đã xong', value: String(completed), sub: `${completedMinutes} phút` },
        { label: 'Còn lại', value: String(total - completed), sub: `${totalMinutes - completedMinutes} phút` },
        { label: 'Tiến độ', value: `${pct}%`, sub: `${completed}/${total}` },
      ].map((item) => (
        <div key={item.label} className='rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-3 text-center'>
          <p className='text-2xl font-bold tabular-nums text-[var(--notika-text)]'>{item.value}</p>
          <p className='text-xs font-semibold text-[var(--notika-muted)]'>{item.label}</p>
          <p className='text-[10px] text-[var(--notika-muted)]'>{item.sub}</p>
        </div>
      ))}
    </div>
  )
}

/* ── Main Component ────────────────────────────────────── */

export function ProcedureTimer({ assignments }: ProcedureTimerProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [fullscreen, setFullscreen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const beeped75 = useRef(false)
  const beeped90 = useRef(false)
  const beepedDone = useRef(false)

  const activeAssignment = assignments.find((a) => a.id === activeId)
  const totalSeconds = activeAssignment ? activeAssignment.durationM * 60 : 0
  const remaining = Math.max(0, totalSeconds - elapsed)
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0

  const stats = useMemo(() => {
    const totalMinutes = assignments.reduce((s, a) => s + a.durationM, 0)
    const completedMinutes = assignments.filter((a) => completedIds.has(a.id)).reduce((s, a) => s + a.durationM, 0)
    return { total: assignments.length, completed: completedIds.size, totalMinutes, completedMinutes }
  }, [assignments, completedIds])

  const activeIdx = activeId ? assignments.findIndex((a) => a.id === activeId) : -1

  useEffect(() => {
    const p = loadPersisted()
    if (p) {
      if (p.completedIds?.length) setCompletedIds(new Set(p.completedIds))
      if (p.activeId && p.state !== 'done') {
        setActiveId(p.activeId)
        if (p.state === 'running') {
          const additionalElapsed = Math.floor((Date.now() - p.ts) / 1000)
          setElapsed(p.elapsed + additionalElapsed)
          setTimerState('running')
        } else {
          setElapsed(p.elapsed)
          setTimerState(p.state)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => e + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerState])

  useEffect(() => {
    savePersisted({
      activeId,
      elapsed,
      state: timerState,
      ts: Date.now(),
      completedIds: [...completedIds],
    })
  }, [activeId, elapsed, timerState, completedIds])

  useEffect(() => {
    if (!activeAssignment || timerState !== 'running') return
    if (progress >= 0.75 && !beeped75.current) {
      beeped75.current = true
      playBeep(660, 150, 1)
    }
    if (progress >= 0.90 && !beeped90.current) {
      beeped90.current = true
      playBeep(770, 150, 2)
    }
    if (remaining <= 0 && !beepedDone.current) {
      beepedDone.current = true
      playBeep(880, 200, 3)
      setTimerState('done')
      if (activeId) {
        setCompletedIds((prev) => new Set([...prev, activeId]))
      }
    }
  }, [progress, remaining, activeAssignment, timerState, activeId])

  const startTimer = useCallback((id: string) => {
    setActiveId(id)
    setElapsed(0)
    setTimerState('running')
    beeped75.current = false
    beeped90.current = false
    beepedDone.current = false
  }, [])

  const togglePause = useCallback(() => {
    setTimerState((s) => (s === 'running' ? 'paused' : 'running'))
  }, [])

  const resetTimer = useCallback(() => {
    setActiveId(null)
    setElapsed(0)
    setTimerState('idle')
    beeped75.current = false
    beeped90.current = false
    beepedDone.current = false
  }, [])

  const resetAll = useCallback(() => {
    resetTimer()
    setCompletedIds(new Set())
    savePersisted({ activeId: null, elapsed: 0, state: 'idle', ts: Date.now(), completedIds: [] })
  }, [resetTimer])

  const nextAssignment = useCallback(() => {
    if (!activeId) return
    const idx = assignments.findIndex((a) => a.id === activeId)
    if (idx >= 0 && idx < assignments.length - 1) {
      startTimer(assignments[idx + 1]!.id)
    } else {
      resetTimer()
    }
  }, [activeId, assignments, startTimer, resetTimer])

  const markDone = useCallback((id: string) => {
    setCompletedIds((prev) => new Set([...prev, id]))
  }, [])

  const progressColor = progress >= 0.9 ? 'text-rose-500' : progress >= 0.75 ? 'text-amber-500' : 'text-[var(--notika-green)]'
  const barColor = progress >= 0.9 ? 'bg-rose-500' : progress >= 0.75 ? 'bg-amber-500' : 'bg-[var(--notika-green)]'

  const timerContent = (
    <div className={cn('space-y-5', fullscreen && 'mx-auto max-w-3xl p-6')}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-base font-bold text-[var(--notika-text)]'>
          {fullscreen ? 'Thực hiện ca' : ''}
        </h3>
        <div className='flex items-center gap-2'>
          {completedIds.size > 0 && (
            <button
              type='button'
              className='rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
              onClick={resetAll}
            >
              Đặt lại tất cả
            </button>
          )}
          <button
            type='button'
            className='rounded-lg border border-[var(--notika-border)] px-3 py-1.5 text-xs font-medium text-[var(--notika-text)] transition hover:bg-[var(--muted)]'
            onClick={() => setFullscreen((f) => !f)}
          >
            {fullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          </button>
        </div>
      </div>

      {/* Day summary */}
      <DaySummary {...stats} />

      {/* Day timeline */}
      <DayTimeline
        assignments={assignments}
        activeId={activeId}
        completedIds={completedIds}
        timerState={timerState}
      />

      {/* Active timer — ring */}
      {activeAssignment && timerState !== 'idle' && (
        <div className={cn(
          'rounded-2xl border p-5 shadow-sm transition-colors',
          timerState === 'done'
            ? 'border-rose-300 bg-gradient-to-b from-rose-50 to-white dark:border-rose-800/50 dark:from-rose-950/30 dark:to-transparent'
            : progress >= 0.9
              ? 'border-amber-300 bg-gradient-to-b from-amber-50 to-white dark:border-amber-800/50 dark:from-amber-950/30 dark:to-transparent'
              : 'border-[var(--notika-green)]/30 bg-gradient-to-b from-emerald-50/50 to-white dark:border-emerald-800/40 dark:from-emerald-950/20 dark:to-transparent',
        )}>
          {/* Info header */}
          <div className='mb-4 flex items-center justify-between gap-3'>
            <div className='min-w-0'>
              <p className='flex items-center gap-2'>
                <span className='inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--notika-green)] text-xs font-bold text-white'>
                  {activeIdx + 1}
                </span>
                <span className='truncate text-base font-bold text-[var(--notika-text)]'>
                  {activeAssignment.patientName}
                </span>
              </p>
              <p className='mt-1 pl-9 text-xs text-[var(--notika-muted)]'>
                {activeAssignment.procedureName} · {activeAssignment.doctorNames} · {activeAssignment.machineLabel}
              </p>
            </div>
            <span className='shrink-0 rounded-xl bg-[var(--notika-green-soft)] px-3 py-1.5 text-xs font-bold tabular-nums text-[var(--notika-green)]'>
              {minutesToLabel(activeAssignment.startM)} – {minutesToLabel(activeAssignment.endM)}
            </span>
          </div>

          {/* Ring + info */}
          <div className='flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8'>
            <CountdownRing progress={progress} remaining={remaining} timerState={timerState} />
            <div className='flex flex-col items-center gap-2 text-center sm:items-start sm:text-left'>
              <div className='text-sm text-[var(--notika-muted)]'>
                Tổng thời gian: <span className='font-semibold text-[var(--notika-text)]'>{activeAssignment.durationM} phút</span>
              </div>
              <div className='text-sm text-[var(--notika-muted)]'>
                Đã trôi: <span className='font-semibold text-[var(--notika-text)]'>{formatCountdown(elapsed)}</span>
              </div>
              {/* Phase indicator */}
              <div className='mt-2 flex items-center gap-1.5'>
                {[
                  { pct: 0.75, label: '75%', color: 'bg-emerald-400' },
                  { pct: 0.90, label: '90%', color: 'bg-amber-400' },
                  { pct: 1, label: '100%', color: 'bg-rose-400' },
                ].map((phase) => (
                  <div key={phase.label} className='flex items-center gap-1'>
                    <span className={cn(
                      'inline-block h-2.5 w-2.5 rounded-full transition-opacity',
                      phase.color,
                      progress >= phase.pct ? 'opacity-100' : 'opacity-20',
                    )} />
                    <span className={cn(
                      'text-[10px] font-semibold transition-opacity',
                      progress >= phase.pct ? 'text-[var(--notika-text)]' : 'text-[var(--notika-muted)] opacity-40',
                    )}>
                      {phase.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar (thinner, below ring) */}
          <div className='mx-auto mt-5 h-2 w-full max-w-md overflow-hidden rounded-full bg-[var(--notika-border)]/30'>
            <div
              className={cn('h-full rounded-full transition-all duration-1000', barColor)}
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>

          {/* Controls */}
          <div className='mt-5 flex flex-wrap items-center justify-center gap-3'>
            {timerState !== 'done' && (
              <button
                type='button'
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold shadow-sm transition',
                  timerState === 'running'
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-[var(--notika-green)] text-white hover:bg-[var(--notika-green)]/90',
                )}
                onClick={togglePause}
              >
                {timerState === 'running' ? (
                  <><PauseIcon /> Tạm dừng</>
                ) : (
                  <><PlayIcon /> Tiếp tục</>
                )}
              </button>
            )}
            <button
              type='button'
              className='inline-flex items-center gap-2 rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-5 py-3 text-sm font-medium text-[var(--notika-text)] shadow-sm transition hover:bg-[var(--muted)]'
              onClick={resetTimer}
            >
              <ResetIcon /> Đặt lại
            </button>
            {timerState === 'done' && (
              <button
                type='button'
                className='inline-flex items-center gap-2 rounded-xl bg-[var(--notika-green)] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--notika-green)]/90'
                onClick={nextAssignment}
              >
                <NextIcon /> Ca tiếp theo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {timerState === 'idle' && assignments.length > 0 && (
        <div className='rounded-2xl border border-dashed border-[var(--notika-border)] px-6 py-8 text-center'>
          <p className='text-sm text-[var(--notika-muted)]'>
            Bấm <span className='font-semibold text-[var(--notika-green)]'>Bắt đầu</span> ở ca bất kỳ để khởi động đồng hồ đếm ngược
          </p>
        </div>
      )}

      {/* Assignment list */}
      <div className='overflow-hidden rounded-2xl border border-[var(--notika-border)] shadow-sm'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-[var(--notika-border)] bg-[#f3f5f7] dark:bg-[var(--muted)]'>
              <th className='w-10 px-2 py-2.5 text-center font-semibold text-[var(--notika-muted)]'>#</th>
              <th className='px-3 py-2.5 text-left font-semibold text-[var(--notika-muted)]'>Bệnh nhân</th>
              <th className='hidden px-3 py-2.5 text-left font-semibold text-[var(--notika-muted)] sm:table-cell'>Thủ thuật</th>
              <th className='px-3 py-2.5 text-center font-semibold text-[var(--notika-muted)]'>Giờ</th>
              <th className='px-2 py-2.5 text-center font-semibold text-[var(--notika-muted)]'>TG</th>
              <th className='px-3 py-2.5 text-center font-semibold text-[var(--notika-muted)]'>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a, idx) => {
              const isActive = a.id === activeId && timerState !== 'idle'
              const isDone = completedIds.has(a.id)
              return (
                <tr key={a.id} className={cn(
                  'border-b border-[var(--notika-border)]/30 transition',
                  isActive
                    ? 'bg-[var(--notika-green-soft)] dark:bg-[var(--notika-green)]/10'
                    : isDone
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/10'
                      : 'bg-[var(--notika-card)]',
                )}>
                  <td className='px-2 py-2.5 text-center'>
                    <span className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                      isActive
                        ? 'bg-[var(--notika-green)] text-white'
                        : isDone
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-[var(--notika-border)]/40 text-[var(--notika-muted)]',
                    )}>
                      {isDone ? (
                        <CheckIcon />
                      ) : (
                        idx + 1
                      )}
                    </span>
                  </td>
                  <td className='px-3 py-2.5'>
                    <div className={cn('font-medium', isDone ? 'text-emerald-700 line-through dark:text-emerald-300' : 'text-[var(--notika-text)]')}>
                      {a.patientName}
                    </div>
                    <div className='text-xs text-[var(--notika-muted)] sm:hidden'>
                      {a.procedureName}
                    </div>
                  </td>
                  <td className='hidden px-3 py-2.5 sm:table-cell'>
                    <div className={cn(isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--notika-text)]')}>{a.procedureName}</div>
                    <div className='text-xs text-[var(--notika-muted)]'>{a.doctorNames} · {a.machineLabel}</div>
                  </td>
                  <td className='px-3 py-2.5 text-center text-xs tabular-nums text-[var(--notika-text)]'>
                    {minutesToLabel(a.startM)}–{minutesToLabel(a.endM)}
                  </td>
                  <td className='px-2 py-2.5 text-center text-xs font-semibold text-[var(--notika-text)]'>
                    {a.durationM}&apos;
                  </td>
                  <td className='px-3 py-2.5 text-center'>
                    {isActive ? (
                      <span className={cn(
                        'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold',
                        timerState === 'done'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                          : timerState === 'paused'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-[var(--notika-green-soft)] text-[var(--notika-green)]',
                      )}>
                        <span className={cn('inline-block h-1.5 w-1.5 rounded-full', timerState === 'running' && 'animate-pulse', barColor)} />
                        {timerState === 'done' ? 'Xong' : timerState === 'paused' ? 'Tạm dừng' : formatCountdown(remaining)}
                      </span>
                    ) : isDone ? (
                      <span className='inline-block rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'>
                        Hoàn thành
                      </span>
                    ) : (
                      <div className='flex items-center justify-center gap-1'>
                        <button
                          type='button'
                          className='rounded-lg bg-[var(--notika-green)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--notika-green)]/90'
                          onClick={() => startTimer(a.id)}
                        >
                          Bắt đầu
                        </button>
                        <button
                          type='button'
                          className='rounded-lg border border-[var(--notika-border)] px-2 py-1.5 text-xs text-[var(--notika-muted)] transition hover:bg-[var(--muted)]'
                          onClick={() => markDone(a.id)}
                          title='Đánh dấu đã xong'
                        >
                          <CheckIcon />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (fullscreen) {
    return (
      <div className='fixed inset-0 z-50 overflow-auto bg-[var(--notika-bg)]'>
        {timerContent}
      </div>
    )
  }

  return timerContent
}

/* ── Inline SVG Icons ──────────────────────────────────── */

function PlayIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
      <path d='M8 5v14l11-7z' />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
      <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
      <path d='M1 4v6h6' />
      <path d='M3.51 15a9 9 0 1 0 2.13-9.36L1 10' />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
      <path d='M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z' />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'>
      <polyline points='20 6 9 17 4 12' />
    </svg>
  )
}
