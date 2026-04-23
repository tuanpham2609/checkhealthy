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
  SchedTechnician,
  TechDayHours,
  TechShift,
  TimeWindowM,
  UnscheduledItem,
} from '@/lib/scheduling/types'

interface SchedContextRow {
  id: string
  name: string
  scheduling_date: string
  user_id: string | null
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
  technician_codes: string[] | null
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

function isTechShift(v: unknown): v is TechShift {
  return v === 'off' || v === 'am' || v === 'pm' || v === 'full'
}

function normalizeMonthlyShifts(raw: unknown): Record<string, TechShift> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<string, TechShift> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k === 'string' && isTechShift(v)) out[k] = v
  }
  return out
}

function normalizeDayHoursMap(raw: unknown): Record<string, TechDayHours> | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const out: Record<string, TechDayHours> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof k !== 'string' || !v || typeof v !== 'object') continue
    const o = v as Record<string, unknown>
    const entry: TechDayHours = {
      amStartM: numOrNull(o.amStartM),
      amEndM: numOrNull(o.amEndM),
      pmStartM: numOrNull(o.pmStartM),
      pmEndM: numOrNull(o.pmEndM),
    }
    const hasAny =
      entry.amStartM != null || entry.amEndM != null || entry.pmStartM != null || entry.pmEndM != null
    if (hasAny) out[k] = entry
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function normalizeDoctor(raw: unknown): SchedDoctor {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const monthlyShifts = normalizeMonthlyShifts(o.monthlyShifts)
  const dayHours = normalizeDayHoursMap(o.dayHours)
  const doctor: SchedDoctor = {
    id: String(o.id ?? ''),
    code: typeof o.code === 'string' ? o.code : '',
    name: typeof o.name === 'string' ? o.name : '',
    amStartM: numOrNull(o.amStartM),
    amEndM: numOrNull(o.amEndM),
    pmStartM: numOrNull(o.pmStartM),
    pmEndM: numOrNull(o.pmEndM),
    busy: normalizeBusy(o.busy),
  }
  if (Object.keys(monthlyShifts).length > 0) doctor.monthlyShifts = monthlyShifts
  if (dayHours) doctor.dayHours = dayHours
  return doctor
}

function normalizeTechnician(raw: unknown): SchedTechnician {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const dayHours = normalizeDayHoursMap(o.dayHours)
  const tech: SchedTechnician = {
    id: String(o.id ?? ''),
    code: typeof o.code === 'string' ? o.code : '',
    name: typeof o.name === 'string' ? o.name : '',
    amStartM: numOrNull(o.amStartM),
    amEndM: numOrNull(o.amEndM),
    pmStartM: numOrNull(o.pmStartM),
    pmEndM: numOrNull(o.pmEndM),
    monthlyShifts: normalizeMonthlyShifts(o.monthlyShifts),
    busy: normalizeBusy(o.busy),
  }
  if (dayHours) tech.dayHours = dayHours
  return tech
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
  const overlapMode = o.overlapMode === 'parallel' ? 'parallel' : o.overlapMode === 'sequential' ? 'sequential' : undefined
  const durationM = numOrNull(o.durationM)
  let pillowM = numOrNull(o.pillowM)
  // Mac dinh pillowM = durationM khi user khong nhap (UI da an truong nay).
  if ((pillowM === null || pillowM < 0) && durationM !== null && durationM > 0) {
    pillowM = durationM
  }
  return {
    id: String(o.id ?? ''),
    name: typeof o.name === 'string' ? o.name : '',
    durationM,
    pillowM,
    mainCodes: typeof o.mainCodes === 'string' ? o.mainCodes : '',
    substituteCodes: typeof o.substituteCodes === 'string' ? o.substituteCodes : '',
    machineType: typeof o.machineType === 'string' ? o.machineType : '',
    priority: Boolean(o.priority),
    technicianCodes: typeof o.technicianCodes === 'string' ? o.technicianCodes : '',
    overlapMode,
    gapMinutes: typeof o.gapMinutes === 'number' && Number.isFinite(o.gapMinutes) ? o.gapMinutes : undefined,
  }
}

function normalizePatient(raw: unknown): SchedPatient {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const procedureIds = Array.isArray(o.procedureIds)
    ? o.procedureIds.filter((x): x is string => typeof x === 'string')
    : []
  const treatmentDaysRaw = o.treatmentDays
  const treatmentDays =
    typeof treatmentDaysRaw === 'number' && Number.isFinite(treatmentDaysRaw) && treatmentDaysRaw > 0
      ? Math.floor(treatmentDaysRaw)
      : null
  const admissionDate =
    typeof o.admissionDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.admissionDate) ? o.admissionDate : null
  const examEndDate =
    typeof o.examEndDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.examEndDate) ? o.examEndDate : null
  const dischargeDate =
    typeof o.dischargeDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(o.dischargeDate) ? o.dischargeDate : null
  return {
    id: String(o.id ?? ''),
    name: typeof o.name === 'string' ? o.name : '',
    admissionM: numOrNull(o.admissionM),
    highPriority: Boolean(o.highPriority),
    procedureIds,
    busy: normalizeBusy(o.busy),
    treatmentDays,
    admissionDate,
    examEndM: numOrNull(o.examEndM),
    examEndDate,
    dischargeM: numOrNull(o.dischargeM),
    dischargeDate,
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
  const technicians = Array.isArray(o.technicians) ? o.technicians.map(normalizeTechnician) : []
  const machines = Array.isArray(o.machines) ? o.machines.map(normalizeMachine) : []
  const procedures = Array.isArray(o.procedures) ? o.procedures.map(normalizeProcedure) : []
  const patients = Array.isArray(o.patients) ? o.patients.map(normalizePatient) : []
  return { doctors, technicians, machines, procedures, patients }
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
    userId: row.user_id ?? null,
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
    technicianCodes: row.technician_codes ?? [],
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
    technician_codes: a.technicianCodes ?? [],
    start_m: a.startM,
    pillow_end_m: a.pillowEndM,
    end_m: a.endM,
    locked: a.locked,
  }
}
