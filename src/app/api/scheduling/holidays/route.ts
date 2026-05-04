/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import { NextResponse } from 'next/server'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'

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
    .from('global_holidays')
    .select('id,date,label,recurring')
    .order('date', { ascending: true })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ holidays: data ?? [] })
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON không hợp lệ.' }, { status: 400 })
  }
  const o = body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  const date = typeof o.date === 'string' ? o.date.trim().slice(0, 10) : ''
  const label = typeof o.label === 'string' ? o.label.trim() : ''
  const recurring = Boolean(o.recurring)

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Thiếu hoặc sai định dạng ngày (yyyy-mm-dd).' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('global_holidays')
    .upsert({ date, label, recurring }, { onConflict: 'date' })
    .select('id,date,label,recurring')
    .single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ holiday: data })
}

export async function DELETE(request: Request) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Thiếu id.' }, { status: 400 })
  }
  const supabase = createSupabaseAdmin()
  const { error } = await supabase.from('global_holidays').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
