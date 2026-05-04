/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import { NextResponse } from 'next/server'
import { assignmentClientToInsert, assignmentRowToClient, rowToPayload } from '@/lib/scheduling/db-map'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'
import { getSessionUser } from '@/lib/auth/session'

const DEFAULT_SETTINGS = {
  autoSaveAfterSchedule: false,
  allowAdjacentPillow: false,
  pillowGapMinutes: 3,
}

const DEFAULT_MASTERS = {
  doctors: [],
  technicians: [],
  machines: [],
  procedures: [],
  patients: [],
}

function serviceUnavailable() {
  return NextResponse.json(
    { error: 'Chưa cấu hình Supabase (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).' },
    { status: 503 },
  )
}

export async function GET() {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('sched_contexts')
    .select('id,name,scheduling_date,updated_at')
    .order('updated_at', { ascending: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ contexts: data ?? [] })
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const o = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const name = typeof o.name === 'string' ? o.name.trim() : ''
  const schedulingDate =
    typeof o.schedulingDate === 'string' && o.schedulingDate.trim()
      ? o.schedulingDate.trim().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  const cloneFromId = typeof o.cloneFromId === 'string' ? o.cloneFromId : null
  const settingsBody = o.settings && typeof o.settings === 'object' ? o.settings : null
  const mastersBody = o.masters && typeof o.masters === 'object' ? o.masters : null
  const daysOff = Array.isArray(o.daysOff) ? o.daysOff.filter((x): x is string => typeof x === 'string') : []

  const session = await getSessionUser()
  const userId = session?.uid ?? null

  const supabase = createSupabaseAdmin()

  if (cloneFromId) {
    const { data: src, error: srcErr } = await supabase.from('sched_contexts').select('*').eq('id', cloneFromId).single()
    if (srcErr || !src) {
      return NextResponse.json({ error: 'Không tìm thấy phiên nguồn để sao chép.' }, { status: 404 })
    }
    const { data: inserted, error: insErr } = await supabase
      .from('sched_contexts')
      .insert({
        name,
        scheduling_date: src.scheduling_date,
        user_id: userId,
        settings: src.settings ?? DEFAULT_SETTINGS,
        masters: src.masters ?? DEFAULT_MASTERS,
        days_off: src.days_off ?? [],
        last_unscheduled: src.last_unscheduled,
      })
      .select('id')
      .single()
    if (insErr || !inserted) {
      return NextResponse.json({ error: insErr?.message ?? 'Lỗi tạo phiên' }, { status: 500 })
    }
    const newId = inserted.id as string
    const { data: assigns, error: aErr } = await supabase
      .from('sched_assignments')
      .select('*')
      .eq('context_id', cloneFromId)
    if (aErr) {
      return NextResponse.json({ error: aErr.message }, { status: 500 })
    }
    if (assigns?.length) {
      const rows = assigns.map((row) => {
        const client = assignmentRowToClient(row as Parameters<typeof assignmentRowToClient>[0])
        const fresh = {
          ...client,
          id: crypto.randomUUID(),
          locked: false,
        }
        return assignmentClientToInsert(newId, fresh)
      })
      const { error: bulkErr } = await supabase.from('sched_assignments').insert(rows)
      if (bulkErr) {
        return NextResponse.json({ error: bulkErr.message }, { status: 500 })
      }
    }
    return NextResponse.json({ id: newId })
  }

  const { data: inserted, error } = await supabase
    .from('sched_contexts')
    .insert({
      name,
      scheduling_date: schedulingDate,
      user_id: userId,
      settings: settingsBody ?? DEFAULT_SETTINGS,
      masters: mastersBody ?? DEFAULT_MASTERS,
      days_off: daysOff,
    })
    .select('id')
    .single()
  if (error || !inserted) {
    return NextResponse.json({ error: error?.message ?? 'Lỗi tạo phiên' }, { status: 500 })
  }
  return NextResponse.json({ id: inserted.id })
}
