/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useEffect, useState } from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { ClientNavLink } from '@/components/atoms/client-nav-link'
import { formatRelativeTime } from '@/lib/confession-time'
import { copyPostUrlToClipboard, getPostPublicUrl } from '@/lib/confession/post-share-url'
import type { ConfessionPost } from '@/types/confession.types'
import { AvatarCircle } from '@/components/confession/avatar-circle'
import { ConfessionCommentBlock } from '@/components/confession/confession-comment-block'
import { ConfessionImageLightbox } from '@/components/confession/confession-image-lightbox'
import { SITE_METADATA } from '@/constants/site-metadata.constants'
import { cn } from '@/lib/styles'

interface ConfessionPostCardProps {
  post: ConfessionPost
  onComment: (postId: string, content: string, author: string) => void | Promise<void>
  onReply: (postId: string, commentId: string, content: string, author: string) => void | Promise<void>
  /** Trên trang chi tiết: không điều hướng khi bấm vào thẻ */
  detailMode?: boolean
  /** Sau khi tim thành công (đồng bộ feed) */
  onLikeSync?: (postId: string, likeCount: number, liked: boolean) => void
  className?: string
}

export function ConfessionPostCard({
  post,
  onComment,
  onReply,
  detailMode = false,
  onLikeSync,
  className,
}: ConfessionPostCardProps) {
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentName, setCommentName] = useState('')
  const [commentPending, setCommentPending] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [liked, setLiked] = useState(!!post.liked)
  const [likePending, setLikePending] = useState(false)
  const [shareHint, setShareHint] = useState<string | null>(null)

  useEffect(() => {
    setLikeCount(post.likeCount)
    setLiked(!!post.liked)
  }, [post.id, post.likeCount, post.liked])

  async function toggleLike() {
    if (likePending) return
    const prevCount = likeCount
    const prevLiked = liked
    setLikePending(true)
    setLiked(!prevLiked)
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1)
    try {
      const res = await fetch(`/api/confession/posts/${post.id}/like`, {
        method: 'POST',
        credentials: 'same-origin',
      })
      if (!res.ok) {
        setLikeCount(prevCount)
        setLiked(prevLiked)
        return
      }
      const data = (await res.json()) as { likeCount: number; liked: boolean }
      setLikeCount(data.likeCount)
      setLiked(data.liked)
      onLikeSync?.(post.id, data.likeCount, data.liked)
    } catch {
      setLikeCount(prevCount)
      setLiked(prevLiked)
    } finally {
      setLikePending(false)
    }
  }

  async function sharePost() {
    const url = getPostPublicUrl(post.id)
    const title = SITE_METADATA.titleHeader
    const text = post.content.trim().slice(0, 120) || title

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url })
        setShareHint('Đã mở chia sẻ')
        window.setTimeout(() => setShareHint(null), 2000)
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        /* không có quyền / lỗi → copy */
      }
    }

    const ok = await copyPostUrlToClipboard(post.id)
    if (ok) {
      setShareHint('Đã copy link')
      window.setTimeout(() => setShareHint(null), 2000)
      return
    }

    setShareHint(`Không copy được — copy thủ công: ${url}`)
    window.setTimeout(() => setShareHint(null), 8000)
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || commentPending) return
    setCommentPending(true)
    try {
      await onComment(post.id, commentText, commentName)
      setCommentText('')
      setCommentName('')
    } finally {
      setCommentPending(false)
    }
  }

  const headerBlock = (
    <>
      <div className='flex flex-wrap items-baseline gap-x-2'>
        <h3 className='font-serif text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-100'>
          {post.author}
        </h3>
        <time
          className='text-xs text-slate-500 dark:text-zinc-400'
          dateTime={new Date(post.createdAt).toISOString()}
        >
          {formatRelativeTime(post.createdAt)}
        </time>
      </div>
      {post.content ? (
        <p className='mt-2 whitespace-pre-wrap text-[15px] leading-relaxed tracking-[0.01em] text-slate-800 dark:text-zinc-200'>
          {post.content}
        </p>
      ) : null}
    </>
  )

  const linkClass = cn(
    'flex gap-3 p-3 sm:p-4 text-inherit no-underline outline-none transition-colors',
    'hover:bg-slate-50/80 dark:hover:bg-zinc-800/50',
    'focus-visible:ring-2 focus-visible:ring-[var(--highlight)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950'
  )
  const detailHref = `/post/${post.id}`

  return (
    <>
    <article className={cn('ui-surface', className)}>
      {!detailMode ? (
        <ClientNavLink href={detailHref} className={linkClass} aria-label='Xem chi tiết bài viết'>
          <div className='shrink-0'>
            <AvatarCircle name={post.author} size='lg' />
          </div>
          <div className='min-w-0 flex-1'>{headerBlock}</div>
        </ClientNavLink>
      ) : (
        <div className='flex gap-3 p-3 sm:p-4'>
          <div className='shrink-0'>
            <AvatarCircle name={post.author} size='lg' />
          </div>
          <div className='min-w-0 flex-1'>{headerBlock}</div>
        </div>
      )}

      {post.imageUrls?.length ? (
        <div className='mt-3 grid grid-cols-2 gap-2 px-3 sm:grid-cols-3 sm:px-4'>
          {post.imageUrls.map((src, i) => (
            <button
              key={`${post.id}-img-${i}`}
              type='button'
              onClick={() => setLightboxIndex(i)}
              className='relative aspect-square cursor-zoom-in overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80 transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[var(--highlight)] focus-visible:ring-offset-2 focus-visible:outline-none dark:ring-zinc-600'
              aria-label={`Xem ảnh ${i + 1} phóng to`}
            >
              <img
                src={src}
                alt=''
                className='absolute inset-0 h-full w-full object-cover'
                loading='lazy'
                decoding='async'
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className='mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 pt-2 pb-px sm:px-4 dark:border-zinc-800'>
        <button
          type='button'
          onClick={toggleLike}
          disabled={likePending}
          aria-pressed={liked}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl border border-transparent px-2.5 py-2 text-sm font-medium transition-all hover:border-slate-200/80 hover:bg-slate-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80',
            liked
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-600 hover:text-[var(--highlight-strong)] dark:text-zinc-300 dark:hover:text-[var(--highlight)]'
          )}
        >
          <Heart className={cn('size-4', liked && 'fill-current')} aria-hidden />
          <span>Thả tim</span>
          {likeCount > 0 && <span className='text-slate-400 dark:text-zinc-500'>({likeCount})</span>}
        </button>
        <button
          type='button'
          onClick={() => void sharePost()}
          className='inline-flex items-center gap-1.5 rounded-xl border border-transparent px-2.5 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-200/80 hover:bg-slate-50 hover:text-[var(--highlight-strong)] dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 dark:hover:text-[var(--highlight)]'
        >
          <Share2 className='size-4' aria-hidden />
          Chia sẻ
        </button>
        {shareHint ? (
          <span className='max-w-[min(100%,14rem)] break-words text-xs text-slate-500 dark:text-zinc-400' role='status'>
            {shareHint}
          </span>
        ) : null}
        <button
          type='button'
          onClick={() => setShowCommentBox((v) => !v)}
          className='inline-flex items-center gap-1.5 rounded-xl border border-transparent px-2.5 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-200/80 hover:bg-slate-50 hover:text-[var(--highlight-strong)] dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/80 dark:hover:text-[var(--highlight)]'
        >
          <MessageCircle className='size-4' aria-hidden />
          Bình luận
          {post.comments.length > 0 && (
            <span className='text-slate-400 dark:text-zinc-500'>({post.comments.length})</span>
          )}
        </button>
      </div>

      <div className='px-3 pb-3 sm:px-4'>
        {showCommentBox && (
          <form onSubmit={submitComment} className='ui-surface-muted mt-3 space-y-2'>
            <input
              type='text'
              placeholder='Tên hiển thị (tuỳ chọn)'
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className='ui-input-sm'
              maxLength={40}
            />
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder='Viết bình luận...'
              rows={2}
              className='ui-input-sm resize-none'
              maxLength={2000}
            />
            <div className='flex justify-end'>
              <button type='submit' disabled={!commentText.trim() || commentPending} className='ui-btn-primary-sm'>
                {commentPending ? 'Đang gửi…' : 'Gửi bình luận'}
              </button>
            </div>
          </form>
        )}

        {post.comments.length > 0 && (
          <div className='mt-4 space-y-4 border-t border-slate-100 pt-4 transition-colors duration-300 dark:border-zinc-800'>
            {post.comments.map((c) => (
              <ConfessionCommentBlock key={c.id} postId={post.id} comment={c} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </article>

    {lightboxIndex !== null && post.imageUrls && post.imageUrls.length > 0 ? (
      <ConfessionImageLightbox
        urls={post.imageUrls}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    ) : null}
    </>
  )
}
