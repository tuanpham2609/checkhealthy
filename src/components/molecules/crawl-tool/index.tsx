/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CrawlResult } from '@/lib/utils/crawl'
import { buildSuggestedCaptions, extractTweetId, fetchXTweetImageUrl } from '@/lib/utils/crawl'
import { StoryCaptionTool } from '@/components/molecules/story-caption-tool'
import { Link2, Loader2, Copy, Check, Image as ImageIcon, ExternalLink, Download, Languages, X, Upload, RotateCcw, Plus, Volume2, Video } from 'lucide-react'
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
/** Khoảng trống phía dưới để tránh bị UI TikTok che khi up bài. */
const TIKTOK_SAFE_BOTTOM = 200
/** Dải xanh đè lên ảnh (px) để che vùng hồng/tím (logo) ở mép dưới ảnh. */
const STRIP_OVERLAP_IMAGE = 85

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

/** Đường dẫn ảnh nền (sân cỏ) — đặt file tại public/assets/background/field-bg.png */
const BACKGROUND_IMAGE_PATH = '/assets/background/field-bg.png'

/** Padding quanh chữ trong dải xanh (trên/dưới) */
const STRIP_PADDING = 40
/** Padding trái phải cho title và mô tả trong dải xanh */
const STRIP_PADDING_H = 45

