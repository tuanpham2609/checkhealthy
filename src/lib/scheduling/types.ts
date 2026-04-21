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

/** Ca lam viec theo ngay cua KTV */
export type TechShift = 'off' | 'am' | 'pm' | 'full'

/** Gio lam rieng cho mot ngay cu the (ghi de gio mac dinh) */
export interface TechDayHours {
  amStartM?: number | null
  amEndM?: number | null
  pmStartM?: number | null
  pmEndM?: number | null
}

export interface SchedTechnician {
  id: string
  code: string
  name: string
  /** Gio lam mac dinh (ap dung khi monthlyShifts khong co entry cho ngay do) */
  amStartM: number | null
  amEndM: number | null
  pmStartM: number | null
  pmEndM: number | null
  /** Ban do: 'yyyy-mm-dd' -> ca lam viec ngay do (ghi de gio mac dinh) */
  monthlyShifts: Record<string, TechShift>
  /** Ban do: 'yyyy-mm-dd' -> gio lam rieng cho ngay do (ghi de gio mac dinh) */
  dayHours?: Record<string, TechDayHours>
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
  /** Ma KTV duoc phep thuc hien (ngan cach bang dau phay). Neu rong -> khong yeu cau KTV */
  technicianCodes?: string
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
  technicians: SchedTechnician[]
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
  /** KTV duoc gan (neu procedure yeu cau) */
  technicianCodes?: string[]
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
  /** UUID của user sở hữu context */
  userId: string | null
  /** Ngày nghỉ riêng của bản lịch (ISO yyyy-mm-dd) */
  daysOff: string[]
  settings: SchedSettings
  masters: SchedMasters
  assignments: SchedAssignment[]
  lastUnscheduled: UnscheduledItem[] | null
}

/** Cross-user assignment dùng cho phát hiện trùng lịch */
export interface CrossUserAssignment {
  contextId: string
  contextName: string
  userName: string
  doctorCodes: string[]
  technicianCodes?: string[]
  machineId: string
  startM: number
  pillowEndM: number
  endM: number
}

/** Shared reference data (import Excel) */
export interface SharedDoctor {
  id: string
  code: string
  name: string
  amStart: string
  amEnd: string
  pmStart: string
  pmEnd: string
}

export interface SharedTechnician {
  id: string
  code: string
  name: string
  amStart: string
  amEnd: string
  pmStart: string
  pmEnd: string
}

export interface SharedMachine {
  id: string
  typeName: string
  unitName: string
}

export interface SharedProcedure {
  id: string
  name: string
  durationM: number | null
  pillowM: number | null
  mainCodes: string
  substituteCodes: string
  machineType: string
  priority: boolean
  technicianCodes?: string
}

export interface GlobalHoliday {
  id: string
  /** ISO yyyy-mm-dd */
  date: string
  label: string
  /** Nếu true, lặp hàng năm (so sánh month+day) */
  recurring: boolean
}
