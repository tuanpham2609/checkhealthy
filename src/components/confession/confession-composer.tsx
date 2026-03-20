/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ImageIcon, Smile, SendHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/styles'
import { AvatarCircle } from '@/components/confession/avatar-circle'
import { EmojiQuickPicker } from '@/components/confession/emoji-quick-picker'

interface ConfessionComposerProps {
  onSubmit: (content: string, author: string, imageUrls: string[]) => void | Promise<void>
  className?: string
}

export function ConfessionComposer({ onSubmit, className }: ConfessionComposerProps) {
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertEmoji(emoji: string) {
    const el = textareaRef.current
    if (!el) {
      setContent((c) => c + emoji)
      return
    }
    const start = el.selectionStart ?? content.length
    const end = el.selectionEnd ?? content.length
    const next = content.slice(0, start) + emoji + content.slice(end)
    setContent(next)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + emoji.length
      el.setSelectionRange(pos, pos)
    })
  }

  async function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const next = [...imageUrls]
      for (const file of Array.from(files)) {
        if (next.length >= 8) break
        const fd = new FormData()
        fd.set('file', file)
        const res = await fetch('/api/confession/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string }
          alert(j.error ?? 'Upload ảnh thất bại')
          break
        }
        const { url } = (await res.json()) as { url?: string }
        if (url) next.push(url)
      }
      setImageUrls(next)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if ((!content.trim() && imageUrls.length === 0) || pending) return
    setPending(true)
    try {
      await onSubmit(content, author, imageUrls)
      setContent('')
      setImageUrls([])
    } finally {
      setPending(false)
    }
  }

  const displayName = author.trim() || 'Ẩn danh'
  const canSubmit = (content.trim().length > 0 || imageUrls.length > 0) && !pending

  return (
    <form onSubmit={handleSubmit} className={cn('ui-surface', className)}>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp,image/gif'
        multiple
        className='sr-only'
        aria-hidden
        onChange={onFilesSelected}
      />
      <div className='flex gap-3 p-3 sm:p-4'>
        <AvatarCircle name={displayName} size='lg' className='max-sm:hidden' />
        <div className='min-w-0 flex-1 space-y-3'>
          <input
            type='text'
            placeholder='Tên hoặc nickname (tuỳ chọn, có thể để Ẩn danh)'
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className='ui-input text-sm'
            maxLength={40}
          />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='Chia sẻ cảm xúc, cột mốc điều trị, điều lo lắng hay điều bạn cần được lắng nghe…'
            rows={3}
            maxLength={5000}
            className='ui-input min-h-[88px] resize-y'
          />

          {imageUrls.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {imageUrls.map((url) => (
                <div
                  key={url}
                  className='relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-zinc-600 dark:bg-zinc-800'
                >
                  <Image src={url} alt='' fill className='object-cover' sizes='80px' />
                  <button
                    type='button'
                    onClick={() => removeImage(url)}
                    className='absolute top-1 right-1 flex size-7 items-center justify-center rounded-xl border border-white/20 bg-black/55 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/75'
                    aria-label='Xóa ảnh'
                  >
                    <X className='size-3.5' />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className='flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 transition-colors duration-300 dark:border-zinc-800'>
            <div className='flex items-center gap-1 text-slate-400 dark:text-zinc-500'>
              <button
                type='button'
                className='ui-icon-btn'
                aria-label='Đính kèm ảnh'
                disabled={uploading || imageUrls.length >= 8}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className='size-5' />
              </button>
              <EmojiQuickPicker onPick={insertEmoji}>
                <Smile className='size-5' />
              </EmojiQuickPicker>
              {uploading && <span className='text-xs text-slate-500 dark:text-zinc-400'>Đang tải ảnh…</span>}
            </div>
            <button type='submit' disabled={!canSubmit} className='ui-btn-primary'>
              <SendHorizontal className='size-4' aria-hidden />
              {pending ? 'Đang đăng…' : 'Đăng'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
