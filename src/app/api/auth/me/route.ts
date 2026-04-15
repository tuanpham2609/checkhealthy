/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'

const NO_CACHE = { 'Cache-Control': 'no-store, max-age=0' }

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401, headers: NO_CACHE })
  }
  return NextResponse.json(
    { user: { id: user.uid, username: user.username, role: user.role } },
    { headers: NO_CACHE },
  )
}
