/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import type { SchedAssignment, SchedMasters } from '@/lib/scheduling/types'
import { minutesToLabel } from '@/lib/scheduling/time'
import { filterCompleteAssignments } from '@/lib/scheduling/stats'

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function buildAssignmentsCsv(masters: SchedMasters, assignments: SchedAssignment[]): string {
  const procById = new Map(masters.procedures.map((p) => [p.id, p]))
  const patientById = new Map(masters.patients.map((p) => [p.id, p]))
  const machineById = new Map(masters.machines.map((m) => [m.id, m]))
  const doctorByCode = new Map(masters.doctors.map((d) => [d.code.toLowerCase(), d]))

  const headers = [
    'Bệnh nhân',
    'Thủ thuật',
    'Giờ bắt đầu',
    'Kết thúc gối',
    'Giờ kết thúc ca',
    'Bác sĩ (mã)',
    'Bác sĩ (tên)',
    'Loại máy',
    'Tên máy',
  ]

  const lines = [headers.map(escapeCsvCell).join(',')]
  // Ẩn hoàn toàn ca có tham chiếu (BN/TT/máy/BS) đã bị xoá khỏi masters.
  const visible = filterCompleteAssignments(assignments, masters)
  for (const a of [...visible].sort((x, y) => x.startM - y.startM)) {
    const patient = patientById.get(a.patientId)!
    const proc = procById.get(a.procedureId)!
    const machine = machineById.get(a.machineId)!
    const doctorNames = a.doctorCodes
      .map((c) => doctorByCode.get(c.toLowerCase())!.name)
      .join(' + ')
    const patientName = patient.name.trim() || '(Bệnh nhân chưa đặt tên)'
    const procName = proc.name.trim() || '(Thủ thuật chưa đặt tên)'
    const row = [
      patientName,
      procName,
      minutesToLabel(a.startM),
      minutesToLabel(a.pillowEndM),
      minutesToLabel(a.endM),
      a.doctorCodes.join(','),
      doctorNames,
      machine.typeName,
      machine.unitName,
    ].map((v) => escapeCsvCell(String(v)))
    lines.push(row.join(','))
  }
  return lines.join('\r\n')
}
