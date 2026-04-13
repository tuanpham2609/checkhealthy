/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import type {
  SchedAssignment,
  SchedDoctor,
  SchedMachine,
  SchedMasters,
  SchedPatient,
  SchedProcedure,
  SchedSettings,
  UnscheduledItem,
} from '@/lib/scheduling/types'
import {
  intervalInsideDoctorShift,
  intervalsOverlap,
  isEmptyWindow,
  windowOverlapsInterval,
} from '@/lib/scheduling/time'

export type ScheduleMode = 'full' | 'preserve'

interface PillowSeg {
  startM: number
  endM: number
  procedureId: string
}

function splitCommaCodes(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function splitSubstitutes(raw: string): string[] {
  return raw
    .split('--')
    .map((s) => s.trim())
    .filter(Boolean)
}

function* doctorCodeAttempts(mainCodes: string, substituteCodes: string): Generator<string[]> {
  const mains = splitCommaCodes(mainCodes)
  if (mains.length === 0) return
  const subs = splitSubstitutes(substituteCodes)
  yield mains
  if (subs.length === 0) return
  if (mains.length === 1) {
    for (const s of subs) yield [s]
    return
  }
  for (const s of subs) {
    yield [s, ...mains.slice(1)]
    yield [...mains.slice(0, -1), s]
  }
}

function doctorByCode(doctors: SchedDoctor[], code: string): SchedDoctor | undefined {
  return doctors.find((d) => d.code.toLowerCase() === code.toLowerCase())
}

function hasMachineConflict(
  machine: SchedMachine,
  startM: number,
  endM: number,
  extra: { startM: number; endM: number }[],
): boolean {
  for (const b of machine.busy) {
    if (windowOverlapsInterval(b, startM, endM)) return true
  }
  for (const x of extra) {
    if (intervalsOverlap(startM, endM, x.startM, x.endM)) return true
  }
  return false
}

function hasPatientConflict(patient: SchedPatient, startM: number, endM: number): boolean {
  for (const b of patient.busy) {
    if (windowOverlapsInterval(b, startM, endM)) return true
  }
  return false
}

function pillowGapOk(
  existing: PillowSeg[],
  procedureId: string,
  pillowStart: number,
  pillowEnd: number,
  settings: SchedSettings,
): boolean {
  const gap = settings.allowAdjacentPillow ? 0 : Math.max(0, settings.pillowGapMinutes)
  const all: PillowSeg[] = [...existing, { startM: pillowStart, endM: pillowEnd, procedureId }]
  const sorted = [...all].sort((a, b) => a.startM - b.startM)
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1]
    const cur = sorted[i]
    if (!prev || !cur) continue
    if (prev.procedureId === cur.procedureId) continue
    if (cur.startM < prev.endM + gap) return false
  }
  return true
}

function collectPillowSegsForDoctor(doctorCode: string, assignments: SchedAssignment[]): PillowSeg[] {
  const out: PillowSeg[] = []
  for (const a of assignments) {
    if (!a.doctorCodes.map((c) => c.toLowerCase()).includes(doctorCode.toLowerCase())) continue
    out.push({ startM: a.startM, endM: a.pillowEndM, procedureId: a.procedureId })
  }
  return out
}

export function inferDayBounds(masters: SchedMasters): { dayStart: number; dayEnd: number } {
  let lo = 24 * 60
  let hi = 0
  for (const d of masters.doctors) {
    const am = { startM: d.amStartM, endM: d.amEndM }
    const pm = { startM: d.pmStartM, endM: d.pmEndM }
    if (!isEmptyWindow(am) && d.amStartM !== null && d.amEndM !== null) {
      lo = Math.min(lo, d.amStartM)
      hi = Math.max(hi, d.amEndM)
    }
    if (!isEmptyWindow(pm) && d.pmStartM !== null && d.pmEndM !== null) {
      lo = Math.min(lo, d.pmStartM)
      hi = Math.max(hi, d.pmEndM)
    }
  }
  if (lo >= hi) {
    return { dayStart: 7 * 60, dayEnd: 18 * 60 }
  }
  return { dayStart: lo, dayEnd: hi }
}

function pickMachine(
  machines: SchedMachine[],
  typeName: string,
  startM: number,
  endM: number,
  machineExtras: Map<string, { startM: number; endM: number }[]>,
): SchedMachine | null {
  const list = machines.filter((m) => m.typeName.trim() === typeName.trim())
  const sorted = [...list].sort((a, b) => a.unitName.localeCompare(b.unitName, 'vi'))
  for (const m of sorted) {
    const extra = machineExtras.get(m.id) ?? []
    if (!hasMachineConflict(m, startM, endM, extra)) return m
  }
  return null
}

