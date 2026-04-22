/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

export interface TimeWindowM {
  startM: number | null
  endM: number | null
}

/** Ca lam viec theo ngay cua BS / KTV */
export type TechShift = 'off' | 'am' | 'pm' | 'full'

export interface SchedDoctor {
  id: string
  code: string
  name: string
  amStartM: number | null
  amEndM: number | null
  pmStartM: number | null
  pmEndM: number | null
  /** Ban do: 'yyyy-mm-dd' -> ca lam viec ngay do (ghi de gio mac dinh) */
  monthlyShifts?: Record<string, TechShift>
  /** Ban do: 'yyyy-mm-dd' -> gio lam rieng cho ngay do (ghi de gio mac dinh) */
  dayHours?: Record<string, TechDayHours>
  busy: TimeWindowM[]
}

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

/**
 * Cach xep ca KTV / may cua thu thuat:
 * - 'parallel': cho phep chong gio giua cac ca (vd dien cham, dien xung).
 *   Hai ca song song cung KTV chi can cach nhau `gapMinutes` phut tinh tu start.
 * - 'sequential': khong duoc chong gio; ca sau phai bat dau sau ca truoc ket thuc
 *   + `gapMinutes` phut.
 */
export type SchedOverlapMode = 'parallel' | 'sequential'

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
  /** Cach xep ca. Mac dinh 'sequential' (khong chong gio). */
  overlapMode?: SchedOverlapMode
  /**
   * Khoang cach toi thieu giua 2 ca cung mot KTV (phut).
   * - 'parallel': cach nhau theo startM (vd 7' cho dien cham, 5' cho dien xung)
   * - 'sequential': cach nhau theo endM -> startM (vd 1' de noi tiep gio)
   */
  gapMinutes?: number
}

export interface SchedPatient {
  id: string
  name: string
  /** Phút từ 00:00; null = chưa nhập (coi như 0:00 khi xếp) */
  admissionM: number | null
  highPriority: boolean
  procedureIds: string[]
  busy: TimeWindowM[]
  /**
   * Lieu trinh (so ngay). >=1. Neu null / <=0 -> coi nhu 1 (chi xep trong ngay ma
   * schedulingDate == admissionDate).
   */
  treatmentDays?: number | null
  /** Ngay vao vien / bat dau lieu trinh (yyyy-mm-dd). */
  admissionDate?: string | null
  /**
   * Phut ket thuc kham benh. Neu co, thu thuat trong ngay `examEndDate`
   * phai bat dau sau moc nay.
   */
  examEndM?: number | null
  /**
   * Ngay ket thuc kham (yyyy-mm-dd). Neu khong dat, mac dinh la `admissionDate`
   * (tuc ngay dau lieu trinh).
   */
  examEndDate?: string | null
  /**
   * Phut ra vien. Neu co, thu thuat trong ngay `dischargeDate` phai
   * ket thuc truoc moc nay.
   */
  dischargeM?: number | null
  /**
   * Ngay ra vien (yyyy-mm-dd). Neu khong dat, mac dinh la ngay cuoi cua
   * lieu trinh (admissionDate + treatmentDays - 1).
   */
  dischargeDate?: string | null
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
  overlapMode?: SchedOverlapMode
  gapMinutes?: number
}

export interface GlobalHoliday {
  id: string
  /** ISO yyyy-mm-dd */
  date: string
  label: string
  /** Nếu true, lặp hàng năm (so sánh month+day) */
  recurring: boolean
}
