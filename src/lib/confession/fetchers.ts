/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { CONFESSION_PAGE_SIZE } from '@/lib/confession/constants'
import type { ConfessionSort } from '@/lib/confession/feed-sort'
import type { ConfessionPost } from '@/types/confession.types'

export async function parseJsonError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string }
    return j.error ?? `Lỗi ${res.status}`
  } catch {
    return `Lỗi ${res.status}`
  }
}

export interface ConfessionListResponse {
  posts: ConfessionPost[]
  page: number
  total: number
  totalPages: number
}

export async function fetchConfessionPostsList(
  page: number,
  limit: number = CONFESSION_PAGE_SIZE,
  sort: ConfessionSort = 'newest',
  q = ''
): Promise<ConfessionListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  })
  const trimmed = q.trim()
  if (trimmed) params.set('q', trimmed)

  const res = await fetch(`/api/confession/posts?${params.toString()}`, {
    cache: 'default',
  })
  if (!res.ok) {
    throw new Error(await parseJsonError(res))
  }
  const data = (await res.json()) as Partial<ConfessionListResponse> & { posts?: ConfessionPost[] }
  return {
    posts: Array.isArray(data.posts) ? data.posts : [],
    page: typeof data.page === 'number' ? data.page : page,
    total: typeof data.total === 'number' ? data.total : 0,
    totalPages: typeof data.totalPages === 'number' ? Math.max(1, data.totalPages) : 1,
  }
}

/** 404 → `null`; lỗi khác → throw */
export async function fetchConfessionPost(postId: string): Promise<ConfessionPost | null> {
  const res = await fetch(`/api/confession/posts/${postId}`, { cache: 'default' })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(await parseJsonError(res))
  }
  const data = (await res.json()) as { post?: ConfessionPost }
  return data.post ?? null
}