/** Khung 1080×1920. Nền phủ canvas; khối (ảnh + dải xanh) căn giữa; dải xanh overlap lên ảnh. backgroundImageUrl: tùy chọn, mặc định field-bg.png */
function drawImageWithTitleCanvas(
  imageUrl: string,
  title: string,
  description: string,
  safeBottom: number = TIKTOK_SAFE_BOTTOM,
  format: DownloadFormat = 'tiktok',
  backgroundImageUrl?: string | null
): Promise<Blob> {
  const bgUrl = backgroundImageUrl && backgroundImageUrl.trim() ? backgroundImageUrl.trim() : BACKGROUND_IMAGE_PATH
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const bgImg = new Image()
    bgImg.crossOrigin = 'anonymous'

    function doDraw() {
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
      // 1) Vẽ nền sân cỏ phủ toàn bộ canvas (cover) — phần không bị ảnh/dải che sẽ lộ nền
      if (bgImg.complete && bgImg.naturalWidth > 0) {
        const bw = bgImg.naturalWidth
        const bh = bgImg.naturalHeight
        const scale = Math.max(outW / bw, outH / bh)
        const sx = (bw - outW / scale) / 2
        const sy = (bh - outH / scale) / 2
        ctx.drawImage(bgImg, sx, sy, outW / scale, outH / scale, 0, 0, outW, outH)
      }
      const titleStr = (title || '').trim()
      const descStr = (description || '').trim()
      const maxLineWidth = outW - 2 * STRIP_PADDING_H
      const fontSizeTitle = Math.min(52, Math.round(outW * 0.048))
      const fontSizeDesc = Math.min(35, Math.round(outW * 0.032))
      const lineHeightTitle = Math.round(fontSizeTitle * 1.3)
      const lineHeightDesc = Math.round(fontSizeDesc * 1.35)
      ctx.font = CAPTION_FONT.replace('{size}', String(fontSizeTitle))
      const titleLines = titleStr ? wrapDescriptionForCanvas(titleStr, ctx, maxLineWidth) : []
      ctx.font = CAPTION_FONT.replace('{size}', String(fontSizeDesc))
      const descLines = descStr ? wrapDescriptionForCanvas(descStr, ctx, maxLineWidth) : []
      const titleBlockH = titleLines.length * lineHeightTitle
      const descBlockH = descLines.length * lineHeightDesc
      const gap = titleLines.length && descLines.length ? Math.round(outW * 0.02) : 0
      const stripHeight =
        titleStr || descStr
          ? STRIP_PADDING * 2 + titleBlockH + gap + descBlockH
          : 0
      // Khối (ảnh + dải xanh) căn giữa canvas; dải xanh overlap lên ảnh 1 chút để che vùng hồng
      const contentH = outH - stripHeight
      const scale = Math.min(outW / natW, contentH / natH)
      const drawW = natW * scale
      const drawH = natH * scale
      const totalBlockH = drawH + stripHeight
      const startY = Math.max(0, (outH - totalBlockH) / 2)
      const stripY = startY + drawH - STRIP_OVERLAP_IMAGE
      const dx = (outW - drawW) / 2
      const dy = startY
      ctx.drawImage(img, 0, 0, natW, natH, dx, dy, drawW, drawH)
      if (stripHeight > 0) {
        ctx.fillStyle = CAPTION_STRIP_COLOR
        ctx.fillRect(0, stripY, outW, stripHeight)
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        const textX = outW / 2
        let y = stripY + STRIP_PADDING
        ctx.font = CAPTION_FONT.replace('{size}', String(fontSizeTitle))
        titleLines.forEach((line) => {
          ctx.fillText(line, textX, y)
          y += lineHeightTitle
        })
        if (gap) y += gap
        ctx.font = CAPTION_FONT.replace('{size}', String(fontSizeDesc))
        descLines.forEach((line) => {
          ctx.fillText(line, textX, y)
          y += lineHeightDesc
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

    img.onload = () => {
      // Đợi ảnh nền load xong (hoặc lỗi) rồi mới vẽ
      if (bgImg.complete) {
        doDraw()
        return
      }
      bgImg.onload = () => doDraw()
      bgImg.onerror = () => doDraw()
    }
    img.onerror = () => reject(new Error('Không tải được ảnh từ link (CORS)'))
    img.src = imageUrl
    bgImg.src = bgUrl
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

/** Số link tối đa khi crawl một lần */
const MAX_CRAWL_URLS = 20

export function CrawlTool() {
  const [urls, setUrls] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [crawlProgress, setCrawlProgress] = useState<{ current: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<CrawlResult[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [downloadTitleLoading, setDownloadTitleLoading] = useState(false)
  const [downloadTitleError, setDownloadTitleError] = useState<string | null>(null)
  const [translateLoading, setTranslateLoading] = useState(false)
  const [translateError, setTranslateError] = useState<string | null>(null)
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const [xImageLoading, setXImageLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const speechCancelRef = useRef(false)

  // Khi crawl X trên Vercel không có ảnh: thử lấy ảnh từ Syndication API ngay trên trình duyệt cho từng result
  const xImageFetchKey = results.map((r) => `${r.url}-${r.isFromX}-${r.imageUrl || ''}`).join('|')
  useEffect(() => {
    const indices = results
      .map((r, i) => (r.isFromX && !r.imageUrl && extractTweetId(r.url) ? i : -1))
      .filter((i) => i >= 0)
    if (indices.length === 0) return
    let cancelled = false
    setXImageLoading(true)
    Promise.all(
      indices.map((i) => {
        const tweetId = extractTweetId(results[i]!.url)
        return tweetId ? fetchXTweetImageUrl(tweetId).then((imageUrl) => ({ i, imageUrl })) : Promise.resolve({ i, imageUrl: null })
      })
    )
      .then((pairs) => {
        if (cancelled) return
        setResults((prev) => {
          const next = [...prev]
          for (const { i, imageUrl } of pairs) {
            if (imageUrl && next[i]) next[i] = { ...next[i]!, imageUrl }
          }
          return next
        })
      })
      .finally(() => {
        if (!cancelled) setXImageLoading(false)
      })
    return () => {
      cancelled = true
    }
    // xImageFetchKey encodes which results need X image fetch; re-run when results or their imageUrl change
  }, [xImageFetchKey, results])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResults([])
    setCrawlProgress(null)
    const list = urls
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, MAX_CRAWL_URLS)
    if (list.length === 0) {
      setError('Vui lòng nhập ít nhất một URL')
      return
    }
    setLoading(true)
    setCrawlProgress({ current: 0, total: list.length })
    const accumulated: CrawlResult[] = []
    try {
      for (let i = 0; i < list.length; i++) {
        setCrawlProgress({ current: i + 1, total: list.length })
        const res = await fetch('/api/crawl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: list[i] }),
        })
        const data = await res.json()
        if (res.ok) {
          accumulated.push(data)
        }
      }
      setResults(accumulated)
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setLoading(false)
      setCrawlProgress(null)
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleTranslateToVietnamese(index: number) {
    const result = results[index]
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
      setResults((prev) =>
        prev.map((r, i) =>
          i === index
            ? {
                ...r,
                title: translatedTitle,
                description: translatedDesc,
                suggestedCaptionFacebook: captions.suggestedCaptionFacebook,
                suggestedCaptionTikTok: captions.suggestedCaptionTikTok,
              }
            : r
        )
      )
    } catch {
      setTranslateError('Lỗi kết nối khi dịch')
    } finally {
      setTranslateLoading(false)
    }
  }

  async function handleDownloadWithTitle(format: DownloadFormat, index: number) {
    const result = results[index]
    if (!result?.imageUrl) return
    setDownloadTitleError(null)
    setDownloadTitleLoading(true)
    const safeBottom = format === 'tiktok' ? TIKTOK_SAFE_BOTTOM : 0
    const filename =
      format === 'tiktok' ? `anh-${index + 1}-tiktok.png` : `anh-${index + 1}-fanpage.png`
    try {
      let blob: Blob
      try {
        blob = await drawImageWithTitleCanvas(
          result.imageUrl,
          result.title || '',
          result.description || '',
          safeBottom,
          format,
          customBackgroundUrl
        )
      } catch {
        const imageBlob = await fetchImageViaProxy(result.imageUrl)
        const objectUrl = URL.createObjectURL(imageBlob)
        try {
          blob = await drawImageWithTitleCanvas(
            objectUrl,
            result.title || '',
            result.description || '',
            safeBottom,
            format,
            customBackgroundUrl
          )
        } finally {
          URL.revokeObjectURL(objectUrl)
        }
      }
      downloadBlob(blob, filename)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không tạo được ảnh.'
      setDownloadTitleError(msg)
      setTimeout(() => setDownloadTitleError(null), 6000)
    } finally {
      setDownloadTitleLoading(false)
    }
  }

  function stopSpeaking() {
    speechCancelRef.current = true
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  function speakAll() {
    if (results.length === 0) return
    speechCancelRef.current = false
    setIsSpeaking(true)
    const texts: string[] = []
    results.forEach((r, i) => {
      const t = [r.title, r.description].filter(Boolean).join('. ')
      if (t.trim()) texts.push(`Bài ${i + 1}. ${t.trim()}`)
    })
    if (texts.length === 0) {
      setIsSpeaking(false)
      return
    }
    const voices = window.speechSynthesis.getVoices()
    const viVoice = voices.find((v) => v.lang.startsWith('vi')) ?? voices[0] ?? null
    let idx = 0
    function speakNext() {
      if (speechCancelRef.current || idx >= texts.length) {
        setIsSpeaking(false)
        return
      }
      const u = new SpeechSynthesisUtterance(texts[idx]!)
      u.rate = 0.95
      u.lang = 'vi-VN'
      if (viVoice) u.voice = viVoice
      u.onend = () => {
        idx += 1
        speakNext()
      }
      u.onerror = () => {
        idx += 1
        speakNext()
      }
      window.speechSynthesis.speak(u)
    }
    if (voices.length > 0) {
      speakNext()
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        speakNext()
      }
    }
  }

  async function generateVideoWithVoice() {
    if (results.length === 0) return
    setVideoError(null)
    setIsGeneratingVideo(true)
    speechCancelRef.current = false
    const VIDEO_SLIDE_DURATION_MS = 6000
    const outW = TIKTOK_FRAME_WIDTH
    const outH = TIKTOK_FRAME_HEIGHT
    const bgUrl = customBackgroundUrl?.trim() || BACKGROUND_IMAGE_PATH
    try {
      speakAll()
      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Không tạo được canvas')
      const bgImg = new Image()
      bgImg.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        bgImg.onload = () => resolve()
        bgImg.onerror = () => reject(new Error('Không tải ảnh nền'))
        bgImg.src = bgUrl
      })
      const contentImages: (HTMLImageElement | null)[] = []
      for (const r of results) {
        if (!r.imageUrl) {
          contentImages.push(null)
          continue
        }
        const img = new Image()
        img.crossOrigin = 'anonymous'
        try {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = () => reject(new Error(''))
            img.src = r.imageUrl!
          })
          contentImages.push(img)
        } catch {
          try {
            const blob = await fetchImageViaProxy(r.imageUrl!)
            const url = URL.createObjectURL(blob)
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve()
              img.onerror = () => reject(new Error(''))
              img.src = url
            })
            contentImages.push(img)
          } catch {
            contentImages.push(null)
          }
        }
      }
      const stream = canvas.captureStream(15)
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
      const mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1500000 })
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data)
      mediaRecorder.start(500)
      let slideIndex = 0
      function drawSlide(i: number) {
        if (!ctx) return
        const r = results[i]
        const contentImg = contentImages[i]
        if (!r) return
        if (bgImg.complete && bgImg.naturalWidth > 0) {
          const bw = bgImg.naturalWidth
          const bh = bgImg.naturalHeight
          const scale = Math.max(outW / bw, outH / bh)
          ctx.drawImage(bgImg, (bw - outW / scale) / 2, (bh - outH / scale) / 2, outW / scale, outH / scale, 0, 0, outW, outH)
        }
        const titleStr = (r.title || '').trim()
        const descStr = (r.description || '').trim()
        const maxLineWidth = outW - 2 * STRIP_PADDING_H
        const fontSizeTitle = Math.min(52, Math.round(outW * 0.048))
        const fontSizeDesc = Math.min(35, Math.round(outW * 0.032))
        const lineHeightTitle = Math.round(fontSizeTitle * 1.3)
        const lineHeightDesc = Math.round(fontSizeDesc * 1.35)
        ctx.font = CAPTION_FONT.replace('{size}', String(fontSizeTitle))
        const titleLines = titleStr ? wrapDescriptionForCanvas(titleStr, ctx, maxLineWidth) : []
        ctx.font = CAPTION_FONT.replace('{size}', String(fontSizeDesc))
        const descLines = descStr ? wrapDescriptionForCanvas(descStr, ctx, maxLineWidth) : []
        const titleBlockH = titleLines.length * lineHeightTitle
        const descBlockH = descLines.length * lineHeightDesc
        const gap = titleLines.length && descLines.length ? Math.round(outW * 0.02) : 0
        const stripHeight =
          titleStr || descStr ? STRIP_PADDING * 2 + titleBlockH + gap + descBlockH : 0
        const contentH = outH - stripHeight
        let drawW = outW
        let drawH = contentH
        let dx = 0
        let dy = 0
        if (contentImg && contentImg.naturalWidth > 0) {
          const natW = contentImg.naturalWidth
          const natH = contentImg.naturalHeight
          const scale = Math.min(outW / natW, contentH / natH)
          drawW = natW * scale
          drawH = natH * scale
          const totalBlockH = drawH + stripHeight
          const startY = Math.max(0, (outH - totalBlockH) / 2)
          dy = startY
          dx = (outW - drawW) / 2
          ctx.drawImage(contentImg, 0, 0, natW, natH, dx, dy, drawW, drawH)
        }
        const stripY = dy + drawH - STRIP_OVERLAP_IMAGE
        if (stripHeight > 0) {
          ctx.fillStyle = CAPTION_STRIP_COLOR
          ctx.fillRect(0, stripY, outW, stripHeight)
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          const textX = outW / 2
          let y = stripY + STRIP_PADDING
          ctx.font = CAPTION_FONT.replace('{size}', String(fontSizeTitle))
          titleLines.forEach((line) => {
            ctx.fillText(line, textX, y)
            y += lineHeightTitle
          })
          if (gap) y += gap
          ctx.font = CAPTION_FONT.replace('{size}', String(fontSizeDesc))
          descLines.forEach((line) => {
            ctx.fillText(line, textX, y)
            y += lineHeightDesc
          })
        }
      }
      drawSlide(0)
      const intervalId = setInterval(() => {
        slideIndex += 1
        if (slideIndex >= results.length) {
          clearInterval(intervalId)
          mediaRecorder.stop()
          stopSpeaking()
          return
        }
        drawSlide(slideIndex)
      }, VIDEO_SLIDE_DURATION_MS)
      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => resolve()
      })
      const blob = new Blob(chunks, { type: 'video/webm' })
      downloadBlob(blob, 'crawl-video.webm')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không tạo được video.'
      setVideoError(msg)
      stopSpeaking()
    } finally {
      setIsGeneratingVideo(false)
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
            className='flex flex-col gap-3'
          >
            <div className='flex flex-col gap-2'>
              {urls.map((url, index) => (
                <div key={index} className='relative flex flex-1 flex-col gap-1 sm:flex-row sm:items-stretch sm:gap-2'>
                  <div className='relative flex-1'>
                    <Link2 className='text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2 sm:left-4 sm:size-5' />
                    <Input
                      type='url'
                      placeholder='https://example.com/bai-viet'
                      value={url}
                      onChange={(e) => {
                        setUrls((prev) => {
                          const next = [...prev]
                          next[index] = e.target.value
                          return next
                        })
                      }}
                      className='h-11 w-full pl-10 pr-10 text-[16px] sm:h-12 sm:pl-12 sm:pr-12 min-[768px]:text-[15px]'
                      disabled={loading}
                    />
                    {urls.length > 1 && (
                      <button
                        type='button'
                        onClick={() => setUrls((prev) => prev.filter((_, i) => i !== index))}
                        aria-label='Xóa link'
                        className='text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:pointer-events-none sm:right-4'
                        disabled={loading}
                      >
                        <X className='size-4 sm:size-5' />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-1.5'
                disabled={loading || urls.length >= MAX_CRAWL_URLS}
                onClick={() => setUrls((prev) => [...prev, ''])}
              >
                <Plus className='size-4 shrink-0' />
                Thêm link
              </Button>
              <Button
                type='submit'
                disabled={loading}
                className='gap-2 bg-emerald-600 px-5 font-medium hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 sm:px-6 md:px-8'
              >
                {loading ? (
                  <>
                    <Loader2 className='size-5 shrink-0 animate-spin' />
                    <span className='hidden sm:inline'>
                      {crawlProgress ? `Đang crawl ${crawlProgress.current}/${crawlProgress.total}...` : 'Đang crawl...'}
                    </span>
                  </>
                ) : (
                  'Crawl'
                )}
              </Button>
            </div>
          </form>
          {error && (
            <p className='text-destructive mt-3 text-sm' role='alert'>
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className='flex flex-col gap-6'>
          {/* Ảnh nền chung */}
          <Card className='overflow-hidden border-emerald-200/60 shadow-lg dark:border-emerald-800/40'>
            <CardHeader className='border-b bg-muted/40 px-4 py-3 sm:px-5 sm:py-4'>
              <CardTitle className='text-base font-semibold sm:text-lg'>Tải ảnh hàng loạt</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-wrap items-center gap-3 p-4 sm:p-5'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-muted-foreground text-sm'>Ảnh nền (dùng chung):</span>
                <input
                  ref={backgroundInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = () => {
                        const dataUrl = reader.result
                        if (typeof dataUrl === 'string') setCustomBackgroundUrl(dataUrl)
                      }
                      reader.readAsDataURL(file)
                    }
                    e.target.value = ''
                  }}
                />
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  className='h-8 gap-1.5'
                  onClick={() => backgroundInputRef.current?.click()}
                >
                  <Upload className='size-4 shrink-0' />
                  Chọn ảnh nền
                </Button>
                {customBackgroundUrl ? (
                  <Button
                    type='button'
                    size='sm'
                    variant='ghost'
                    className='h-8 gap-1.5 text-muted-foreground'
                    onClick={() => setCustomBackgroundUrl(null)}
                  >
                    <RotateCcw className='size-4 shrink-0' />
                    Dùng ảnh mặc định
                  </Button>
                ) : (
                  <span className='text-muted-foreground text-xs'>Mặc định: news</span>
                )}
              </div>
            </CardContent>
          </Card>
          {downloadTitleError && (
            <p className='text-destructive text-sm' role='alert'>
              {downloadTitleError}
            </p>
          )}

          {/* Video có giọng đọc */}
          <Card className='overflow-hidden border-emerald-200/60 shadow-lg dark:border-emerald-800/40'>
            <CardHeader className='border-b bg-muted/40 px-4 py-3 sm:px-5 sm:py-4'>
              <CardTitle className='text-base font-semibold sm:text-lg'>Video có giọng đọc</CardTitle>
              <p className='text-muted-foreground mt-1 text-sm'>
                Phát đọc nội dung tất cả bài viết bằng giọng Việt, hoặc tạo một video (hình + chữ) và phát giọng đọc khi tạo.
              </p>
            </CardHeader>
            <CardContent className='flex flex-wrap items-center gap-3 p-4 sm:p-5'>
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='gap-1.5'
                disabled={isGeneratingVideo || results.length === 0}
                onClick={isSpeaking ? stopSpeaking : speakAll}
              >
                {isSpeaking ? (
                  <>
                    <Loader2 className='size-4 shrink-0 animate-spin' />
                    Dừng đọc
                  </>
                ) : (
                  <>
                    <Volume2 className='size-4 shrink-0' />
                    Phát đọc tất cả
                  </>
                )}
              </Button>
              <Button
                type='button'
                size='sm'
                className='gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                disabled={isSpeaking || isGeneratingVideo || results.length === 0}
                onClick={generateVideoWithVoice}
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className='size-4 shrink-0 animate-spin' />
                    Đang tạo video...
                  </>
                ) : (
                  <>
                    <Video className='size-4 shrink-0' />
                    Tạo video có giọng đọc
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          {videoError && (
            <p className='text-destructive text-sm' role='alert'>
              {videoError}
            </p>
          )}

          {/* Danh sách từng kết quả */}
          {results.map((result, index) => (
            <div key={index} className='grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6'>
              <div className='flex flex-col gap-4 sm:gap-5'>
                {(result.imageUrl || result.isFromX) && (
                  <Card className='overflow-hidden border-emerald-200/60 shadow-lg dark:border-emerald-800/40'>
                    <CardHeader className='flex flex-row items-center gap-2 border-b bg-muted/40 px-4 py-3 sm:px-5 sm:py-4'>
                      <ImageIcon className='size-5 shrink-0 text-emerald-600 dark:text-emerald-400' />
                      <CardTitle className='text-base font-semibold sm:text-lg'>
                        #{index + 1} — {result.isFromX ? 'Ảnh (X / Twitter)' : 'Ảnh (OG Image)'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='p-4 sm:p-5'>
                      {result.imageUrl ? (
                        <>
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
                                onClick={() => handleDownloadWithTitle('tiktok', index)}
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
                                onClick={() => handleDownloadWithTitle('facebook', index)}
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
                        </>
                      ) : (
                        <div className='flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 p-6 text-center'>
                          {xImageLoading ? (
                            <>
                              <Loader2 className='size-6 animate-spin text-emerald-600' />
                              <p className='text-muted-foreground text-sm'>Đang tải ảnh từ X...</p>
                            </>
                          ) : (
                            <p className='text-muted-foreground text-sm'>Không lấy được ảnh từ link X.</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className='flex-1 overflow-hidden border-emerald-200/60 shadow-lg dark:border-emerald-800/40'>
                  <CardHeader className='flex flex-col gap-2 border-b bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4'>
                    <CardTitle className='text-base font-semibold sm:text-lg'>Thông tin trang #{index + 1}</CardTitle>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='w-full gap-1.5 sm:w-auto'
                      disabled={translateLoading}
                      onClick={() => handleTranslateToVietnamese(index)}
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
                          onClick={() => copyToClipboard(result.title, `title-${index}`)}
                        >
                          {copiedId === `title-${index}` ? (
                            <Check className='size-4 text-emerald-600' />
                          ) : (
                            <Copy className='size-4' />
                          )}
                          {copiedId === `title-${index}` ? 'Đã copy' : 'Copy'}
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
                          onClick={() => copyToClipboard(result.description, `desc-${index}`)}
                        >
                          {copiedId === `desc-${index}` ? (
                            <Check className='size-4 text-emerald-600' />
                          ) : (
                            <Copy className='size-4' />
                          )}
                          {copiedId === `desc-${index}` ? 'Đã copy' : 'Copy'}
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

              <div className='flex flex-col gap-4 sm:gap-5'>
                <Card className='overflow-hidden border-emerald-200/60 shadow-lg dark:border-emerald-800/40'>
                  <CardHeader className='flex flex-col gap-2 border-b bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4'>
                    <CardTitle className='text-base font-semibold sm:text-lg'>Caption Facebook #{index + 1}</CardTitle>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='w-full gap-1.5 sm:w-auto'
                      onClick={() => copyToClipboard(result.suggestedCaptionFacebook, `fb-${index}`)}
                    >
                      {copiedId === `fb-${index}` ? (
                        <Check className='size-4 text-emerald-600' />
                      ) : (
                        <Copy className='size-4' />
                      )}
                      {copiedId === `fb-${index}` ? 'Đã copy' : 'Copy'}
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
                    <CardTitle className='text-base font-semibold sm:text-lg'>Caption TikTok #{index + 1}</CardTitle>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='w-full gap-1.5 sm:w-auto'
                      onClick={() => copyToClipboard(result.suggestedCaptionTikTok, `tt-${index}`)}
                    >
                      {copiedId === `tt-${index}` ? (
                        <Check className='size-4 text-emerald-600' />
                      ) : (
                        <Copy className='size-4' />
                      )}
                      {copiedId === `tt-${index}` ? 'Đã copy' : 'Copy'}
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
          ))}
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
