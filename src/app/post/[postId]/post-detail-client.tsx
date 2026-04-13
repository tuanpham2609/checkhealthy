/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { ClientNavLink } from '@/components/atoms/client-nav-link'
import { ThemeToggle } from '@/components/atoms/theme-toggle'
import { ConfessionPostCard } from '@/components/confession/confession-post-card'
import { SITE_METADATA } from '@/constants/site-metadata.constants'
import { fetchConfessionPost, parseJsonError } from '@/lib/confession/fetchers'
import { confessionKeys } from '@/lib/confession/query-keys'
import type { ConfessionPost } from '@/types/confession.types'
import { cn } from '@/lib/styles'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface PostDetailClientProps {
  postId: string
}

export function PostDetailClient({ postId }: PostDetailClientProps) {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const invalidId = !UUID_RE.test(postId)

  const query = useQuery({
    queryKey: confessionKeys.post(postId),
    queryFn: () => fetchConfessionPost(postId),
    enabled: !invalidId,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  })

  const errorMessage = useMemo(() => {
    if (invalidId) return 'Liên kết bài viết không hợp lệ'
    if (query.isError && query.error instanceof Error) return query.error.message
    if (query.isSuccess && query.data === null) return 'Không tìm thấy bài viết'
    return null
  }, [invalidId, query.isError, query.isSuccess, query.data, query.error])

  const bannerError = errorMessage ?? actionError

  const ready = invalidId || !query.isPending
  const post = query.data ?? null

  const addComment = useCallback(
    async (pid: string, content: string, author: string) => {
      const trimmed = content.trim()
      if (!trimmed) return
      setActionError(null)
      const res = await fetch(`/api/confession/posts/${pid}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          author: author.trim() || undefined,
        }),
      })
      if (!res.ok) {
        setActionError(await parseJsonError(res))
        return
      }
      await queryClient.invalidateQueries({ queryKey: confessionKeys.post(pid) })
      await queryClient.invalidateQueries({ queryKey: confessionKeys.posts() })
    },
    [queryClient]
  )

  const addReply = useCallback(
    async (pid: string, commentId: string, content: string, author: string) => {
      const trimmed = content.trim()
      if (!trimmed) return
      setActionError(null)
      const res = await fetch(`/api/confession/posts/${pid}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          author: author.trim() || undefined,
          parentId: commentId,
        }),
      })
      if (!res.ok) {
        setActionError(await parseJsonError(res))
        return
      }
      await queryClient.invalidateQueries({ queryKey: confessionKeys.post(pid) })
      await queryClient.invalidateQueries({ queryKey: confessionKeys.posts() })
    },
    [queryClient]
  )

  const syncLike = useCallback(
    (pid: string, likeCount: number, liked: boolean) => {
      queryClient.setQueryData<ConfessionPost | null>(confessionKeys.post(pid), (old) =>
        old && old.id === pid ? { ...old, likeCount, liked } : old
      )
      queryClient.setQueriesData<{ posts: ConfessionPost[]; page: number; total: number; totalPages: number }>(
        { queryKey: confessionKeys.posts() },
        (old) => {
          if (!old?.posts) return old
          return {
            ...old,
            posts: old.posts.map((p) => (p.id === pid ? { ...p, likeCount, liked } : p)),
          }
        }
      )
    },
    [queryClient]
  )

  return (
    <div className='min-h-dvh bg-[#f0f2f5] text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100'>
      <header className='sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur-xl transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]'>
        <div className='mx-auto flex max-w-[680px] items-center justify-between gap-3 px-4 py-3 lg:max-w-2xl'>
          <button
            type='button'
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border-0 bg-transparent p-0 text-left text-inherit ring-offset-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--highlight)] focus-visible:ring-offset-2 dark:ring-offset-zinc-950'
            aria-label='Cuộn lên đầu trang'
          >
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--highlight)] to-[var(--highlight-strong)] text-lg shadow-md ring-2 ring-[color-mix(in_lab,var(--highlight)_30%,transparent)]'>
              🤍
            </div>
            <div className='min-w-0'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--highlight-strong)] dark:text-[var(--highlight)]'>
                Viết ẩn danh
              </p>
              <p className='font-serif truncate text-lg font-semibold leading-tight tracking-tight text-slate-900 dark:text-zinc-50'>
                {SITE_METADATA.titleHeader}
              </p>
              <p className='line-clamp-2 text-xs text-slate-500 dark:text-zinc-400 sm:line-clamp-1'>{SITE_METADATA.tagline}</p>
            </div>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className='mx-auto max-w-[680px] px-3 py-4 sm:px-4 lg:max-w-2xl'>
        {bannerError && (
          <div
            role='alert'
            className='mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 transition-colors duration-300 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100'
          >
            {bannerError}
          </div>
        )}

        {ready ? (
          <nav
            className='mb-4 border-b border-slate-200/80 pb-3 dark:border-zinc-800/90'
            aria-label='Quay về danh sách'
          >
            <ClientNavLink
              href='/'
              className='inline-flex max-w-full items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition-colors hover:text-[var(--highlight-strong)] dark:text-zinc-400 dark:hover:text-[var(--highlight)]'
            >
              <ArrowLeft className='size-4 shrink-0' aria-hidden />
              <span>Trang chủ</span>
            </ClientNavLink>
          </nav>
        ) : null}

        {!ready ? (
          <p className='py-12 text-center text-sm text-slate-500 dark:text-zinc-400'>Đang tải bài viết…</p>
        ) : post ? (
          <ConfessionPostCard
            post={post}
            onComment={addComment}
            onReply={addReply}
            detailMode
            onLikeSync={syncLike}
          />
        ) : ready && !post && !errorMessage ? (
          <p className='rounded-2xl border border-dashed border-slate-300/90 bg-white/70 px-4 py-12 text-center text-sm text-slate-600 shadow-sm ring-1 ring-slate-900/5 transition-colors duration-300 dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400 dark:ring-white/10'>
            Không có dữ liệu bài viết.
          </p>
        ) : null}

        <p className={cn('mt-8 pb-8 text-center text-sm leading-relaxed text-slate-400 dark:text-zinc-500')}>
          {SITE_METADATA.footerMessage}
        </p>
      </main>
    </div>
  )
}
