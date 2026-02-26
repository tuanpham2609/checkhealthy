/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CrawlResult } from '@/lib/utils/crawl'
import { buildSuggestedCaptions } from '@/lib/utils/crawl'
import { StoryCaptionTool } from '@/components/molecules/story-caption-tool'
import { Link2, Loader2, Copy, Check, Image as ImageIcon, ExternalLink, Download, Languages, X } from 'lucide-react'
import { cn } from '@/lib/styles'

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

const CAPTION_STRIP_COLOR = 'rgb(54, 118, 42)'
const CAPTION_FONT = '600 {size}px system-ui, -apple-system, sans-serif'
const TIKTOK_FRAME_WIDTH = 1080
const TIKTOK_FRAME_HEIGHT = 1920
/** Khoảng trống phía dưới để tránh bị UI TikTok (avatar, nút like/comment, caption) che khi up bài. */
const TIKTOK_SAFE_BOTTOM = 200

type DownloadFormat = 'tiktok' | 'facebook'

function wrapDescriptionForCanvas(text: string, ctx: CanvasRenderingContext2D, maxWidthPx: number): string[] {
  const t = text.trim()
  if (!t) return []
  const words = t.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const trial = line ? `${line} ${w}` : w
    if (ctx.measureText(trial).width <= maxWidthPx) {
      line = trial
    } else {
      if (line) {
        lines.push(line)
        line = ''
      }
      if (ctx.measureText(w).width <= maxWidthPx) {
        line = w
      } else {
        let remaining = w
        while (remaining) {
          let fit = ''
          for (let i = 1; i <= remaining.length; i++) {
            const sub = remaining.slice(0, i)
            if (ctx.measureText(sub).width <= maxWidthPx) fit = sub
            else break
          }
          if (fit) {
            lines.push(fit)
            remaining = remaining.slice(fit.length)
          } else {
            lines.push(remaining.slice(0, 1))
            remaining = remaining.slice(1)
          }
        }
      }
    }
  }
  if (line) lines.push(line)
  return lines
}

/** Khung 1080×1920. sourceIsX: crawl từ X → ảnh full (contain). Còn lại: cover. */
function drawImageWithTitleCanvas(
  imageUrl: string,
  description: string,
  safeBottom: number = TIKTOK_SAFE_BOTTOM,
  format: DownloadFormat = 'tiktok',
  sourceIsX: boolean = false
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const natW = img.naturalWidth
      const natH = img.naturalHeight
      const outW = TIKTOK_FRAME_WIDTH
      const outH = TIKTOK_FRAME_HEIGHT
      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Không tạo được canvas'))
        return
      }
      if (sourceIsX) {
        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(0, 0, outW, outH)
      }
      const scale = sourceIsX
        ? Math.min(outW / natW, outH / natH)
        : Math.max(outW / natW, outH / natH)
      const drawW = natW * scale
      const drawH = natH * scale
      const dx = (outW - drawW) / 2
      const dy = (outH - drawH) / 2
      ctx.drawImage(img, 0, 0, natW, natH, dx, dy, drawW, drawH)
      const desc = (description || '').trim()
      if (desc) {
        const paddingH = format === 'tiktok' ? 25 : 10
        const paddingV = Math.round(outW * 0.03)
        const extraOverlap = Math.round(outW * 0.04)
        const fontSize = Math.min(52, Math.round(outW * 0.048))
        const lineHeight = Math.round(fontSize * 1.35)
        ctx.font = CAPTION_FONT.replace('{size}', String(fontSize))
        const maxLineWidth = outW - 2 * paddingH
        const lines = wrapDescriptionForCanvas(desc, ctx, maxLineWidth)
        const stripHeight = lines.length * lineHeight + paddingV * 2 + extraOverlap
        const stripY = sourceIsX
          ? Math.min(dy + drawH, outH - stripHeight)
          : outH - stripHeight - safeBottom
        ctx.fillStyle = CAPTION_STRIP_COLOR
        ctx.fillRect(0, stripY, outW, outH - stripY)
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        const textX = outW / 2
        lines.forEach((line, i) => {
          const y = stripY + extraOverlap + paddingV + i * lineHeight
          ctx.fillText(line, textX, y)
        })
      }
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Không tạo được blob'))
        },
        'image/png',
        0.92
      )
    }
    img.onerror = () => reject(new Error('Không tải được ảnh từ link (CORS)'))
    img.src = imageUrl
  })
}

