/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import type { SchedMasters } from '@/lib/scheduling/types'
import { isEmptyWindow } from '@/lib/scheduling/time'

export function validateMastersForSchedule(masters: SchedMasters): string[] {
  const errors: string[] = []
  if (masters.doctors.length === 0) {
    errors.push('Cần ít nhất một bác sĩ.')
  }
  for (const d of masters.doctors) {
    if (!d.code.trim()) errors.push('Mỗi bác sĩ cần mã (vd A, B).')
    if (!d.name.trim()) errors.push(`Bác sĩ mã "${d.code || '?'}" cần họ tên.`)
    const am = { startM: d.amStartM, endM: d.amEndM }
    const pm = { startM: d.pmStartM, endM: d.pmEndM }
    if (isEmptyWindow(am) && isEmptyWindow(pm)) {
      errors.push(`Bác sĩ "${d.name || d.code}" cần ít nhất một khung sáng hoặc chiều.`)
    }
  }
  if (masters.machines.length === 0) {
    errors.push('Cần ít nhất một máy.')
  }
  for (const m of masters.machines) {
    if (!m.typeName.trim()) errors.push('Mỗi máy cần loại máy (vd Điện xung).')
    if (!m.unitName.trim()) errors.push(`Máy loại "${m.typeName || '?'}" cần tên riêng.`)
  }
  if (masters.procedures.length === 0) {
    errors.push('Cần ít nhất một thủ thuật.')
  }
  if (masters.patients.length === 0) {
    errors.push('Cần ít nhất một bệnh nhân.')
  }
  for (const p of masters.patients) {
    if (!p.name.trim()) errors.push('Mỗi bệnh nhân cần tên.')
    if (p.procedureIds.length === 0) errors.push(`Bệnh nhân "${p.name || '?'}" cần chọn ít nhất một thủ thuật.`)
  }
  return [...new Set(errors)]
}
