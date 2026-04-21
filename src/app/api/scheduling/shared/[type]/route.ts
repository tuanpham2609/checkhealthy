/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { NextResponse } from 'next/server'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'
import { getSessionUser } from '@/lib/auth/session'

type SharedType = 'doctors' | 'technicians' | 'machines' | 'procedures'

const TABLE_MAP: Record<SharedType, string> = {
  doctors: 'shared_doctors',
  technicians: 'shared_technicians',
  machines: 'shared_machines',
  procedures: 'shared_procedures',
}

function isValidType(t: string): t is SharedType {
  return t in TABLE_MAP
}

function serviceUnavailable() {
  return NextResponse.json({ error: 'Chưa cấu hình Supabase.' }, { status: 503 })
}

export async function GET(_req: Request, ctx: { params: Promise<{ type: string }> }) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

  const { type } = await ctx.params
  if (!isValidType(type)) {
    return NextResponse.json({ error: 'Type không hợp lệ (doctors|technicians|machines|procedures).' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.from(TABLE_MAP[type]).select('*').order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ items: data ?? [] })
}

export async function POST(req: Request, ctx: { params: Promise<{ type: string }> }) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

  const { type } = await ctx.params
  if (!isValidType(type)) {
    return NextResponse.json({ error: 'Type không hợp lệ.' }, { status: 400 })
  }

  let body: { items: Record<string, unknown>[] }
  try {
    body = (await req.json()) as { items: Record<string, unknown>[] }
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ.' }, { status: 400 })
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Danh sách trống.' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const table = TABLE_MAP[type]

  if (type === 'doctors' || type === 'technicians') {
    const rows = body.items.map((r) => ({
      code: String(r.code ?? '').trim(),
      name: String(r.name ?? '').trim(),
      am_start: String(r.amStart ?? r.am_start ?? ''),
      am_end: String(r.amEnd ?? r.am_end ?? ''),
      pm_start: String(r.pmStart ?? r.pm_start ?? ''),
      pm_end: String(r.pmEnd ?? r.pm_end ?? ''),
    })).filter((r) => r.code && r.name)

    for (const row of rows) {
      await supabase.from(table).upsert(row, { onConflict: 'code' })
    }
    return NextResponse.json({ imported: rows.length })
  }

  if (type === 'machines') {
    const rows = body.items.map((r) => ({
      type_name: String(r.typeName ?? r.type_name ?? '').trim(),
      unit_name: String(r.unitName ?? r.unit_name ?? '').trim(),
    })).filter((r) => r.type_name && r.unit_name)

    for (const row of rows) {
      await supabase.from(table).upsert(row, { onConflict: 'type_name,unit_name' })
    }
    return NextResponse.json({ imported: rows.length })
  }

  if (type === 'procedures') {
    const rows = body.items.map((r) => ({
      name: String(r.name ?? '').trim(),
      duration_m: typeof r.durationM === 'number' ? r.durationM : (typeof r.duration_m === 'number' ? r.duration_m : null),
      pillow_m: typeof r.pillowM === 'number' ? r.pillowM : (typeof r.pillow_m === 'number' ? r.pillow_m : null),
      main_codes: String(r.mainCodes ?? r.main_codes ?? ''),
      substitute_codes: String(r.substituteCodes ?? r.substitute_codes ?? ''),
      machine_type: String(r.machineType ?? r.machine_type ?? ''),
      priority: Boolean(r.priority),
    })).filter((r) => r.name)

    for (const row of rows) {
      const { data: existing } = await supabase.from(table).select('id').eq('name', row.name).maybeSingle()
      if (existing) {
        await supabase.from(table).update(row).eq('id', existing.id)
      } else {
        await supabase.from(table).insert(row)
      }
    }
    return NextResponse.json({ imported: rows.length })
  }

  return NextResponse.json({ error: 'Không hỗ trợ.' }, { status: 400 })
}

export async function DELETE(req: Request, ctx: { params: Promise<{ type: string }> }) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

  const { type } = await ctx.params
  if (!isValidType(type)) {
    return NextResponse.json({ error: 'Type không hợp lệ.' }, { status: 400 })
  }

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Thiếu id.' }, { status: 400 })

  const supabase = createSupabaseAdmin()
  const { error } = await supabase.from(TABLE_MAP[type]).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
