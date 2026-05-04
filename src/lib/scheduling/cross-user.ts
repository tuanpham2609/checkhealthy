/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import type { SchedMasters, TimeWindowM } from '@/lib/scheduling/types'

export interface ExternalAssignment {
  doctorCodes: string[]
  technicianCodes?: string[]
  machineId: string
  startM: number
  pillowEndM: number
  endM: number
}

export interface ExternalContext {
  contextName: string
  userName: string
  assignments: ExternalAssignment[]
}

export interface ConflictInfo {
  type: 'doctor' | 'technician' | 'machine'
  resourceCode: string
  externalUser: string
  externalContext: string
  startM: number
  endM: number
}

/**
 * Inject cross-user busy slots into masters so the engine naturally avoids conflicts.
 * Returns new masters (immutable) + detected conflicts with existing assignments.
 */
export function injectCrossUserBusy(
  masters: SchedMasters,
  externals: ExternalContext[],
): { masters: SchedMasters; conflicts: ConflictInfo[] } {
  const doctorBusyMap = new Map<string, TimeWindowM[]>()
  const techBusyMap = new Map<string, TimeWindowM[]>()
  const machineBusyMap = new Map<string, TimeWindowM[]>()
  const conflicts: ConflictInfo[] = []

  for (const ext of externals) {
    for (const a of ext.assignments) {
      for (const code of a.doctorCodes) {
        const key = code.toLowerCase()
        const list = doctorBusyMap.get(key) ?? []
        list.push({ startM: a.startM, endM: a.pillowEndM })
        doctorBusyMap.set(key, list)
      }
      for (const code of a.technicianCodes ?? []) {
        const key = code.toLowerCase()
        const list = techBusyMap.get(key) ?? []
        list.push({ startM: a.startM, endM: a.endM })
        techBusyMap.set(key, list)
      }
      const mList = machineBusyMap.get(a.machineId) ?? []
      mList.push({ startM: a.startM, endM: a.endM })
      machineBusyMap.set(a.machineId, mList)
    }
  }

  const newDoctors = masters.doctors.map((d) => {
    const extra = doctorBusyMap.get(d.code.toLowerCase())
    if (!extra?.length) return d
    return { ...d, busy: [...d.busy, ...extra] }
  })

  const newTechnicians = (masters.technicians ?? []).map((t) => {
    const extra = techBusyMap.get(t.code.toLowerCase())
    if (!extra?.length) return t
    return { ...t, busy: [...t.busy, ...extra] }
  })

  const newMachines = masters.machines.map((m) => {
    const extra = machineBusyMap.get(m.id)
    if (!extra?.length) return m
    return { ...m, busy: [...m.busy, ...extra] }
  })

  return {
    masters: { ...masters, doctors: newDoctors, technicians: newTechnicians, machines: newMachines },
    conflicts,
  }
}
