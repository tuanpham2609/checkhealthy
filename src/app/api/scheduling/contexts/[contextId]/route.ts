/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { NextResponse } from 'next/server'
import { rowToPayload } from '@/lib/scheduling/db-map'
import type { SchedMasters, SchedSettings } from '@/lib/scheduling/types'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'

function serviceUnavailable() {
  return NextResponse.json(
    { error: 'Chưa cấu hình Supabase (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).' },
    { status: 503 },
  )
}

export async function GET(_request: Request, ctx: { params: Promise<{ contextId: string }> }) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const { contextId } = await ctx.params
  const supabase = createSupabaseAdmin()
  const { data: row, error } = await supabase.from('sched_contexts').select('*').eq('id', contextId).single()
  if (error || !row) {
    return NextResponse.json({ error: 'Không tìm thấy phiên.' }, { status: 404 })
  }
  const { data: assigns, error: aErr } = await supabase.from('sched_assignments').select('*').eq('context_id', contextId)
  if (aErr) {
    return NextResponse.json({ error: aErr.message }, { status: 500 })
  }
  const payload = rowToPayload(row as Parameters<typeof rowToPayload>[0], assigns ?? [])
  return NextResponse.json(payload)
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
  const name = typeof o.name === 'string' ? o.name.trim() : undefined
  const schedulingDate =
    typeof o.schedulingDate === 'string' && o.schedulingDate.trim()
      ? o.schedulingDate.trim().slice(0, 10)
      : undefined
  const settings = o.settings as SchedSettings | undefined
  const masters = o.masters as SchedMasters | undefined

  if (!name && !schedulingDate && !settings && !masters) {
    return NextResponse.json({ error: 'Thiếu trường cập nhật (name, schedulingDate, settings, masters).' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}
  if (name) patch.name = name
  if (schedulingDate) patch.scheduling_date = schedulingDate
  if (settings) patch.settings = settings
  if (masters) patch.masters = masters

  const supabase = createSupabaseAdmin()
  const { error } = await supabase.from('sched_contexts').update(patch).eq('id', contextId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ contextId: string }> }) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const { contextId } = await ctx.params
  const supabase = createSupabaseAdmin()
  const { error } = await supabase.from('sched_contexts').delete().eq('id', contextId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
