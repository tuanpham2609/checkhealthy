/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { RefreshCw } from 'lucide-react'
import { ThemeToggle } from '@/components/atoms/theme-toggle'
import { useConfessionFeed } from '@/hooks/use-confession-feed'
import { ConfessionComposer } from '@/components/confession/confession-composer'
import { ConfessionPagination } from '@/components/confession/confession-pagination'
import { ConfessionPostCard } from '@/components/confession/confession-post-card'
import { SITE_METADATA } from '@/constants/site-metadata.constants'
import { cn } from '@/lib/styles'

export function ConfessionPage() {
  const { posts, page, totalPages, ready, error, refresh, setPage, addPost, addComment, addReply, updatePostLike } =
    useConfessionFeed()

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
              <h1 className='font-serif truncate text-lg font-semibold leading-tight tracking-tight text-slate-900 dark:text-zinc-50'>
                {SITE_METADATA.titleHeader}
              </h1>
              <p className='line-clamp-2 text-xs text-slate-500 dark:text-zinc-400 sm:line-clamp-1'>{SITE_METADATA.tagline}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className='mx-auto max-w-[680px] px-3 py-4 sm:px-4 lg:max-w-2xl'>
        <section className='ui-surface mb-4 px-4 py-3.5' aria-labelledby='ivf-intro-heading'>
          <h2 id='ivf-intro-heading' className='font-serif text-sm font-semibold tracking-tight text-slate-800 dark:text-zinc-100'>
            Gửi những điều bạn đang mang theo trong hành trình IVF
          </h2>
          <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400'>{SITE_METADATA.introParagraph}</p>
        </section>

        {error && (
          <div
            role='alert'
            className='mb-4 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 transition-colors duration-300 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between'
          >
            <p className='min-w-0 flex-1'>{error}</p>
            <button
              type='button'
              onClick={() => void refresh()}
              className='inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700'
            >
              <RefreshCw className='size-3.5' aria-hidden />
              Thử lại
            </button>
          </div>
        )}

        <ConfessionComposer onSubmit={addPost} className='mb-4' />

        {!ready ? (
          <p className='py-12 text-center text-sm text-slate-500 dark:text-zinc-400'>Đang tải những chia sẻ…</p>
        ) : posts.length === 0 && !error ? (
          <p className='rounded-2xl border border-dashed border-slate-300/90 bg-white/70 px-4 py-12 text-center text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-900/5 transition-colors duration-300 dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400 dark:ring-white/10'>
            Chưa có tâm sự nào. Nếu hôm nay bạn cần một nơi để viết ra — về thuốc, về chờ đợi, về hy vọng hay mệt mỏi — hãy là người mở lời đầu tiên. Có thể bạn sẽ giúp một chị em khác cảm thấy bớt cô đơn.
          </p>
        ) : posts.length === 0 && error ? (
          <p className='rounded-2xl border border-dashed border-slate-300/90 bg-white/70 py-12 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-900/5 transition-colors duration-300 dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400 dark:ring-white/10'>
            Không tải được dữ liệu. Kiểm tra Supabase và file{' '}
            <code className='rounded bg-slate-100 px-1 dark:bg-zinc-800'>.env.local</code>.
          </p>
        ) : (
          <>
            <ul className='flex flex-col gap-4'>
              {posts.map((post) => (
                <li key={post.id}>
                  <ConfessionPostCard
                    post={post}
                    onComment={addComment}
                    onReply={addReply}
                    onLikeSync={updatePostLike}
                  />
                </li>
              ))}
            </ul>
            <ConfessionPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}

        <p className={cn('mt-8 pb-8 text-center text-sm leading-relaxed text-slate-400 dark:text-zinc-500')}>
          {SITE_METADATA.footerMessage}
        </p>
      </main>
    </div>
  )
}
