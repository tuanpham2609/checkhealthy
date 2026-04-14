/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const AUTH_COOKIE = 'auth_token'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.png' ||
    pathname === '/apple-icon.png' ||
    pathname === '/manifest.json'
  )
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (isStaticAsset(pathname) || isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value

  if (!token) {
    return redirectToLogin(req)
  }

  const secret = process.env.AUTH_JWT_SECRET
  if (!secret) {
    return redirectToLogin(req)
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret))
    return NextResponse.next()
  } catch {
    const res = redirectToLogin(req)
    res.cookies.set(AUTH_COOKIE, '', { maxAge: 0, path: '/' })
    return res
  }
}

function redirectToLogin(req: NextRequest): NextResponse {
  const loginUrl = new URL('/login', req.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
