/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export interface AuthTokenPayload extends JWTPayload {
  uid: string
  username: string
  role: 'superadmin' | 'admin'
}

const ALG = 'HS256'
const TOKEN_TTL = '7d'

function getSecret(): Uint8Array {
  const raw = process.env.AUTH_JWT_SECRET
  if (!raw) throw new Error('Thiếu AUTH_JWT_SECRET trong .env.local')
  return new TextEncoder().encode(raw)
}

export async function signToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as AuthTokenPayload
  } catch {
    return null
  }
}