function tryPlace(
  masters: SchedMasters,
  procedure: SchedProcedure,
  patient: SchedPatient,
  doctorCodes: string[],
  startM: number,
  assignments: SchedAssignment[],
  machineExtras: Map<string, { startM: number; endM: number }[]>,
  settings: SchedSettings,
): SchedAssignment | null {
  const dur = procedure.durationM
  const pil = procedure.pillowM
  if (dur === null || dur <= 0 || pil === null || pil < 0) return null
  const pillowEnd = startM + pil
  const endM = startM + dur
  if (pillowEnd > endM) return null

  const doctors = masters.doctors
  for (const code of doctorCodes) {
    const doc = doctorByCode(doctors, code)
    if (!doc) return null
    if (!intervalInsideDoctorShift(startM, pillowEnd, doc.amStartM, doc.amEndM, doc.pmStartM, doc.pmEndM)) return null
    const segs = collectPillowSegsForDoctor(code, assignments)
    if (!pillowGapOk(segs, procedure.id, startM, pillowEnd, settings)) return null
    for (const b of doc.busy) {
      if (windowOverlapsInterval(b, startM, pillowEnd)) return null
    }
    for (const a of assignments) {
      if (!a.doctorCodes.map((c) => c.toLowerCase()).includes(code.toLowerCase())) continue
      if (intervalsOverlap(startM, pillowEnd, a.startM, a.pillowEndM)) return null
    }
  }

  if (hasPatientConflict(patient, startM, endM)) return null
  for (const a of assignments) {
    if (a.patientId !== patient.id) continue
    if (intervalsOverlap(startM, endM, a.startM, a.endM)) return null
  }

  const machine = pickMachine(masters.machines, procedure.machineType, startM, endM, machineExtras)
  if (!machine) return null

  return {
    id: crypto.randomUUID(),
    patientId: patient.id,
    procedureId: procedure.id,
    machineId: machine.id,
    doctorCodes,
    startM,
    pillowEndM: pillowEnd,
    endM,
    locked: false,
  }
}

function findSlot(
  masters: SchedMasters,
  procedure: SchedProcedure,
  patient: SchedPatient,
  assignments: SchedAssignment[],
  machineExtras: Map<string, { startM: number; endM: number }[]>,
  settings: SchedSettings,
): SchedAssignment | null {
  const duration = procedure.durationM
  if (duration === null || duration <= 0) return null

  const { dayStart, dayEnd } = inferDayBounds(masters)
  const admission = patient.admissionM ?? 0
  const startFrom = Math.max(dayStart, admission)

  for (const codes of doctorCodeAttempts(procedure.mainCodes, procedure.substituteCodes)) {
    for (let t = startFrom; t <= dayEnd - duration; t += 1) {
      const placed = tryPlace(masters, procedure, patient, codes, t, assignments, machineExtras, settings)
      if (placed) return placed
    }
  }
  return null
}

export function runSchedule(
  masters: SchedMasters,
  settings: SchedSettings,
  mode: ScheduleMode,
  existing: SchedAssignment[],
): { assignments: SchedAssignment[]; unscheduled: UnscheduledItem[] } {
  const proceduresById = new Map(masters.procedures.map((p) => [p.id, p]))

  let assignments: SchedAssignment[] =
    mode === 'preserve'
      ? existing.map((a) => ({ ...a, locked: true }))
      : []

  const machineExtras = new Map<string, { startM: number; endM: number }[]>()
  const refreshExtras = () => {
    machineExtras.clear()
    for (const a of assignments) {
      const list = machineExtras.get(a.machineId) ?? []
      list.push({ startM: a.startM, endM: a.endM })
      machineExtras.set(a.machineId, list)
    }
  }
  refreshExtras()

  type Job = { patient: SchedPatient; procedure: SchedProcedure }
  const jobs: Job[] = []
  for (const p of masters.patients) {
    for (const pid of p.procedureIds) {
      const proc = proceduresById.get(pid)
      if (!proc) continue
      jobs.push({ patient: p, procedure: proc })
    }
  }

  jobs.sort((a, b) => {
    if (a.procedure.priority !== b.procedure.priority) return a.procedure.priority ? -1 : 1
    if (a.patient.highPriority !== b.patient.highPriority) return a.patient.highPriority ? -1 : 1
    const aa = a.patient.admissionM ?? 0
    const bb = b.patient.admissionM ?? 0
    if (aa !== bb) return aa - bb
    return a.procedure.name.localeCompare(b.procedure.name, 'vi')
  })

  const unscheduled: UnscheduledItem[] = []
  const scheduledKeys = new Set<string>()

  for (const a of assignments) {
    scheduledKeys.add(`${a.patientId}:${a.procedureId}`)
  }

  for (const job of jobs) {
    const key = `${job.patient.id}:${job.procedure.id}`
    if (scheduledKeys.has(key)) continue

    const proc = job.procedure
    if (proc.durationM === null || proc.durationM <= 0) {
      unscheduled.push({
        patientId: job.patient.id,
        procedureId: job.procedure.id,
        reason: 'Thiếu thời lượng thủ thuật (phút)',
      })
      continue
    }
    if (proc.pillowM === null || proc.pillowM < 0) {
      unscheduled.push({
        patientId: job.patient.id,
        procedureId: job.procedure.id,
        reason: 'Thiếu thời gian gối (phút)',
      })
      continue
    }
    if (!proc.mainCodes.trim()) {
      unscheduled.push({
        patientId: job.patient.id,
        procedureId: job.procedure.id,
        reason: 'Thiếu mã bác sĩ chính',
      })
      continue
    }
    if (!proc.machineType.trim()) {
      unscheduled.push({
        patientId: job.patient.id,
        procedureId: job.procedure.id,
        reason: 'Thiếu loại máy yêu cầu',
      })
      continue
    }

    const next = findSlot(masters, job.procedure, job.patient, assignments, machineExtras, settings)
    if (!next) {
      unscheduled.push({
        patientId: job.patient.id,
        procedureId: job.procedure.id,
        reason: 'Không tìm được khung giờ thỏa bác sĩ / máy / lịch bận / giờ làm việc',
      })
      continue
    }
    assignments = [...assignments, next]
    scheduledKeys.add(key)
    refreshExtras()
  }

  return { assignments, unscheduled }
}
