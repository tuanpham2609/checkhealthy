/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { CONFESSION_PAGE_SIZE } from '@/lib/confession/constants'
import { fetchConfessionPostsList, parseJsonError } from '@/lib/confession/fetchers'
import { confessionKeys } from '@/lib/confession/query-keys'
import type { ConfessionPost } from '@/types/confession.types'

export { CONFESSION_PAGE_SIZE } from '@/lib/confession/constants'

export function useConfessionFeed() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const query = useQuery({
    queryKey: confessionKeys.postsList(page, CONFESSION_PAGE_SIZE),
    queryFn: () => fetchConfessionPostsList(page, CONFESSION_PAGE_SIZE),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })

  const posts = query.data?.posts ?? []
  const total = query.data?.total ?? 0
  const totalPages = query.data?.totalPages ?? 1
  const ready = query.isSuccess || query.isError
  const error = useMemo(() => {
    if (query.isError && query.error instanceof Error) return query.error.message
    return mutationError
  }, [query.isError, query.error, mutationError])

  const setPageSafe = useCallback((p: number) => {
    setPage(Math.max(1, p))
  }, [])

  const refresh = useCallback(async () => {
    await query.refetch()
  }, [query])

  const updatePostLike = useCallback(
    (postId: string, likeCount: number, liked: boolean) => {
      queryClient.setQueriesData<{ posts: ConfessionPost[]; page: number; total: number; totalPages: number }>(
        { queryKey: confessionKeys.posts() },
        (old) => {
          if (!old?.posts) return old
          return {
            ...old,
            posts: old.posts.map((p) => (p.id === postId ? { ...p, likeCount, liked } : p)),
          }
        }
      )
      queryClient.setQueryData<ConfessionPost | null>(confessionKeys.post(postId), (old) =>
        old && old.id === postId ? { ...old, likeCount, liked } : old
      )
    },
    [queryClient]
  )

  const addPost = useCallback(
    async (content: string, author: string, imageUrls: string[]) => {
      if (!content.trim() && imageUrls.length === 0) return
      setMutationError(null)
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
        setMutationError(await parseJsonError(res))
        return
      }
      await queryClient.invalidateQueries({ queryKey: confessionKeys.posts() })
      if (page !== 1) {
        setPage(1)
      }
    },
    [page, queryClient]
  )

  const addComment = useCallback(
    async (postId: string, content: string, author: string) => {
      const trimmed = content.trim()
      if (!trimmed) return
      setMutationError(null)
      const res = await fetch(`/api/confession/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          author: author.trim() || undefined,
        }),
      })
      if (!res.ok) {
        setMutationError(await parseJsonError(res))
        return
      }
      await queryClient.invalidateQueries({ queryKey: confessionKeys.posts() })
      await queryClient.invalidateQueries({ queryKey: confessionKeys.post(postId) })
    },
    [queryClient]
  )

  const addReply = useCallback(
    async (postId: string, commentId: string, content: string, author: string) => {
      const trimmed = content.trim()
      if (!trimmed) return
      setMutationError(null)
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
        setMutationError(await parseJsonError(res))
        return
      }
      await queryClient.invalidateQueries({ queryKey: confessionKeys.posts() })
      await queryClient.invalidateQueries({ queryKey: confessionKeys.post(postId) })
    },
    [queryClient]
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
