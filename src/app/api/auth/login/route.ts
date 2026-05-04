/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'
import { signToken } from '@/lib/auth/jwt'
import { AUTH_COOKIE } from '@/lib/auth/session'

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Chưa cấu hình Supabase' }, { status: 500 })
  }

  let body: { username?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 })
  }

  const { username, password } = body
  if (!username?.trim() || !password) {
    return NextResponse.json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()

  const { data: user, error } = await supabase
    .from('app_users')
    .select('id, username, display_name, role, is_active')
    .eq('username', username.trim().toLowerCase())
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 })
  }

  // Verify password using pgcrypto's crypt()
  const { data: match } = await supabase.rpc('verify_password', {
    p_username: username.trim().toLowerCase(),
    p_password: password,
  })

  if (!match) {
    return NextResponse.json({ error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 })
  }

  if (!user.is_active) {
    return NextResponse.json({ error: 'Tài khoản đã bị vô hiệu hóa' }, { status: 403 })
  }

  const token = await signToken({
    uid: user.id,
    username: user.username,
    role: user.role,
  })

  const res = NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role,
    },
  })

  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })

  return res
}
