/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import type { ConfessionComment, ConfessionPost, ConfessionReply } from '@/types/confession.types'

export interface ConfessionPostRow {
  id: string
  author: string
  content: string
  created_at: string
  image_urls?: unknown
}

export interface ConfessionCommentRow {
  id: string
  post_id: string
  parent_id: string | null
  author: string
  content: string
  created_at: string
}

export function mapRowsToPosts(posts: ConfessionPostRow[], comments: ConfessionCommentRow[]): ConfessionPost[] {
  const topByPost = new Map<string, ConfessionCommentRow[]>()
  const repliesByParent = new Map<string, ConfessionCommentRow[]>()

  for (const c of comments) {
    if (c.parent_id === null) {
      const arr = topByPost.get(c.post_id) ?? []
      arr.push(c)
      topByPost.set(c.post_id, arr)
    } else {
      const arr = repliesByParent.get(c.parent_id) ?? []
      arr.push(c)
      repliesByParent.set(c.parent_id, arr)
    }
  }

  const sortByTime = (a: ConfessionCommentRow, b: ConfessionCommentRow) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()

  function parseImageUrls(raw: unknown): string[] {
    if (raw == null) return []
    if (Array.isArray(raw)) {
      return raw.filter((u): u is string => typeof u === 'string')
    }
    return []
  }

  return posts.map((p) => {
    const tops = (topByPost.get(p.id) ?? []).sort(sortByTime)
    const confessionComments: ConfessionComment[] = tops.map((c) => {
      const replyRows = (repliesByParent.get(c.id) ?? []).sort(sortByTime)
      const replies: ConfessionReply[] = replyRows.map((r) => ({
        id: r.id,
        author: r.author,
        content: r.content,
        createdAt: new Date(r.created_at).getTime(),
      }))
      return {
        id: c.id,
        author: c.author,
        content: c.content,
        createdAt: new Date(c.created_at).getTime(),
        replies,
      }
    })

    return {
      id: p.id,
      author: p.author,
      content: p.content,
      imageUrls: parseImageUrls(p.image_urls),
      createdAt: new Date(p.created_at).getTime(),
      comments: confessionComments,
    }
  })
}
