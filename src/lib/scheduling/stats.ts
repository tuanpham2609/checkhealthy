/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { inferDayBounds } from '@/lib/scheduling/engine'
import type { SchedAssignment, SchedMasters, SchedProcedure, UnscheduledItem } from '@/lib/scheduling/types'

export interface ProcedureStatRow {
  procedureId: string
  name: string
  requested: number
  scheduled: number
  unscheduled: number
}

export function countRequestedByProcedure(masters: SchedMasters): Map<string, number> {
  const map = new Map<string, number>()
  for (const p of masters.patients) {
    for (const pid of p.procedureIds) {
      map.set(pid, (map.get(pid) ?? 0) + 1)
    }
  }
  return map
}

export function countScheduledByProcedure(assignments: SchedAssignment[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const a of assignments) {
    map.set(a.procedureId, (map.get(a.procedureId) ?? 0) + 1)
  }
  return map
}

export function buildProcedureStats(
  masters: SchedMasters,
  assignments: SchedAssignment[],
  unscheduled: UnscheduledItem[],
): ProcedureStatRow[] {
  const requested = countRequestedByProcedure(masters)
  const scheduled = countScheduledByProcedure(assignments)
  const unsMap = new Map<string, number>()
  for (const u of unscheduled) {
    unsMap.set(u.procedureId, (unsMap.get(u.procedureId) ?? 0) + 1)
  }
  const rows: ProcedureStatRow[] = []
  for (const proc of masters.procedures) {
    const req = requested.get(proc.id) ?? 0
    const sch = scheduled.get(proc.id) ?? 0
    const uns = unsMap.get(proc.id) ?? 0
    rows.push({
      procedureId: proc.id,
      name: proc.name,
      requested: req,
      scheduled: sch,
      unscheduled: uns,
    })
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

export interface DoctorDaySlice {
  doctorCode: string
  doctorName: string
  procedureId: string
  procedureName: string
  patientName: string
  pillowStartM: number
  pillowEndM: number
}

export function buildDoctorDaySlices(
  masters: SchedMasters,
  assignments: SchedAssignment[],
): DoctorDaySlice[] {
  const procById = new Map(masters.procedures.map((p) => [p.id, p]))
  const patientById = new Map(masters.patients.map((p) => [p.id, p]))
  const doctorByCode = new Map(masters.doctors.map((d) => [d.code.toLowerCase(), d]))
  const out: DoctorDaySlice[] = []
  for (const a of assignments) {
    const proc = procById.get(a.procedureId)
    const patient = patientById.get(a.patientId)
    for (const code of a.doctorCodes) {
      const doc = doctorByCode.get(code.toLowerCase())
      out.push({
        doctorCode: code,
        doctorName: doc?.name ?? code,
        procedureId: a.procedureId,
        procedureName: proc?.name ?? a.procedureId,
        patientName: patient?.name ?? a.patientId,
        pillowStartM: a.startM,
        pillowEndM: a.pillowEndM,
      })
    }
  }
  return out.sort((x, y) => x.pillowStartM - y.pillowStartM || x.doctorName.localeCompare(y.doctorName, 'vi'))
}

export interface MachineDaySlice {
  machineId: string
  label: string
  patientName: string
  procedureName: string
  startM: number
  endM: number
}

export function buildMachineDaySlices(masters: SchedMasters, assignments: SchedAssignment[]): MachineDaySlice[] {
  const procById = new Map(masters.procedures.map((p) => [p.id, p]))
  const patientById = new Map(masters.patients.map((p) => [p.id, p]))
  const machineById = new Map(masters.machines.map((m) => [m.id, m]))
  return assignments
    .map((a) => {
      const proc = procById.get(a.procedureId)
      const patient = patientById.get(a.patientId)
      const machine = machineById.get(a.machineId)
      const label = machine ? `${machine.typeName} — ${machine.unitName}` : a.machineId
      return {
        machineId: a.machineId,
        label,
        patientName: patient?.name ?? a.patientId,
        procedureName: proc?.name ?? a.procedureId,
        startM: a.startM,
        endM: a.endM,
      }
    })
    .sort((x, y) => x.startM - y.startM || x.label.localeCompare(y.label, 'vi'))
}

export function estimateExtraSlots(
  masters: SchedMasters,
  assignments: SchedAssignment[],
  procedures: SchedProcedure[],
): { procedureId: string; name: string; estimate: number }[] {
  const { dayStart, dayEnd } = inferDayBounds(masters)
  const dayLen = Math.max(0, dayEnd - dayStart)
  if (dayLen <= 0) return []

  const usedMachineMinutes = new Map<string, number>()
  for (const m of masters.machines) usedMachineMinutes.set(m.id, 0)
  for (const a of assignments) {
    usedMachineMinutes.set(a.machineId, (usedMachineMinutes.get(a.machineId) ?? 0) + (a.endM - a.startM))
  }

  const usedDoctorPillow = new Map<string, number>()
  for (const d of masters.doctors) usedDoctorPillow.set(d.code.toLowerCase(), 0)
  for (const a of assignments) {
    const len = a.pillowEndM - a.startM
    for (const c of a.doctorCodes) {
      const k = c.toLowerCase()
      usedDoctorPillow.set(k, (usedDoctorPillow.get(k) ?? 0) + len)
    }
  }

  const out: { procedureId: string; name: string; estimate: number }[] = []
  for (const proc of procedures) {
    const machinesOfType = masters.machines.filter((m) => m.typeName.trim() === proc.machineType.trim())
    const dur = proc.durationM
    const pil = proc.pillowM
    if (machinesOfType.length === 0 || dur === null || dur <= 0) {
      out.push({ procedureId: proc.id, name: proc.name, estimate: 0 })
      continue
    }
    let capSum = 0
    for (const m of machinesOfType) {
      const used = usedMachineMinutes.get(m.id) ?? 0
      const free = Math.max(0, dayLen * 0.85 - used)
      capSum += Math.floor(free / dur)
    }
    const mains = proc.mainCodes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    let docBottleneck = Number.POSITIVE_INFINITY
    for (const code of mains) {
      const used = usedDoctorPillow.get(code.toLowerCase()) ?? 0
      const free = Math.max(0, dayLen * 0.75 - used)
      const per = Math.max(1, pil ?? 1)
      docBottleneck = Math.min(docBottleneck, Math.floor(free / per))
    }
    if (mains.length === 0) docBottleneck = 0
    const estimate = Math.max(0, Math.min(capSum, docBottleneck === Number.POSITIVE_INFINITY ? capSum : docBottleneck))
    out.push({ procedureId: proc.id, name: proc.name, estimate })
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}
