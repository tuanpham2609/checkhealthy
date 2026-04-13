/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

export interface TimeWindowM {
  startM: number | null
  endM: number | null
}

export interface SchedDoctor {
  id: string
  code: string
  name: string
  amStartM: number | null
  amEndM: number | null
  pmStartM: number | null
  pmEndM: number | null
  busy: TimeWindowM[]
}

export interface SchedMachine {
  id: string
  typeName: string
  unitName: string
  busy: TimeWindowM[]
}

export interface SchedProcedure {
  id: string
  name: string
  /** Phút; null = chưa nhập — không xếp lịch được */
  durationM: number | null
  /** Phút BS có mặt; null = chưa nhập */
  pillowM: number | null
  mainCodes: string
  substituteCodes: string
  machineType: string
  priority: boolean
}

export interface SchedPatient {
  id: string
  name: string
  /** Phút từ 00:00; null = chưa nhập (coi như 0:00 khi xếp) */
  admissionM: number | null
  highPriority: boolean
  procedureIds: string[]
  busy: TimeWindowM[]
}

export interface SchedSettings {
  autoSaveAfterSchedule: boolean
  allowAdjacentPillow: boolean
  pillowGapMinutes: number
}

export interface SchedMasters {
  doctors: SchedDoctor[]
  machines: SchedMachine[]
  procedures: SchedProcedure[]
  patients: SchedPatient[]
}

export interface SchedAssignment {
  id: string
  patientId: string
  procedureId: string
  machineId: string
  doctorCodes: string[]
  startM: number
  pillowEndM: number
  endM: number
  locked: boolean
}

export interface UnscheduledItem {
  patientId: string
  procedureId: string
  reason: string
}

export interface ScheduleRunResult {
  assignments: SchedAssignment[]
  unscheduled: UnscheduledItem[]
}

export interface SchedContextPayload {
  id: string
  name: string
  schedulingDate: string
  settings: SchedSettings
  masters: SchedMasters
  assignments: SchedAssignment[]
  lastUnscheduled: UnscheduledItem[] | null
}
