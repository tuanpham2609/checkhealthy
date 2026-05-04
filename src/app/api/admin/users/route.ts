/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
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

export async function GET() {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const session = await getSessionUser()
  if (!session || session.role !== 'superadmin') return forbidden()

  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('app_users')
    .select('id, username, display_name, role, is_active, created_at, updated_at')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data ?? [] })
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return serviceUnavailable()
  const session = await getSessionUser()
  if (!session || session.role !== 'superadmin') return forbidden()

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Body không hợp lệ.' }, { status: 400 })
  }

  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const role = body.role === 'superadmin' ? 'superadmin' : 'admin'

  if (!username || username.length < 3) {
    return NextResponse.json({ error: 'Tên đăng nhập cần ít nhất 3 ký tự.' }, { status: 400 })
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Mật khẩu cần ít nhất 6 ký tự.' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()

  const { data: existing } = await supabase
    .from('app_users')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Tên đăng nhập đã tồn tại.' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('app_users')
    .insert({
      username,
      display_name: displayName || username,
      password_hash: `crypt_placeholder`,
      role,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: pwErr } = await supabase.rpc('change_password', {
    p_user_id: data.id,
    p_new_password: password,
  })

  if (pwErr) return NextResponse.json({ error: pwErr.message }, { status: 500 })

  return NextResponse.json({ id: data.id })
}
