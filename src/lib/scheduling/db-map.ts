/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import type {
  SchedAssignment,
  SchedContextPayload,
  SchedDoctor,
  SchedMachine,
  SchedMasters,
  SchedPatient,
  SchedProcedure,
  SchedSettings,
  TimeWindowM,
  UnscheduledItem,
} from '@/lib/scheduling/types'

interface SchedContextRow {
  id: string
  name: string
  scheduling_date: string
  settings: unknown
  masters: unknown
  days_off: unknown
  last_unscheduled: unknown
}

interface SchedAssignmentRow {
  id: string
  context_id: string
  patient_id: string
  procedure_id: string
  machine_id: string
  doctor_codes: string[] | null
  start_m: number
  pillow_end_m: number
  end_m: number
  locked: boolean
}

function numOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

function normalizeBusy(raw: unknown): TimeWindowM[] {
  if (!Array.isArray(raw)) return []
  return raw.map((b) => {
    const o = b && typeof b === 'object' ? (b as Record<string, unknown>) : {}
    return { startM: numOrNull(o.startM), endM: numOrNull(o.endM) }
  })
}

function normalizeDoctor(raw: unknown): SchedDoctor {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    id: String(o.id ?? ''),
    code: typeof o.code === 'string' ? o.code : '',
    name: typeof o.name === 'string' ? o.name : '',
    amStartM: numOrNull(o.amStartM),
    amEndM: numOrNull(o.amEndM),
    pmStartM: numOrNull(o.pmStartM),
    pmEndM: numOrNull(o.pmEndM),
    busy: normalizeBusy(o.busy),
  }
}

function normalizeMachine(raw: unknown): SchedMachine {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    id: String(o.id ?? ''),
    typeName: typeof o.typeName === 'string' ? o.typeName : '',
    unitName: typeof o.unitName === 'string' ? o.unitName : '',
    busy: normalizeBusy(o.busy),
  }
}

function normalizeProcedure(raw: unknown): SchedProcedure {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    id: String(o.id ?? ''),
    name: typeof o.name === 'string' ? o.name : '',
    durationM: numOrNull(o.durationM),
    pillowM: numOrNull(o.pillowM),
    mainCodes: typeof o.mainCodes === 'string' ? o.mainCodes : '',
    substituteCodes: typeof o.substituteCodes === 'string' ? o.substituteCodes : '',
    machineType: typeof o.machineType === 'string' ? o.machineType : '',
    priority: Boolean(o.priority),
  }
}

function normalizePatient(raw: unknown): SchedPatient {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const procedureIds = Array.isArray(o.procedureIds)
    ? o.procedureIds.filter((x): x is string => typeof x === 'string')
    : []
  return {
    id: String(o.id ?? ''),
    name: typeof o.name === 'string' ? o.name : '',
    admissionM: numOrNull(o.admissionM),
    highPriority: Boolean(o.highPriority),
    procedureIds,
    busy: normalizeBusy(o.busy),
  }
}

export function asSettings(raw: unknown): SchedSettings {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    autoSaveAfterSchedule: Boolean(o.autoSaveAfterSchedule),
    allowAdjacentPillow: Boolean(o.allowAdjacentPillow),
    pillowGapMinutes: typeof o.pillowGapMinutes === 'number' ? o.pillowGapMinutes : 3,
  }
}

export function asMasters(raw: unknown): SchedMasters {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const doctors = Array.isArray(o.doctors) ? o.doctors.map(normalizeDoctor) : []
  const machines = Array.isArray(o.machines) ? o.machines.map(normalizeMachine) : []
  const procedures = Array.isArray(o.procedures) ? o.procedures.map(normalizeProcedure) : []
  const patients = Array.isArray(o.patients) ? o.patients.map(normalizePatient) : []
  return { doctors, machines, procedures, patients }
}

function asDaysOff(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === 'string')
}

function asUnscheduled(raw: unknown): UnscheduledItem[] | null {
  if (!Array.isArray(raw)) return null
  return raw as UnscheduledItem[]
}

export function rowToPayload(row: SchedContextRow, assignments: SchedAssignmentRow[]): SchedContextPayload {
  return {
    id: row.id,
    name: row.name,
    schedulingDate: row.scheduling_date,
    daysOff: asDaysOff(row.days_off),
    settings: asSettings(row.settings),
    masters: asMasters(row.masters),
    assignments: assignments.map(assignmentRowToClient),
    lastUnscheduled: asUnscheduled(row.last_unscheduled),
  }
}

export function assignmentRowToClient(row: SchedAssignmentRow): SchedAssignment {
  return {
    id: row.id,
    patientId: row.patient_id,
    procedureId: row.procedure_id,
    machineId: row.machine_id,
    doctorCodes: row.doctor_codes ?? [],
    startM: row.start_m,
    pillowEndM: row.pillow_end_m,
    endM: row.end_m,
    locked: row.locked,
  }
}

export function assignmentClientToInsert(
  contextId: string,
  a: SchedAssignment,
): Omit<SchedAssignmentRow, 'context_id'> & { context_id: string } {
  return {
    id: a.id,
    context_id: contextId,
    patient_id: a.patientId,
    procedure_id: a.procedureId,
    machine_id: a.machineId,
    doctor_codes: a.doctorCodes,
    start_m: a.startM,
    pillow_end_m: a.pillowEndM,
    end_m: a.endM,
    locked: a.locked,
  }
}
