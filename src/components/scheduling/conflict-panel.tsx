/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { minutesToLabel } from '@/lib/scheduling/time'
import { appToast } from '@/lib/app-toast'
import { cn } from '@/lib/styles'

interface CrossAssignment {
  doctorCodes: string[]
  machineId: string
  startM: number
  pillowEndM: number
  endM: number
  patientId: string
  procedureId: string
}

interface CrossResult {
  contextId: string
  contextName: string
  userName: string
  assignments: CrossAssignment[]
}

interface Conflict {
  type: 'doctor' | 'machine'
  code: string
  otherUser: string
  otherContext: string
  myStart: number
  myEnd: number
  otherStart: number
  otherEnd: number
}

function overlap(a0: number, a1: number, b0: number, b1: number): boolean {
  return Math.max(a0, b0) < Math.min(a1, b1)
}

interface ConflictPanelProps {
  schedulingDate: string
  contextId: string
  assignments: { doctorCodes: string[]; machineId: string; startM: number; pillowEndM: number; endM: number }[]
  masters: { doctors: { code: string; name: string }[]; machines: { id: string; typeName: string; unitName: string }[] }
}

export function ConflictPanel({ schedulingDate, contextId, assignments, masters }: ConflictPanelProps) {
  const [crossData, setCrossData] = useState<CrossResult[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCrossData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/scheduling/cross-check?date=${schedulingDate}&excludeContextId=${contextId}`)
      if (!res.ok) return
      const data = (await res.json()) as { results: CrossResult[] }
      setCrossData(data.results ?? [])
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [schedulingDate, contextId])

  useEffect(() => {
    if (schedulingDate && contextId) {
      void fetchCrossData()
    }
  }, [schedulingDate, contextId, fetchCrossData])

  const conflicts: Conflict[] = []

  for (const ext of crossData) {
    for (const myA of assignments) {
      for (const extA of ext.assignments) {
        for (const myCode of myA.doctorCodes) {
          for (const extCode of extA.doctorCodes) {
            if (myCode.toLowerCase() === extCode.toLowerCase()) {
              if (overlap(myA.startM, myA.pillowEndM, extA.startM, extA.pillowEndM)) {
                conflicts.push({
                  type: 'doctor',
                  code: myCode,
                  otherUser: ext.userName,
                  otherContext: ext.contextName,
                  myStart: myA.startM,
                  myEnd: myA.pillowEndM,
                  otherStart: extA.startM,
                  otherEnd: extA.pillowEndM,
                })
              }
            }
          }
        }
        if (myA.machineId === extA.machineId) {
          if (overlap(myA.startM, myA.endM, extA.startM, extA.endM)) {
            const machine = masters.machines.find((m) => m.id === myA.machineId)
            conflicts.push({
              type: 'machine',
              code: machine ? `${machine.typeName} - ${machine.unitName}` : myA.machineId,
              otherUser: ext.userName,
              otherContext: ext.contextName,
              myStart: myA.startM,
              myEnd: myA.endM,
              otherStart: extA.startM,
              otherEnd: extA.endM,
            })
          }
        }
      }
    }
  }

  const uniqueConflicts = conflicts.filter((c, i, arr) =>
    arr.findIndex((x) => x.type === c.type && x.code === c.code && x.myStart === c.myStart && x.otherStart === c.otherStart) === i,
  )

  if (loading) return null

  if (crossData.length === 0) return null

  const otherTotal = crossData.reduce((acc, c) => acc + c.assignments.length, 0)

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2 text-xs text-[var(--notika-muted)]'>
        <span>Lịch cùng ngày từ người khác: {otherTotal} ca</span>
        <button
          type='button'
          className='rounded-lg px-2 py-1 text-[var(--notika-green)] hover:bg-[var(--notika-green-soft)]'
          onClick={() => void fetchCrossData()}
        >
          Làm mới
        </button>
      </div>

      {uniqueConflicts.length > 0 ? (
        <div className='rounded-2xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-800/40 dark:bg-rose-950/20'>
          <h4 className='mb-3 flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-300'>
            <span className='inline-block h-2 w-2 rounded-full bg-rose-500' />
            {uniqueConflicts.length} xung đột với lịch người khác
          </h4>
          <ul className='space-y-2'>
            {uniqueConflicts.map((c, i) => {
              const docName = c.type === 'doctor'
                ? masters.doctors.find((d) => d.code.toLowerCase() === c.code.toLowerCase())?.name
                : null
              return (
                <li key={i} className='flex flex-col gap-0.5 rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs dark:border-rose-900/30 dark:bg-rose-950/30'>
                  <span className='font-semibold text-rose-800 dark:text-rose-200'>
                    {c.type === 'doctor' ? `BS ${docName ?? c.code} (${c.code})` : `Máy ${c.code}`}
                  </span>
                  <span className='text-rose-600 dark:text-rose-400'>
                    Bạn: {minutesToLabel(c.myStart)} – {minutesToLabel(c.myEnd)}
                    {' | '}
                    {c.otherUser || c.otherContext}: {minutesToLabel(c.otherStart)} – {minutesToLabel(c.otherEnd)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : otherTotal > 0 ? (
        <div className='rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs font-medium text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-300'>
          Không có xung đột với lịch của người khác
        </div>
      ) : null}
    </div>
  )
}

export function ConflictBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className='ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white'>
      {count}
    </span>
  )
}
