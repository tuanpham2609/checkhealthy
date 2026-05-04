/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import { NextResponse } from 'next/server'
import { assignmentClientToInsert } from '@/lib/scheduling/db-map'
import type { SchedAssignment } from '@/lib/scheduling/types'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'

function serviceUnavailable() {
  return NextResponse.json(
    { error: 'Chưa cấu hình Supabase (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).' },
    { status: 503 },
  )
}

function isAssignmentArray(v: unknown): v is SchedAssignment[] {
  return Array.isArray(v)
}

export async function PUT(request: Request, ctx: { params: Promise<{ contextId: string }> }) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const { contextId } = await ctx.params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON không hợp lệ.' }, { status: 400 })
  }
  const o = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  if (!isAssignmentArray(o.assignments)) {
    return NextResponse.json({ error: 'Thiếu mảng assignments.' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const { data: ctxRow, error: cErr } = await supabase.from('sched_contexts').select('id').eq('id', contextId).single()
  if (cErr || !ctxRow) {
    return NextResponse.json({ error: 'Không tìm thấy phiên.' }, { status: 404 })
  }

  const { error: delErr } = await supabase.from('sched_assignments').delete().eq('context_id', contextId)
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 })
  }

  if (o.assignments.length > 0) {
    const rows = o.assignments.map((a) => assignmentClientToInsert(contextId, a))
    const { error: insErr } = await supabase.from('sched_assignments').insert(rows)
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
