/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

'use client'

import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Image as ImageIcon, Palette } from 'lucide-react'

const W = 1080
const H = 1920
const MARGIN_H = 15
const PADDING_H = 0
const CAPTION_RADIUS = 12
const FONT_SIZE_PRESETS = [20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 112] as const
const FONT_SIZE_MIN = 16
const FONT_SIZE_MAX = 120

const FONT_STRING = '600 {size}px system-ui, -apple-system, sans-serif'

/**
 * Wrap caption by measured pixel width so line breaks match the chosen font size.
 * Uses an offscreen canvas measureText for accurate responsive wrapping.
 */
function wrapCaptionByMeasure(text: string, fontSize: number, maxWidthPx: number): string[] {
  const t = text.trim()
  if (!t) return []
  if (typeof document === 'undefined') return [t]
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return [t]
  ctx.font = FONT_STRING.replace('{size}', String(fontSize))
  const words = t.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const trial = line ? `${line} ${w}` : w
    const width = ctx.measureText(trial).width
    if (width <= maxWidthPx) {
      line = trial
    } else {
      if (line) {
        lines.push(line)
        line = ''
      }
      const wordWidth = ctx.measureText(w).width
      if (wordWidth <= maxWidthPx) {
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

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export function StoryCaptionTool() {
  const [backgroundType, setBackgroundType] = useState<'image' | 'color'>('color')
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [colorHex, setColorHex] = useState('#36762a')
  const [caption, setCaption] = useState('')
  const [fontSize, setFontSize] = useState(36)
  const [captionBgColor, setCaptionBgColor] = useState('#36762a')
  const [exporting, setExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stripWidth = W - 2 * MARGIN_H
  const wrapWidth = stripWidth - 2 * PADDING_H

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImagePreviewUrl(URL.createObjectURL(file))
    e.target.value = ''
  }, [imagePreviewUrl])

  const drawCaptionStrip = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const lines = wrapCaptionByMeasure(caption, fontSize, wrapWidth)
      if (lines.length === 0) return
      const paddingV = Math.round(fontSize * 0.5)
      const lineHeight = Math.round(fontSize * 1.35)
      const stripHeight = lines.length * lineHeight + paddingV * 2
      const stripX = (W - stripWidth) / 2
      const stripY = (H - stripHeight) / 2

      ctx.fillStyle = captionBgColor
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath()
        ctx.roundRect(stripX, stripY, stripWidth, stripHeight, CAPTION_RADIUS)
        ctx.fill()
      } else {
        drawRoundRect(ctx, stripX, stripY, stripWidth, stripHeight, CAPTION_RADIUS)
        ctx.fill()
      }

      ctx.fillStyle = '#ffffff'
      ctx.font = FONT_STRING.replace('{size}', String(fontSize))
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const textX = stripX + stripWidth / 2
      lines.forEach((line, i) => {
        const y = stripY + paddingV + i * lineHeight
        ctx.fillText(line, textX, y)
      })
    },
    [caption, captionBgColor, fontSize, stripWidth, wrapWidth]
  )

  const exportToPng = useCallback(async () => {
    setExporting(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return
      }
      if (backgroundType === 'color') {
        ctx.fillStyle = colorHex
        ctx.fillRect(0, 0, W, H)
      } else if (imagePreviewUrl) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = reject
          img.src = imagePreviewUrl
        })
        const scale = Math.max(W / img.width, H / img.height)
        const sw = W / scale
        const sh = H / scale
        const sx = (img.width - sw) / 2
        const sy = (img.height - sh) / 2
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)
      } else {
        ctx.fillStyle = colorHex
        ctx.fillRect(0, 0, W, H)
      }
      drawCaptionStrip(ctx)
      canvas.toBlob(
        (blob) => {
          if (blob) downloadBlob(blob, 'story-1080x1920.png')
        },
        'image/png',
        0.92
      )
    } finally {
      setExporting(false)
    }
  }, [backgroundType, colorHex, imagePreviewUrl, drawCaptionStrip])

  const lines = wrapCaptionByMeasure(caption, fontSize, wrapWidth)
  const paddingV = Math.round(fontSize * 0.5)
  const lineHeight = Math.round(fontSize * 1.35)
  const stripHeight = lines.length * lineHeight + paddingV * 2
  const hasBackground = backgroundType === 'color' || imagePreviewUrl
  const previewScale = 280 / W

  return (
    <div className='space-y-5 sm:space-y-6'>
      <Card className='overflow-hidden border-teal-200/70 bg-white/90 shadow-xl shadow-teal-900/5 dark:border-teal-800/50 dark:bg-card/95'>
        <CardHeader className='border-b bg-muted/40 px-4 py-3 sm:px-5 sm:py-4'>
          <CardTitle className='text-base font-semibold sm:text-lg'>
            Khung Story / TikTok (1080×1920)
          </CardTitle>
          <p className='text-muted-foreground mt-1 text-sm'>
            Chọn nền ảnh hoặc màu, nhập caption hiển thị trên hình, tải về PNG.
          </p>
        </CardHeader>
        <CardContent className='space-y-4 p-4 sm:p-5 md:p-6'>
          <div className='flex flex-wrap items-center gap-3'>
            <span className='text-muted-foreground text-sm font-medium'>Nền:</span>
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                variant={backgroundType === 'image' ? 'default' : 'outline'}
                size='sm'
                className='gap-1.5'
                onClick={() => setBackgroundType('image')}
              >
                <ImageIcon className='size-4' />
                Nền ảnh
              </Button>
              <Button
                type='button'
                variant={backgroundType === 'color' ? 'default' : 'outline'}
                size='sm'
                className='gap-1.5'
                onClick={() => setBackgroundType('color')}
              >
                <Palette className='size-4' />
                Nền màu
              </Button>
            </div>
            {backgroundType === 'image' && (
              <>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleFileChange}
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => fileInputRef.current?.click()}
                >
                  Chọn ảnh
                </Button>
              </>
            )}
            {backgroundType === 'color' && (
              <div className='flex items-center gap-2'>
                <input
                  type='color'
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className='h-9 w-14 cursor-pointer rounded border border-input'
                  aria-label='Chọn màu nền'
                />
                <input
                  type='text'
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className='h-9 w-24 rounded border border-input bg-background px-2 text-sm'
                />
              </div>
            )}
          </div>

          <div className='space-y-3'>
            <div>
              <label className='text-muted-foreground mb-1.5 block text-sm font-medium'>
                Caption (hiển thị trên hình)
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder='Caption hiển thị trên hình (story)...'
                className='min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                rows={4}
              />
            </div>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='flex flex-wrap items-center gap-2'>
                <label className='text-muted-foreground text-sm font-medium' htmlFor='story-font-size'>
                  Cỡ chữ
                </label>
                <select
                  id='story-font-size'
                  value={FONT_SIZE_PRESETS.includes(fontSize as (typeof FONT_SIZE_PRESETS)[number]) ? fontSize : ''}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v !== '') setFontSize(Number(v))
                  }}
                  className='h-9 rounded-md border border-input bg-background px-2 text-sm'
                  aria-label='Chọn cỡ chữ nhanh'
                >
                  {FONT_SIZE_PRESETS.map((size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  ))}
                  <option value=''>Tùy chỉnh</option>
                </select>
                <input
                  type='number'
                  min={FONT_SIZE_MIN}
                  max={FONT_SIZE_MAX}
                  value={fontSize}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    if (!Number.isNaN(n)) setFontSize(Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, n)))
                  }}
                  className='h-9 w-16 rounded-md border border-input bg-background px-2 text-sm'
                  aria-label='Cỡ chữ (px) tùy chỉnh'
                />
                <span className='text-muted-foreground text-xs'>px</span>
              </div>
              <div className='flex items-center gap-2'>
                <label className='text-muted-foreground text-sm font-medium' htmlFor='story-caption-bg'>
                  Màu nền chữ
                </label>
                <input
                  id='story-caption-bg'
                  type='color'
                  value={captionBgColor}
                  onChange={(e) => setCaptionBgColor(e.target.value)}
                  className='h-9 w-14 cursor-pointer rounded border border-input'
                  aria-label='Chọn màu nền chữ'
                />
                <input
                  type='text'
                  value={captionBgColor}
                  onChange={(e) => setCaptionBgColor(e.target.value)}
                  className='h-9 w-24 rounded border border-input bg-background px-2 text-sm'
                  aria-label='Mã màu nền chữ (hex)'
                />
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6'>
            <div className='flex flex-col gap-2'>
              <span className='text-muted-foreground text-xs font-medium'>Preview (9:16)</span>
              <div
                className='mx-auto w-full max-w-[280px] overflow-hidden rounded-lg border bg-muted/30 shadow-md'
                style={{ aspectRatio: '9/16' }}
              >
                <div
                  className='relative flex h-full w-full items-center justify-center'
                  style={{
                    backgroundColor: backgroundType === 'color' ? colorHex : undefined,
                    backgroundImage:
                      backgroundType === 'image' && imagePreviewUrl
                        ? `url(${imagePreviewUrl})`
                        : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {lines.length > 0 && (
                    <div
                      className='flex flex-col items-center justify-center px-2 py-2 text-center text-white'
                      style={{
                        backgroundColor: captionBgColor,
                        borderRadius: CAPTION_RADIUS,
                        padding: `${Math.round(paddingV * previewScale)}px ${Math.round(PADDING_H * previewScale)}px`,
                        fontSize: `${fontSize * previewScale}px`,
                        lineHeight: 1.35,
                        maxWidth: `${stripWidth * previewScale}px`,
                      }}
                    >
                      {lines.map((line, i) => (
                        <span key={i}>{line}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='flex flex-1 flex-col justify-center gap-2'>
              <Button
                type='button'
                className='gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600'
                disabled={exporting}
                onClick={exportToPng}
              >
                {exporting ? (
                  <span className='animate-pulse'>Đang tạo...</span>
                ) : (
                  <>
                    <Download className='size-4 shrink-0' />
                    Tải về (PNG 1080×1920)
                  </>
                )}
              </Button>
              {!hasBackground && backgroundType === 'image' && (
                <p className='text-muted-foreground text-xs'>
                  Chọn ảnh để dùng làm nền; nếu không sẽ dùng nền màu khi tải về.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
