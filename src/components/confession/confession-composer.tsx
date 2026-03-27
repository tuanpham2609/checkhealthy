/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { ImageIcon, Smile, SendHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/styles'
import { AvatarCircle } from '@/components/confession/avatar-circle'
import { ConfessionImageLightbox } from '@/components/confession/confession-image-lightbox'
import { EmojiQuickPicker } from '@/components/confession/emoji-quick-picker'

interface ConfessionComposerProps {
  onSubmit: (content: string, author: string, imageUrls: string[]) => void | Promise<void>
  className?: string
}

/** Khớp với min-h trên textarea — auto-grow không thấp hơn mức này */
const COMPOSER_TEXTAREA_MIN_HEIGHT_PX = 88

export function ConfessionComposer({ onSubmit, className }: ConfessionComposerProps) {
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /** Auto-grow: reset height rồi theo scrollHeight — ổn định trên Safari iOS khi gõ/xoá dòng */
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return

    const apply = () => {
      el.style.height = '0px'
      el.style.overflow = 'hidden'
      const maxH = Math.min(window.innerHeight * 0.5, 400)
      const sh = el.scrollHeight
      const h = Math.min(Math.max(sh, COMPOSER_TEXTAREA_MIN_HEIGHT_PX), maxH)
      el.style.height = `${h}px`
      el.style.overflowY = sh > maxH ? 'auto' : 'hidden'
    }

    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [content])

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
    setLightboxIndex(null)
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
    <form
      onSubmit={handleSubmit}
      className={cn('ui-surface !overflow-visible', className)}
    >
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
            className='ui-input'
            maxLength={40}
          />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='Chia sẻ cảm xúc, cột mốc điều trị, điều lo lắng hay điều bạn cần được lắng nghe…'
            rows={1}
            maxLength={5000}
            className='ui-input min-h-[88px] max-h-[50vh] resize-none overflow-x-hidden'
          />

          {imageUrls.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {imageUrls.map((url, i) => (
                <div
                  key={url}
                  className='relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-zinc-600 dark:bg-zinc-800'
                >
                  <button
                    type='button'
                    className='absolute inset-0 z-[1] cursor-zoom-in focus-visible:ring-2 focus-visible:ring-[var(--highlight)] focus-visible:ring-offset-2 focus-visible:outline-none'
                    aria-label='Xem ảnh phóng to'
                    onClick={() => setLightboxIndex(i)}
                  />
                  <img
                    src={url}
                    alt=''
                    className='absolute inset-0 h-full w-full object-cover'
                    loading='lazy'
                    decoding='async'
                  />
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(url)
                    }}
                    className='absolute top-1 right-1 z-[2] flex size-7 items-center justify-center rounded-xl border border-white/20 bg-black/55 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/75'
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

      {lightboxIndex !== null && imageUrls.length > 0 ? (
        <ConfessionImageLightbox
          urls={imageUrls}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </form>
  )
}
