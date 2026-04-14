/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { cookies } from 'next/headers'
import { verifyToken, type AuthTokenPayload } from './jwt'

export const AUTH_COOKIE = 'auth_token'

export async function getSessionUser(): Promise<AuthTokenPayload | null> {
  const store = await cookies()
  const token = store.get(AUTH_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}
