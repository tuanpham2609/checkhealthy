/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

const MAX_POST = 5000
const MAX_COMMENT = 2000
const MAX_AUTHOR = 40
const MAX_IMAGES = 8

export function sanitizeAuthor(raw: unknown): string {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!s) return 'Ẩn danh'
  return s.slice(0, MAX_AUTHOR)
}

export function sanitizeContent(raw: unknown, max: number): string | null {
  if (typeof raw !== 'string') return null
  const s = raw.trim()
  if (!s) return null
  return s.slice(0, max)
}

function storagePublicPrefix(): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  if (!base) return null
  return `${base}/storage/v1/object/public/confession-media/`
}

export function sanitizeImageUrls(raw: unknown): string[] | { error: string } {
  if (raw === undefined || raw === null) return []
  if (!Array.isArray(raw)) return { error: 'imageUrls phải là mảng' }
  if (raw.length > MAX_IMAGES) return { error: `Tối đa ${MAX_IMAGES} ảnh` }
  const prefix = storagePublicPrefix()
  if (!prefix) return { error: 'Cấu hình Supabase URL thiếu' }

  const out: string[] = []
  for (const u of raw) {
    if (typeof u !== 'string') return { error: 'URL ảnh không hợp lệ' }
    const t = u.trim()
    if (!t.startsWith(prefix)) return { error: 'URL ảnh không hợp lệ (chỉ ảnh đã upload qua hệ thống)' }
    try {
      const parsed = new URL(t)
      if (parsed.protocol !== 'https:') return { error: 'URL ảnh không hợp lệ' }
    } catch {
      return { error: 'URL ảnh không hợp lệ' }
    }
    out.push(t)
  }
  return out
}

export function validatePostBody(
  body: unknown
): { author: string; content: string; imageUrls: string[] } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Body không hợp lệ' }
  const o = body as Record<string, unknown>

  const contentRaw = typeof o.content === 'string' ? o.content.trim().slice(0, MAX_POST) : ''
  const urls = sanitizeImageUrls(o.imageUrls)
  if ('error' in urls) return urls

  if (!contentRaw && urls.length === 0) {
    return { error: 'Cần nội dung hoặc ít nhất một ảnh' }
  }

  return {
    author: sanitizeAuthor(o.author),
    content: contentRaw,
    imageUrls: urls,
  }
}

export function validateCommentBody(body: unknown): { author: string; content: string; parentId: string | null } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Body không hợp lệ' }
  const o = body as Record<string, unknown>
  const content = sanitizeContent(o.content, MAX_COMMENT)
  if (!content) return { error: 'Nội dung bình luận không được để trống' }
  let parentId: string | null = null
  if (o.parentId !== undefined && o.parentId !== null) {
    if (typeof o.parentId !== 'string' || !/^[0-9a-f-]{36}$/i.test(o.parentId)) {
      return { error: 'parentId không hợp lệ' }
    }
    parentId = o.parentId
  }
  return { author: sanitizeAuthor(o.author), content, parentId }
}
