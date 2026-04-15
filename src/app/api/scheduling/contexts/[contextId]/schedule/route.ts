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
import { injectCrossUserBusy, type ExternalContext } from '@/lib/scheduling/cross-user'
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
  const baseMasters = asMasters(row.masters)
  const existing = (existingRows ?? []).map((r) => assignmentRowToClient(r as Parameters<typeof assignmentRowToClient>[0]))

  const schedulingDate = row.scheduling_date as string
  const { data: otherCtxs } = await supabase
    .from('sched_contexts')
    .select('id, name, user_id')
    .eq('scheduling_date', schedulingDate)
    .neq('id', contextId)
  let crossMasters = baseMasters

  if (otherCtxs?.length) {
    const otherIds = otherCtxs.map((c) => c.id as string)
    const { data: otherAssigns } = await supabase
      .from('sched_assignments')
      .select('context_id, doctor_codes, machine_id, start_m, pillow_end_m, end_m')
      .in('context_id', otherIds)

    const userIds = [...new Set(otherCtxs.map((c) => c.user_id as string).filter(Boolean))]
    let userMap: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: users } = await supabase.from('app_users').select('id, display_name').in('id', userIds)
      if (users) userMap = Object.fromEntries(users.map((u) => [u.id, u.display_name]))
    }

    const externals: ExternalContext[] = otherCtxs.map((c) => ({
      contextName: c.name as string,
      userName: userMap[c.user_id as string] ?? '',
      assignments: (otherAssigns ?? [])
        .filter((a) => a.context_id === c.id)
        .map((a) => ({
          doctorCodes: (a.doctor_codes as string[]) ?? [],
          machineId: a.machine_id as string,
          startM: a.start_m as number,
          pillowEndM: a.pillow_end_m as number,
          endM: a.end_m as number,
        })),
    }))

    const result = injectCrossUserBusy(baseMasters, externals)
    crossMasters = result.masters
  }

  const { assignments, unscheduled } = runSchedule(crossMasters, settings, mode, existing)

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
