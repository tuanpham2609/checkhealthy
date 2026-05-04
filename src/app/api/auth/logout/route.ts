/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import { NextResponse } from 'next/server'
import { AUTH_COOKIE } from '@/lib/auth/session'

export async function POST() {
  const res = NextResponse.json({ ok: true }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
  res.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
