/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { NextResponse } from 'next/server'
import {
  asMasters,
  asSettings,
  assignmentClientToInsert,
  assignmentRowToClient,
  rowToPayload,
} from '@/lib/scheduling/db-map'
import { runSchedule, type ScheduleMode } from '@/lib/scheduling/engine'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'

function serviceUnavailable() {
  return NextResponse.json(
    { error: 'Chưa cấu hình Supabase (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).' },
    { status: 503 },
  )
}

function isScheduleMode(v: unknown): v is ScheduleMode {
  return v === 'full' || v === 'preserve'
}

export async function POST(request: Request, ctx: { params: Promise<{ contextId: string }> }) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const { contextId } = await ctx.params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const o = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const mode = o.mode
  if (!isScheduleMode(mode)) {
    return NextResponse.json({ error: 'mode phải là "full" hoặc "preserve".' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const { data: row, error } = await supabase.from('sched_contexts').select('*').eq('id', contextId).single()
  if (error || !row) {
    return NextResponse.json({ error: 'Không tìm thấy phiên.' }, { status: 404 })
  }

  const { data: existingRows, error: exErr } = await supabase
    .from('sched_assignments')
    .select('*')
    .eq('context_id', contextId)
  if (exErr) {
    return NextResponse.json({ error: exErr.message }, { status: 500 })
  }

  const settings = asSettings(row.settings)
  const masters = asMasters(row.masters)
  const existing = (existingRows ?? []).map((r) => assignmentRowToClient(r as Parameters<typeof assignmentRowToClient>[0]))

  const { assignments, unscheduled } = runSchedule(masters, settings, mode, existing)

  const { error: delErr } = await supabase.from('sched_assignments').delete().eq('context_id', contextId)
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 })
  }

  if (assignments.length > 0) {
    const rows = assignments.map((a) => assignmentClientToInsert(contextId, a))
    const { error: insErr } = await supabase.from('sched_assignments').insert(rows)
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 })
    }
  }

  const { error: upErr } = await supabase
    .from('sched_contexts')
    .update({ last_unscheduled: unscheduled })
    .eq('id', contextId)
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  const { data: assignsOut } = await supabase.from('sched_assignments').select('*').eq('context_id', contextId)
  const { data: freshRow, error: freshErr } = await supabase.from('sched_contexts').select('*').eq('id', contextId).single()
  if (freshErr || !freshRow) {
    return NextResponse.json({ error: freshErr?.message ?? 'Không đọc lại phiên sau chia giờ.' }, { status: 500 })
  }
  const payload = rowToPayload(freshRow as Parameters<typeof rowToPayload>[0], assignsOut ?? [])

  return NextResponse.json({
    assignments,
    unscheduled,
    context: payload,
  })
}
