/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useState } from 'react'
import { formatRelativeTime } from '@/lib/confession-time'
import type { ConfessionComment, ConfessionReply } from '@/types/confession.types'
import { AvatarCircle } from '@/components/confession/avatar-circle'

interface ConfessionCommentBlockProps {
  postId: string
  comment: ConfessionComment
  onReply: (postId: string, commentId: string, content: string, author: string) => void | Promise<void>
}

function ReplyRow({ reply }: { reply: ConfessionReply }) {
  return (
    <div className='flex gap-2 rounded-lg bg-slate-50/90 px-2 py-2 transition-colors duration-300 dark:bg-zinc-800/70 sm:px-3'>
      <AvatarCircle name={reply.author} size='sm' />
      <div className='min-w-0 flex-1'>
        <div className='inline-block max-w-full rounded-2xl rounded-tl-sm bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-100 transition-colors duration-300 dark:bg-zinc-800 dark:ring-zinc-700'>
          <span className='text-xs font-semibold text-slate-900 dark:text-zinc-100'>{reply.author}</span>
          <p className='mt-0.5 whitespace-pre-wrap text-sm text-slate-800 dark:text-zinc-200'>{reply.content}</p>
        </div>
        <p className='mt-1 pl-1 text-xs text-slate-500 dark:text-zinc-400'>{formatRelativeTime(reply.createdAt)}</p>
      </div>
    </div>
  )
}

export function ConfessionCommentBlock({ postId, comment, onReply }: ConfessionCommentBlockProps) {
  const [openReply, setOpenReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyName, setReplyName] = useState('')
  const [replyPending, setReplyPending] = useState(false)

  async function submitReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyText.trim() || replyPending) return
    setReplyPending(true)
    try {
      await onReply(postId, comment.id, replyText, replyName)
      setReplyText('')
      setReplyName('')
      setOpenReply(false)
    } finally {
      setReplyPending(false)
    }
  }

  return (
    <div className='flex gap-2 sm:gap-3'>
      <AvatarCircle name={comment.author} size='md' />
      <div className='min-w-0 flex-1'>
        <div className='inline-block max-w-full rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 ring-1 ring-slate-200/80 transition-colors duration-300 dark:bg-zinc-800 dark:ring-zinc-700'>
          <span className='text-sm font-semibold text-slate-900 dark:text-zinc-100'>{comment.author}</span>
          <p className='mt-0.5 whitespace-pre-wrap text-[15px] leading-snug text-slate-800 dark:text-zinc-200'>
            {comment.content}
          </p>
        </div>
        <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pl-1 text-xs'>
          <span className='text-slate-500 dark:text-zinc-400'>{formatRelativeTime(comment.createdAt)}</span>
          <button
            type='button'
            onClick={() => setOpenReply((v) => !v)}
            className='font-semibold text-slate-600 hover:text-[var(--highlight-strong)] dark:text-zinc-300 dark:hover:text-[var(--highlight)]'
          >
            Trả lời
          </button>
        </div>

        {comment.replies.length > 0 && (
          <div className='mt-3 space-y-2 border-l-2 border-slate-200 pl-3 transition-colors duration-300 dark:border-zinc-700 sm:pl-4'>
            {comment.replies.map((r) => (
              <ReplyRow key={r.id} reply={r} />
            ))}
          </div>
        )}

        {openReply && (
          <form onSubmit={submitReply} className='ui-surface-muted mt-3 space-y-2'>
            <input
              type='text'
              placeholder='Tên (tuỳ chọn)'
              value={replyName}
              onChange={(e) => setReplyName(e.target.value)}
              className='ui-input-xs'
              maxLength={40}
            />
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Trả lời ${comment.author}...`}
              rows={2}
              className='ui-input-sm resize-none'
              maxLength={2000}
            />
            <div className='flex justify-end gap-2 pt-0.5'>
              <button type='button' onClick={() => setOpenReply(false)} className='ui-btn-ghost'>
                Huỷ
              </button>
              <button type='submit' disabled={!replyText.trim() || replyPending} className='ui-btn-primary-sm'>
                {replyPending ? 'Đang gửi…' : 'Gửi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
