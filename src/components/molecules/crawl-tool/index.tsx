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
import type { CrawlResult } from '@/lib/utils/crawl'
import { Link2, Loader2, Copy, Check, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/styles'

export function CrawlTool() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CrawlResult | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  return (
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
                className='h-11 w-full pl-10 text-base sm:h-12 sm:pl-12 md:text-[15px]'
                disabled={loading}
              />
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
                  <a
                    href={result.imageUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-2'
                  >
                    <ExternalLink className='size-4' />
                    Mở ảnh / Tải về
                  </a>
                </CardContent>
              </Card>
            )}

            <Card className='flex-1 overflow-hidden border-emerald-200/60 shadow-lg dark:border-emerald-800/40'>
              <CardHeader className='border-b bg-muted/40 px-4 py-3 sm:px-5 sm:py-4'>
                <CardTitle className='text-base font-semibold sm:text-lg'>Thông tin trang</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 p-4 text-sm sm:space-y-4 sm:p-5 sm:text-[15px]'>
                <div>
                  <span className='text-muted-foreground font-medium'>Tiêu đề:</span>
                  <p className='mt-0.5 font-medium'>{result.title}</p>
                </div>
                <div>
                  <span className='text-muted-foreground font-medium'>Mô tả:</span>
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
  )
}
