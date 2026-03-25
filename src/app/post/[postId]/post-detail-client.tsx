/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/atoms/theme-toggle'
import { ConfessionPostCard } from '@/components/confession/confession-post-card'
import { SITE_METADATA } from '@/constants/site-metadata.constants'
import type { ConfessionPost } from '@/types/confession.types'
import { cn } from '@/lib/styles'

async function parseJsonError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string }
    return j.error ?? `Lỗi ${res.status}`
  } catch {
    return `Lỗi ${res.status}`
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface PostDetailClientProps {
  postId: string
}

export function PostDetailClient({ postId }: PostDetailClientProps) {
  const [post, setPost] = useState<ConfessionPost | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPost = useCallback(async () => {
    if (!UUID_RE.test(postId)) {
      setError('Liên kết bài viết không hợp lệ')
      setPost(null)
      setReady(true)
      return
    }
    setReady(false)
    setError(null)
    const res = await fetch(`/api/confession/posts/${postId}`, { cache: 'no-store' })
    if (res.status === 404) {
      setError('Không tìm thấy bài viết')
      setPost(null)
      setReady(true)
      return
    }
    if (!res.ok) {
      setError(await parseJsonError(res))
      setPost(null)
      setReady(true)
      return
    }
    const data = (await res.json()) as { post?: ConfessionPost }
    setPost(data.post ?? null)
    setError(null)
    setReady(true)
  }, [postId])

  useEffect(() => {
    void loadPost()
  }, [loadPost])

  const addComment = useCallback(
    async (pid: string, content: string, author: string) => {
      const trimmed = content.trim()
      if (!trimmed) return
      const res = await fetch(`/api/confession/posts/${pid}/comments`, {
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
      await loadPost()
    },
    [loadPost]
  )

  const addReply = useCallback(
    async (pid: string, commentId: string, content: string, author: string) => {
      const trimmed = content.trim()
      if (!trimmed) return
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
        setError(await parseJsonError(res))
        return
      }
      setError(null)
      await loadPost()
    },
    [loadPost]
  )

  const syncLike = useCallback((pid: string, likeCount: number, liked: boolean) => {
    setPost((p) => (p && p.id === pid ? { ...p, likeCount, liked } : p))
  }, [])

  return (
    <div className='min-h-dvh bg-[#f0f2f5] text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100'>
      <header className='sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur-xl transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/85 dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]'>
        <div className='mx-auto flex max-w-[680px] items-center justify-between gap-3 px-4 py-3 lg:max-w-2xl'>
          <div className='flex min-w-0 flex-1 items-center gap-2.5'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--highlight)] to-[var(--highlight-strong)] text-lg shadow-md ring-2 ring-[color-mix(in_lab,var(--highlight)_30%,transparent)]'>
              🤍
            </div>
            <div className='min-w-0'>
              <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--highlight-strong)] dark:text-[var(--highlight)]'>
                Cộng đồng IVF
              </p>
              <p className='font-serif truncate text-lg font-semibold leading-tight tracking-tight text-slate-900 dark:text-zinc-50'>
                {SITE_METADATA.titleHeader}
              </p>
              <p className='line-clamp-2 text-xs text-slate-500 dark:text-zinc-400 sm:line-clamp-1'>{SITE_METADATA.tagline}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className='mx-auto max-w-[680px] px-3 py-4 sm:px-4 lg:max-w-2xl'>
        {error && (
          <div
            role='alert'
            className='mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 transition-colors duration-300 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100'
          >
            {error}
          </div>
        )}

        {ready ? (
          <nav
            className='mb-4 border-b border-slate-200/80 pb-3 dark:border-zinc-800/90'
            aria-label='Quay về danh sách'
          >
            <Link
              href='/'
              className='inline-flex max-w-full items-center gap-2 rounded-lg text-sm font-medium text-slate-600 transition-colors hover:text-[var(--highlight-strong)] dark:text-zinc-400 dark:hover:text-[var(--highlight)]'
            >
              <ArrowLeft className='size-4 shrink-0' aria-hidden />
              <span>Trang chủ</span>
            </Link>
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
        ) : ready && !error ? (
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
