/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { NextResponse } from 'next/server'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'
import { getSessionUser } from '@/lib/auth/session'

function forbidden() {
  return NextResponse.json({ error: 'Không có quyền truy cập.' }, { status: 403 })
}

function serviceUnavailable() {
  return NextResponse.json({ error: 'Chưa cấu hình Supabase.' }, { status: 503 })
}

export async function PUT(request: Request, ctx: { params: Promise<{ userId: string }> }) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const session = await getSessionUser()
  if (!session || session.role !== 'superadmin') return forbidden()

  const { userId } = await ctx.params

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ.' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()

  const patch: Record<string, unknown> = {}
  if (typeof body.displayName === 'string') patch.display_name = body.displayName.trim()
  if (body.role === 'superadmin' || body.role === 'admin') patch.role = body.role
  if (typeof body.isActive === 'boolean') patch.is_active = body.isActive

  if (Object.keys(patch).length === 0 && !body.password) {
    return NextResponse.json({ error: 'Không có trường cập nhật.' }, { status: 400 })
  }

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase.from('app_users').update(patch).eq('id', userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (typeof body.password === 'string' && body.password.length >= 6) {
    const { error: pwErr } = await supabase.rpc('change_password', {
      p_user_id: userId,
      p_new_password: body.password,
    })
    if (pwErr) return NextResponse.json({ error: pwErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ userId: string }> }) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const session = await getSessionUser()
  if (!session || session.role !== 'superadmin') return forbidden()

  const { userId } = await ctx.params

  if (userId === session.uid) {
    return NextResponse.json({ error: 'Không thể vô hiệu hóa chính mình.' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()
  const { error } = await supabase.from('app_users').update({ is_active: false }).eq('id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
