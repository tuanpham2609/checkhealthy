/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/confession-time'
import type { ConfessionPost } from '@/types/confession.types'
import { AvatarCircle } from '@/components/confession/avatar-circle'
import { ConfessionCommentBlock } from '@/components/confession/confession-comment-block'
import { cn } from '@/lib/styles'

interface ConfessionPostCardProps {
  post: ConfessionPost
  onComment: (postId: string, content: string, author: string) => void | Promise<void>
  onReply: (postId: string, commentId: string, content: string, author: string) => void | Promise<void>
  className?: string
}

export function ConfessionPostCard({ post, onComment, onReply, className }: ConfessionPostCardProps) {
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentName, setCommentName] = useState('')
  const [commentPending, setCommentPending] = useState(false)

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

  return (
    <article className={cn('ui-surface', className)}>
      <div className='flex gap-3 p-3 sm:p-4'>
        <AvatarCircle name={post.author} size='lg' />
        <div className='min-w-0 flex-1'>
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

          {post.imageUrls?.length ? (
            <div className='mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {post.imageUrls.map((src) => (
                <a
                  key={src}
                  href={src}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='relative aspect-square overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80'
                >
                  <Image src={src} alt='' fill className='object-cover' sizes='(max-width:640px) 45vw, 200px' />
                </a>
              ))}
            </div>
          ) : null}

          <div className='mt-3 border-t border-slate-100 pt-2 transition-colors duration-300 dark:border-zinc-800'>
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
      </div>
    </article>
  )
}