/** Proxy ảnh qua API (không CORS) rồi vẽ mô tả client-side — giống tab Story, hoạt động trên Vercel. */
async function fetchImageViaProxy(imageUrl: string): Promise<Blob> {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const res = await fetch(`${origin}/api/image-proxy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = typeof data?.error === 'string' ? data.error : 'Không tải được ảnh từ link.'
    throw new Error(msg)
  }
  return res.blob()
}

export function CrawlTool() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CrawlResult | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [downloadTitleLoading, setDownloadTitleLoading] = useState(false)
  const [downloadTitleError, setDownloadTitleError] = useState<string | null>(null)
  const [translateLoading, setTranslateLoading] = useState(false)
  const [translateError, setTranslateError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    if (!url.trim()) {
      setError('Vui lòng nhập URL')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Crawl thất bại')
        return
      }
      setResult(data)
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleTranslateToVietnamese() {
    if (!result) return
    setTranslateError(null)
    setTranslateLoading(true)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    try {
      const [titleRes, descRes] = await Promise.all([
        fetch(`${origin}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: result.title, sourceLang: 'en' }),
        }),
        fetch(`${origin}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: result.description, sourceLang: 'en' }),
        }),
      ])
      const titleData = await titleRes.json()
      const descData = await descRes.json()
      if (!titleRes.ok || !descRes.ok) {
        setTranslateError(titleData?.error || descData?.error || 'Dịch thất bại')
        return
      }
      const translatedTitle = typeof titleData?.translated === 'string' ? titleData.translated : result.title
      const translatedDesc = typeof descData?.translated === 'string' ? descData.translated : result.description
      const captions = buildSuggestedCaptions(translatedTitle, translatedDesc, result.url)
      setResult({
        ...result,
        title: translatedTitle,
        description: translatedDesc,
        suggestedCaptionFacebook: captions.suggestedCaptionFacebook,
        suggestedCaptionTikTok: captions.suggestedCaptionTikTok,
      })
    } catch {
      setTranslateError('Lỗi kết nối khi dịch')
    } finally {
      setTranslateLoading(false)
    }
  }

  async function handleDownloadWithTitle(format: DownloadFormat) {
    if (!result?.imageUrl) return
    setDownloadTitleError(null)
    setDownloadTitleLoading(true)
    const safeBottom = format === 'tiktok' ? TIKTOK_SAFE_BOTTOM : 0
    const sourceIsX = result.isFromX === true
    try {
      let blob: Blob
      try {
        blob = await drawImageWithTitleCanvas(
          result.imageUrl,
          result.description || '',
          safeBottom,
          format,
          sourceIsX
        )
      } catch {
        const imageBlob = await fetchImageViaProxy(result.imageUrl)
        const objectUrl = URL.createObjectURL(imageBlob)
        try {
          blob = await drawImageWithTitleCanvas(
            objectUrl,
            result.description || '',
            safeBottom,
            format,
            sourceIsX
          )
        } finally {
          URL.revokeObjectURL(objectUrl)
        }
      }
      const filename = format === 'tiktok' ? 'anh-co-mo-ta-tiktok.png' : 'anh-co-mo-ta-fanpage.png'
      downloadBlob(blob, filename)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không tạo được ảnh.'
      setDownloadTitleError(msg)
      setTimeout(() => setDownloadTitleError(null), 6000)
    } finally {
      setDownloadTitleLoading(false)
    }
  }

  return (
    <Tabs defaultValue='crawl' className='w-full'>
      <TabsList className='mb-4 w-full max-w-md sm:mb-6'>
        <TabsTrigger value='crawl' className='flex-1'>
          Crawl
        </TabsTrigger>
        <TabsTrigger value='story' className='flex-1'>
          Story / Caption
        </TabsTrigger>
      </TabsList>
      <TabsContent value='crawl' className='mt-0'>
        <div className='space-y-5 sm:space-y-6 md:space-y-8'>
          {/* Form card - full width, responsive padding */}
          <Card className='overflow-hidden border-emerald-200/70 bg-white/90 shadow-xl shadow-emerald-900/5 backdrop-blur-sm dark:border-emerald-800/50 dark:bg-card/95'>
        <CardContent className='p-4 sm:p-5 md:p-6 lg:p-7'>
          <form
            onSubmit={handleSubmit}
            className='flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4'
          >
            <div className='relative flex-1'>
              <Link2 className='text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2 sm:left-4 sm:size-5' />
              <Input
                type='url'
                placeholder='https://example.com/bai-viet'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className='h-11 w-full pl-10 pr-10 text-base sm:h-12 sm:pl-12 sm:pr-12 md:text-[15px]'
                disabled={loading}
              />
              {url.trim() && (
                <button
                  type='button'
                  onClick={() => setUrl('')}
                  aria-label='Xóa link'
                  className='text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:pointer-events-none sm:right-4'
                  disabled={loading}
                >
                  <X className='size-4 sm:size-5' />
                </button>
              )}
            </div>
            <Button
              type='submit'
              disabled={loading}
              className='h-11 shrink-0 gap-2 bg-emerald-600 px-5 font-medium hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 sm:h-12 sm:px-6 md:px-8'
            >
              {loading ? (
                <>
                  <Loader2 className='size-5 shrink-0 animate-spin' />
                  <span className='hidden sm:inline'>Đang crawl...</span>
                </>
              ) : (
                'Crawl'
              )}
            </Button>
          </form>
          {error && (
            <p className='text-destructive mt-3 text-sm' role='alert'>
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results - grid on large screens */}
      {result && (
        <div className='grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6'>
          {/* Left column: Image + Meta */}
          <div className='flex flex-col gap-4 sm:gap-5'>
            {result.imageUrl && (
              <Card className='overflow-hidden border-emerald-200/60 shadow-lg dark:border-emerald-800/40'>
                <CardHeader className='flex flex-row items-center gap-2 border-b bg-muted/40 px-4 py-3 sm:px-5 sm:py-4'>
                  <ImageIcon className='size-5 shrink-0 text-emerald-600 dark:text-emerald-400' />
                  <CardTitle className='text-base font-semibold sm:text-lg'>Ảnh (OG Image)</CardTitle>
                </CardHeader>
                <CardContent className='p-4 sm:p-5'>
                  <img
                    src={result.imageUrl}
                    alt={result.title}
                    className='max-h-64 w-full rounded-xl border bg-muted/30 object-contain sm:max-h-80 md:max-h-96'
                  />
                  <div className='mt-3 space-y-3'>
                    <a
                      href={result.imageUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-2 transition-colors'
                    >
                      <ExternalLink className='size-4 shrink-0' />
                      Mở ảnh / Tải gốc
                    </a>
                    <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        className='gap-1.5'
                        disabled={downloadTitleLoading}
                        onClick={() => handleDownloadWithTitle('tiktok')}
                      >
                        {downloadTitleLoading ? (
                          <Loader2 className='size-4 shrink-0 animate-spin' />
                        ) : (
                          <Download className='size-4 shrink-0' />
                        )}
                        Tải cho TikTok
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        className='gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                        disabled={downloadTitleLoading}
                        onClick={() => handleDownloadWithTitle('facebook')}
                      >
                        {downloadTitleLoading ? (
                          <Loader2 className='size-4 shrink-0 animate-spin' />
                        ) : (
                          <Download className='size-4 shrink-0' />
                        )}
                        Tải cho Fanpage FB
                      </Button>
                    </div>
                  </div>
                  {downloadTitleError && (
                    <p className='text-destructive mt-2 text-sm' role='alert'>
                      {downloadTitleError}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className='flex-1 overflow-hidden border-emerald-200/60 shadow-lg dark:border-emerald-800/40'>
              <CardHeader className='flex flex-col gap-2 border-b bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4'>
                <CardTitle className='text-base font-semibold sm:text-lg'>Thông tin trang</CardTitle>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='w-full gap-1.5 sm:w-auto'
                  disabled={translateLoading}
                  onClick={handleTranslateToVietnamese}
                >
                  {translateLoading ? (
                    <Loader2 className='size-4 shrink-0 animate-spin' />
                  ) : (
                    <Languages className='size-4 shrink-0' />
                  )}
                  Dịch sang tiếng Việt
                </Button>
              </CardHeader>
              <CardContent className='space-y-3 p-4 text-sm sm:space-y-4 sm:p-5 sm:text-[15px]'>
                {translateError && (
                  <p className='text-destructive text-sm' role='alert'>
                    {translateError}
                  </p>
                )}
                <div>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <span className='text-muted-foreground font-medium'>Tiêu đề:</span>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 shrink-0'
                      onClick={() => copyToClipboard(result.title, 'title')}
                    >
                      {copiedId === 'title' ? (
                        <Check className='size-4 text-emerald-600' />
                      ) : (
                        <Copy className='size-4' />
                      )}
                      {copiedId === 'title' ? 'Đã copy' : 'Copy'}
                    </Button>
                  </div>
                  <p className='mt-0.5 font-medium'>{result.title}</p>
                </div>
                <div>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <span className='text-muted-foreground font-medium'>Mô tả:</span>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='h-8 gap-1.5 shrink-0'
                      onClick={() => copyToClipboard(result.description, 'desc')}
                    >
                      {copiedId === 'desc' ? (
                        <Check className='size-4 text-emerald-600' />
                      ) : (
                        <Copy className='size-4' />
                      )}
                      {copiedId === 'desc' ? 'Đã copy' : 'Copy'}
                    </Button>
                  </div>
                  <p className='mt-0.5'>{result.description}</p>
                </div>
                <div>
                  <span className='text-muted-foreground font-medium'>URL:</span>
                  <a
                    href={result.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={cn(
                      'mt-0.5 block break-all font-medium text-emerald-600 underline underline-offset-2',
                      'hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300'
                    )}
                  >
                    {result.url}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Captions */}
          <div className='flex flex-col gap-4 sm:gap-5'>
            <Card className='overflow-hidden border-emerald-200/60 shadow-lg dark:border-emerald-800/40'>
              <CardHeader className='flex flex-col gap-2 border-b bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4'>
                <CardTitle className='text-base font-semibold sm:text-lg'>Caption Facebook</CardTitle>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='w-full gap-1.5 sm:w-auto'
                  onClick={() => copyToClipboard(result.suggestedCaptionFacebook, 'fb')}
                >
                  {copiedId === 'fb' ? (
                    <Check className='size-4 text-emerald-600' />
                  ) : (
                    <Copy className='size-4' />
                  )}
                  {copiedId === 'fb' ? 'Đã copy' : 'Copy'}
                </Button>
              </CardHeader>
              <CardContent className='p-4 sm:p-5'>
                <pre className='max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/50 p-4 text-sm sm:max-h-56 sm:text-[15px]'>
                  {result.suggestedCaptionFacebook}
                </pre>
              </CardContent>
            </Card>

            <Card className='overflow-hidden border-emerald-200/60 shadow-lg dark:border-emerald-800/40'>
              <CardHeader className='flex flex-col gap-2 border-b bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4'>
                <CardTitle className='text-base font-semibold sm:text-lg'>Caption TikTok</CardTitle>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='w-full gap-1.5 sm:w-auto'
                  onClick={() => copyToClipboard(result.suggestedCaptionTikTok, 'tt')}
                >
                  {copiedId === 'tt' ? (
                    <Check className='size-4 text-emerald-600' />
                  ) : (
                    <Copy className='size-4' />
                  )}
                  {copiedId === 'tt' ? 'Đã copy' : 'Copy'}
                </Button>
              </CardHeader>
              <CardContent className='p-4 sm:p-5'>
                <pre className='max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/50 p-4 text-sm sm:max-h-56 sm:text-[15px]'>
                  {result.suggestedCaptionTikTok}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
        </div>
      </TabsContent>
      <TabsContent value='story' className='mt-0'>
        <StoryCaptionTool />
      </TabsContent>
    </Tabs>
  )
}
