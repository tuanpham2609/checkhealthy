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
  SchedTechnician,
  UnscheduledItem,
} from '@/lib/scheduling/types'
import {
  intervalInsideDoctorShift,
  intervalsOverlap,
  isEmptyWindow,
  windowOverlapsInterval,
} from '@/lib/scheduling/time'

/** Tra ve chenh lech ngay giua 2 chuoi 'yyyy-mm-dd'. Neu a truoc b -> so duong. */
function daysBetween(aIso: string, bIso: string): number {
  const a = Date.parse(`${aIso}T00:00:00Z`)
  const b = Date.parse(`${bIso}T00:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0
  return Math.round((b - a) / (24 * 60 * 60 * 1000))
}

/** Cong `days` ngay vao chuoi ISO yyyy-mm-dd. */
function addDaysIso(iso: string, days: number): string {
  const ms = Date.parse(`${iso}T00:00:00Z`)
  if (!Number.isFinite(ms)) return iso
  const next = new Date(ms + days * 24 * 60 * 60 * 1000)
  const y = next.getUTCFullYear()
  const m = String(next.getUTCMonth() + 1).padStart(2, '0')
  const d = String(next.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Tinh chi so ngay cua lieu trinh cho benh nhan (1-indexed).
 * - Neu khong co admissionDate -> coi nhu ngay 1 (bo qua constraint lieu trinh)
 * - Neu schedulingDate nam TRUOC admissionDate -> tra ve 0 (chua bat dau)
 * - Neu schedulingDate nam SAU ket thuc lieu trinh (admission + treatmentDays - 1)
 *   -> tra ve so > treatmentDays
 */
export function computeTreatmentDayIndex(
  patient: SchedPatient,
  schedulingDate: string | null,
): number | null {
  if (!schedulingDate) return null
  if (!patient.admissionDate) return null
  const diff = daysBetween(patient.admissionDate, schedulingDate)
  return diff + 1
}

/** Ngay thuc te ap dung moc "ket thuc kham" (co the user override hoac auto = admissionDate) */
export function resolveExamEndDate(patient: SchedPatient): string | null {
  if (patient.examEndDate) return patient.examEndDate
  if (patient.admissionDate) return patient.admissionDate
  return null
}

/** Ngay thuc te ap dung moc "ra vien" (co the user override hoac auto = ngay cuoi lieu trinh) */
export function resolveDischargeDate(patient: SchedPatient): string | null {
  if (patient.dischargeDate) return patient.dischargeDate
  if (patient.admissionDate) {
    const days = Math.max(1, patient.treatmentDays ?? 1)
    return addDaysIso(patient.admissionDate, days - 1)
  }
  return null
}

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

/** Tra ve gio lam hieu luc cua BS cho mot ngay (dua vao monthlyShifts + dayHours neu co) */
export function getDoctorEffectiveHours(
  doc: SchedDoctor,
  schedulingDate: string | null,
): { amStartM: number | null; amEndM: number | null; pmStartM: number | null; pmEndM: number | null; isOff: boolean } {
  const shift = schedulingDate && doc.monthlyShifts ? doc.monthlyShifts[schedulingDate] : undefined
  if (shift === 'off') {
    return { amStartM: null, amEndM: null, pmStartM: null, pmEndM: null, isOff: true }
  }
  const override = schedulingDate && doc.dayHours ? doc.dayHours[schedulingDate] : undefined
  const amStart = override?.amStartM ?? doc.amStartM
  const amEnd = override?.amEndM ?? doc.amEndM
  const pmStart = override?.pmStartM ?? doc.pmStartM
  const pmEnd = override?.pmEndM ?? doc.pmEndM
  if (shift === 'am') {
    return { amStartM: amStart, amEndM: amEnd, pmStartM: null, pmEndM: null, isOff: false }
  }
  if (shift === 'pm') {
    return { amStartM: null, amEndM: null, pmStartM: pmStart, pmEndM: pmEnd, isOff: false }
  }
  return {
    amStartM: amStart,
    amEndM: amEnd,
    pmStartM: pmStart,
    pmEndM: pmEnd,
    isOff: false,
  }
}

function technicianByCode(techs: SchedTechnician[], code: string): SchedTechnician | undefined {
  return techs.find((t) => t.code.toLowerCase() === code.toLowerCase())
}

/** Tra ve gio lam hieu luc cua KTV cho mot ngay (dua vao monthlyShifts + dayHours neu co) */
export function getTechnicianEffectiveHours(
  tech: SchedTechnician,
  schedulingDate: string | null,
): { amStartM: number | null; amEndM: number | null; pmStartM: number | null; pmEndM: number | null; isOff: boolean } {
  const shift = schedulingDate ? tech.monthlyShifts[schedulingDate] : undefined
  if (shift === 'off') {
    return { amStartM: null, amEndM: null, pmStartM: null, pmEndM: null, isOff: true }
  }
  const override = schedulingDate && tech.dayHours ? tech.dayHours[schedulingDate] : undefined
  const amStart = override?.amStartM ?? tech.amStartM
  const amEnd = override?.amEndM ?? tech.amEndM
  const pmStart = override?.pmStartM ?? tech.pmStartM
  const pmEnd = override?.pmEndM ?? tech.pmEndM
  if (shift === 'am') {
    return { amStartM: amStart, amEndM: amEnd, pmStartM: null, pmEndM: null, isOff: false }
  }
  if (shift === 'pm') {
    return { amStartM: null, amEndM: null, pmStartM: pmStart, pmEndM: pmEnd, isOff: false }
  }
  return {
    amStartM: amStart,
    amEndM: amEnd,
    pmStartM: pmStart,
    pmEndM: pmEnd,
    isOff: false,
  }
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

/**
 * Kiem tra 2 ca cung mot KTV co duoc phep cung ton tai khong.
 * Quy tac:
 * - Neu ca A va ca B CUNG bat nguon tu cung mot benh nhan -> luon cho phep
 *   (vi dung KTV voi cung benh nhan la truong hop binh thuong, vd KTV lam
 *   tuan tu 2 thu thuat Cuu va Xoa bop cho cung 1 BN).
 * - Neu ca A va ca B cho 2 benh nhan khac nhau:
 *     * Neu ca nao co overlapMode='sequential' -> khong duoc chong gio,
 *       phai cach nhau it nhat max(gapA, gapB) phut tinh tu endPrev -> startNext.
 *     * Neu ca CA HAI deu overlapMode='parallel' -> duoc phep chong gio,
 *       nhung 2 diem bat dau phai cach nhau >= max(gapA, gapB).
 */
function technicianPairAllowed(
  newStart: number,
  newEnd: number,
  newProc: SchedProcedure,
  otherStart: number,
  otherEnd: number,
  otherProc: SchedProcedure | undefined,
  samePatient: boolean,
): boolean {
  if (samePatient) return true
  const newMode: 'parallel' | 'sequential' = newProc.overlapMode ?? 'sequential'
  const otherMode: 'parallel' | 'sequential' = otherProc?.overlapMode ?? 'sequential'
  const gap = Math.max(0, newProc.gapMinutes ?? 0, otherProc?.gapMinutes ?? 0)
  if (newMode === 'parallel' && otherMode === 'parallel') {
    return Math.abs(newStart - otherStart) >= gap
  }
  if (!intervalsOverlap(newStart, newEnd, otherStart, otherEnd)) {
    if (newStart >= otherEnd) return newStart - otherEnd >= gap
    if (otherStart >= newEnd) return otherStart - newEnd >= gap
    return true
  }
  return false
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
  schedulingDate: string | null,
  proceduresById: Map<string, SchedProcedure>,
): SchedAssignment | null {
  const dur = procedure.durationM
  const pil = procedure.pillowM
  if (dur === null || dur <= 0 || pil === null || pil < 0) return null
  const pillowEnd = startM + pil
  const endM = startM + dur
  if (pillowEnd > endM) return null

  // Rang buoc lieu trinh + moc gio kham / ra vien
  const dayIdx = computeTreatmentDayIndex(patient, schedulingDate)
  if (dayIdx !== null) {
    const totalDays = Math.max(1, patient.treatmentDays ?? 1)
    if (dayIdx < 1) return null
    if (dayIdx > totalDays) return null
  }
  if (schedulingDate) {
    const examEndDate = resolveExamEndDate(patient)
    if (
      examEndDate &&
      examEndDate === schedulingDate &&
      typeof patient.examEndM === 'number' &&
      patient.examEndM > 0 &&
      startM < patient.examEndM
    ) {
      return null
    }
    const dischargeDate = resolveDischargeDate(patient)
    if (
      dischargeDate &&
      dischargeDate === schedulingDate &&
      typeof patient.dischargeM === 'number' &&
      patient.dischargeM > 0 &&
      endM > patient.dischargeM
    ) {
      return null
    }
  }

  const doctors = masters.doctors
  for (const code of doctorCodes) {
    const doc = doctorByCode(doctors, code)
    if (!doc) return null
    const docHours = getDoctorEffectiveHours(doc, schedulingDate)
    if (docHours.isOff) return null
    if (!intervalInsideDoctorShift(startM, pillowEnd, docHours.amStartM, docHours.amEndM, docHours.pmStartM, docHours.pmEndM)) return null
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

  // KTV: neu procedure yeu cau KTV -> tim 1 KTV available
  let assignedTechCode: string | null = null
  const technicianCodesRaw = (procedure.technicianCodes ?? '').trim()
  if (technicianCodesRaw) {
    const techCandidates = splitCommaCodes(technicianCodesRaw)
    const technicians = masters.technicians ?? []
    for (const code of techCandidates) {
      const tech = technicianByCode(technicians, code)
      if (!tech) continue
      const hours = getTechnicianEffectiveHours(tech, schedulingDate)
      if (hours.isOff) continue
      if (!intervalInsideDoctorShift(startM, endM, hours.amStartM, hours.amEndM, hours.pmStartM, hours.pmEndM)) continue
      let techBusyConflict = false
      for (const b of tech.busy) {
        if (windowOverlapsInterval(b, startM, endM)) {
          techBusyConflict = true
          break
        }
      }
      if (techBusyConflict) continue
      let conflictWithOther = false
      for (const a of assignments) {
        if (!(a.technicianCodes ?? []).map((c) => c.toLowerCase()).includes(code.toLowerCase())) continue
        const otherProc = proceduresById.get(a.procedureId)
        const samePatient = a.patientId === patient.id
        if (!technicianPairAllowed(startM, endM, procedure, a.startM, a.endM, otherProc, samePatient)) {
          conflictWithOther = true
          break
        }
      }
      if (conflictWithOther) continue
      assignedTechCode = code
      break
    }
    if (!assignedTechCode) return null
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
    technicianCodes: assignedTechCode ? [assignedTechCode] : [],
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
  schedulingDate: string | null,
  proceduresById: Map<string, SchedProcedure>,
): SchedAssignment | null {
  const duration = procedure.durationM
  if (duration === null || duration <= 0) return null

  const { dayStart, dayEnd } = inferDayBounds(masters)
  const admission = patient.admissionM ?? 0
  let startFrom = Math.max(dayStart, admission)
  let endLimit = dayEnd

  // Cat ngan pham vi tim kiem theo moc kham / ra vien neu trung ngay chay lich
  const dayIdx = computeTreatmentDayIndex(patient, schedulingDate)
  if (dayIdx !== null) {
    const totalDays = Math.max(1, patient.treatmentDays ?? 1)
    if (dayIdx < 1 || dayIdx > totalDays) return null
  }
  if (schedulingDate) {
    const examEndDate = resolveExamEndDate(patient)
    if (
      examEndDate === schedulingDate &&
      typeof patient.examEndM === 'number' &&
      patient.examEndM > 0
    ) {
      startFrom = Math.max(startFrom, patient.examEndM)
    }
    const dischargeDate = resolveDischargeDate(patient)
    if (
      dischargeDate === schedulingDate &&
      typeof patient.dischargeM === 'number' &&
      patient.dischargeM > 0
    ) {
      endLimit = Math.min(endLimit, patient.dischargeM)
    }
  }

  for (const codes of doctorCodeAttempts(procedure.mainCodes, procedure.substituteCodes)) {
    for (let t = startFrom; t <= endLimit - duration; t += 1) {
      const placed = tryPlace(masters, procedure, patient, codes, t, assignments, machineExtras, settings, schedulingDate, proceduresById)
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
  schedulingDate: string | null = null,
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
    // Benh nhan chua bat dau / da ket thuc lieu trinh
    const dayIdx = computeTreatmentDayIndex(job.patient, schedulingDate)
    if (dayIdx !== null) {
      const totalDays = Math.max(1, job.patient.treatmentDays ?? 1)
      if (dayIdx < 1) {
        unscheduled.push({
          patientId: job.patient.id,
          procedureId: job.procedure.id,
          reason: `Chưa đến ngày vào liệu trình (còn ${1 - dayIdx} ngày)`,
        })
        continue
      }
      if (dayIdx > totalDays) {
        unscheduled.push({
          patientId: job.patient.id,
          procedureId: job.procedure.id,
          reason: `Đã kết thúc liệu trình (ngày ${dayIdx}/${totalDays})`,
        })
        continue
      }
    }
    if (!proc.machineType.trim()) {
      unscheduled.push({
        patientId: job.patient.id,
        procedureId: job.procedure.id,
        reason: 'Thiếu loại máy yêu cầu',
      })
      continue
    }

    const next = findSlot(
      masters,
      job.procedure,
      job.patient,
      assignments,
      machineExtras,
      settings,
      schedulingDate,
      proceduresById,
    )
    if (!next) {
      unscheduled.push({
        patientId: job.patient.id,
        procedureId: job.procedure.id,
        reason: 'Không tìm được khung giờ thỏa bác sĩ / KTV / máy / lịch bận / giờ làm việc',
      })
      continue
    }
    assignments = [...assignments, next]
    scheduledKeys.add(key)
    refreshExtras()
  }

  return { assignments, unscheduled }
}
