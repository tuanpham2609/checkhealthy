/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'
import { getSessionUser } from '@/lib/auth/session'

export interface CrossCheckResult {
  contextId: string
  contextName: string
  userName: string
  assignments: {
    doctorCodes: string[]
    technicianCodes: string[]
    machineId: string
    startM: number
    pillowEndM: number
    endM: number
    patientId: string
    procedureId: string
  }[]
}

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Chưa cấu hình Supabase.' }, { status: 503 })
  }
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

  const url = new URL(req.url)
  const date = url.searchParams.get('date')
  const excludeContextId = url.searchParams.get('excludeContextId')

  if (!date) {
    return NextResponse.json({ error: 'Thiếu param date.' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()

  let ctxQuery = supabase
    .from('sched_contexts')
    .select('id, name, user_id')
    .eq('scheduling_date', date)

  if (excludeContextId) {
    ctxQuery = ctxQuery.neq('id', excludeContextId)
  }

  const { data: contexts, error: ctxErr } = await ctxQuery
  if (ctxErr) return NextResponse.json({ error: ctxErr.message }, { status: 500 })
  if (!contexts?.length) return NextResponse.json({ results: [] })

  const ctxIds = contexts.map((c) => c.id as string)

  const { data: assigns, error: aErr } = await supabase
    .from('sched_assignments')
    .select('context_id, doctor_codes, technician_codes, machine_id, start_m, pillow_end_m, end_m, patient_id, procedure_id')
    .in('context_id', ctxIds)

  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 })

  const userIds = [...new Set(contexts.map((c) => c.user_id as string).filter(Boolean))]
  let userMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('app_users')
      .select('id, display_name')
      .in('id', userIds)
    if (users) {
      userMap = Object.fromEntries(users.map((u) => [u.id, u.display_name]))
    }
  }

  const results: CrossCheckResult[] = contexts.map((ctx) => ({
    contextId: ctx.id as string,
    contextName: ctx.name as string,
    userName: userMap[ctx.user_id as string] ?? 'Không rõ',
    assignments: (assigns ?? [])
      .filter((a) => a.context_id === ctx.id)
      .map((a) => ({
        doctorCodes: (a.doctor_codes as string[]) ?? [],
        technicianCodes: (a.technician_codes as string[]) ?? [],
        machineId: a.machine_id as string,
        startM: a.start_m as number,
        pillowEndM: a.pillow_end_m as number,
        endM: a.end_m as number,
        patientId: a.patient_id as string,
        procedureId: a.procedure_id as string,
      })),
  }))

  return NextResponse.json({ results })
}
