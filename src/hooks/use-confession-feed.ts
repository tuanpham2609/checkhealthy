/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ConfessionPost } from '@/types/confession.types'

export const CONFESSION_PAGE_SIZE = 25

async function parseJsonError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string }
    return j.error ?? `Lỗi ${res.status}`
  } catch {
    return `Lỗi ${res.status}`
  }
}

interface ListResponse {
  posts?: ConfessionPost[]
  page?: number
  total?: number
  totalPages?: number
}

export function useConfessionFeed() {
  const [posts, setPosts] = useState<ConfessionPost[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (targetPage: number) => {
    const res = await fetch(
      `/api/confession/posts?page=${targetPage}&limit=${CONFESSION_PAGE_SIZE}`,
      { cache: 'no-store' }
    )
    if (!res.ok) {
      setError(await parseJsonError(res))
      setPosts([])
      return
    }
    setError(null)
    const data = (await res.json()) as ListResponse
    setPosts(Array.isArray(data.posts) ? data.posts : [])
    setPage(typeof data.page === 'number' ? data.page : targetPage)
    setTotal(typeof data.total === 'number' ? data.total : 0)
    setTotalPages(typeof data.totalPages === 'number' ? Math.max(1, data.totalPages) : 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await load(page)
      if (!cancelled) setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [page, load])

  const setPageSafe = useCallback((p: number) => {
    setPage(Math.max(1, p))
  }, [])

  const refresh = useCallback(async () => {
    await load(page)
  }, [load, page])

  const addPost = useCallback(
    async (content: string, author: string, imageUrls: string[]) => {
      if (!content.trim() && imageUrls.length === 0) return
      const res = await fetch('/api/confession/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          author: author.trim() || undefined,
          imageUrls,
        }),
      })
      if (!res.ok) {
        setError(await parseJsonError(res))
        return
      }
      setError(null)
      if (page !== 1) {
        setPage(1)
      } else {
        await load(1)
      }
    },
    [load, page]
  )

  const addComment = useCallback(
    async (postId: string, content: string, author: string) => {
      const trimmed = content.trim()
      if (!trimmed) return
      const res = await fetch(`/api/confession/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          author: author.trim() || undefined,
        }),
      })
      if (!res.ok) {
        setError(await parseJsonError(res))
        return
      }
      setError(null)
      await load(page)
    },
    [load, page]
  )

  const updatePostLike = useCallback((postId: string, likeCount: number, liked: boolean) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likeCount, liked } : p)))
  }, [])

  const addReply = useCallback(
    async (postId: string, commentId: string, content: string, author: string) => {
      const trimmed = content.trim()
      if (!trimmed) return
      const res = await fetch(`/api/confession/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          author: author.trim() || undefined,
          parentId: commentId,
        }),
      })
      if (!res.ok) {
        setError(await parseJsonError(res))
        return
      }
      setError(null)
      await load(page)
    },
    [load, page]
  )

  return {
    posts,
    page,
    total,
    totalPages,
    ready,
    error,
    refresh,
    setPage: setPageSafe,
    addPost,
    addComment,
    addReply,
    updatePostLike,
  }
}
