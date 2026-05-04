/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import type { GlobalHoliday, SchedAssignment, SchedContextPayload } from '@/lib/scheduling/types'

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? res.statusText)
  }
  return data
}

export interface SchedContextListItem {
  id: string
  name: string
  scheduling_date: string
  updated_at: string
}

export async function fetchContextList(): Promise<SchedContextListItem[]> {
  const res = await fetch('/api/scheduling/contexts')
  const data = await parseJson<{ contexts: SchedContextListItem[] }>(res)
  return data.contexts
}

export async function fetchContext(id: string): Promise<SchedContextPayload> {
  const res = await fetch(`/api/scheduling/contexts/${id}`)
  return parseJson<SchedContextPayload>(res)
}

export async function saveContext(id: string, payload: SchedContextPayload): Promise<void> {
  const res = await fetch(`/api/scheduling/contexts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      schedulingDate: payload.schedulingDate,
      daysOff: payload.daysOff,
      settings: payload.settings,
      masters: payload.masters,
    }),
  })
  await parseJson<{ ok: boolean }>(res)
}

export interface RunScheduleResult {
  context: SchedContextPayload
  unscheduled: { patientId: string; procedureId: string; reason: string }[]
}

export async function runSchedule(contextId: string, mode: 'full' | 'preserve'): Promise<RunScheduleResult> {
  const res = await fetch(`/api/scheduling/contexts/${contextId}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  })
  return parseJson<RunScheduleResult>(res)
}

export async function createContext(body: Record<string, unknown> = {}): Promise<string> {
  const res = await fetch('/api/scheduling/contexts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await parseJson<{ id: string }>(res)
  return data.id
}

export async function deleteContext(id: string): Promise<void> {
  const res = await fetch(`/api/scheduling/contexts/${id}`, { method: 'DELETE' })
  await parseJson<{ ok: boolean }>(res)
}

export async function fetchHolidays(): Promise<GlobalHoliday[]> {
  const res = await fetch('/api/scheduling/holidays')
  const data = await parseJson<{ holidays: GlobalHoliday[] }>(res)
  return data.holidays
}

export async function createHoliday(body: { date: string; label: string; recurring: boolean }): Promise<GlobalHoliday> {
  const res = await fetch('/api/scheduling/holidays', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await parseJson<{ holiday: GlobalHoliday }>(res)
  return data.holiday
}

export async function deleteHoliday(id: string): Promise<void> {
  const res = await fetch(`/api/scheduling/holidays?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  await parseJson<{ ok: boolean }>(res)
}

export async function patchDaysOff(contextId: string, daysOff: string[]): Promise<void> {
  const res = await fetch(`/api/scheduling/contexts/${contextId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ daysOff }),
  })
  await parseJson<{ ok: boolean }>(res)
}

export async function putAssignments(contextId: string, assignments: SchedAssignment[]): Promise<void> {
  const res = await fetch(`/api/scheduling/contexts/${contextId}/assignments`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignments }),
  })
  await parseJson<{ ok: boolean }>(res)
}
