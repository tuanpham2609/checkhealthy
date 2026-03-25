/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

/** Cookie HttpOnly định danh ẩn danh cho tim (1 năm) */
export const VISITOR_COOKIE_NAME = 'confession_vid'

const MAX_AGE_SEC = 60 * 60 * 24 * 365

function parseCookieHeader(header: string | null, name: string): string | undefined {
  if (!header?.trim()) return undefined
  const parts = header.split(';')
  for (const p of parts) {
    const [k, ...rest] = p.trim().split('=')
    if (k === name && rest.length > 0) return rest.join('=').trim()
  }
  return undefined
}

/**
 * Đọc visitor id từ header Cookie của request (Route Handler).
 */
export function getVisitorIdFromRequest(request: Request): string | undefined {
  return parseCookieHeader(request.headers.get('cookie'), VISITOR_COOKIE_NAME)
}

/**
 * Tạo Set-Cookie nếu chưa có id hợp lệ; trả id dùng cho DB.
 */
export function ensureVisitorId(existing: string | undefined): { id: string; setCookie: string | null } {
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (existing && uuidRe.test(existing)) {
    return { id: existing, setCookie: null }
  }
  const id = crypto.randomUUID()
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const setCookie = `${VISITOR_COOKIE_NAME}=${id}; Path=/; Max-Age=${MAX_AGE_SEC}; HttpOnly; SameSite=Lax${secure}`
  return { id, setCookie }
}
