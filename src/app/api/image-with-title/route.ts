/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import * as cheerio from 'cheerio'
import { NextResponse } from 'next/server'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'
export const maxDuration = 20

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

const FETCH_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
}

const FETCH_HTML_HEADERS: HeadersInit = {
  ...FETCH_HEADERS,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml']

function isImageType(ct: string): boolean {
  const t = ct.split(';')[0].trim().toLowerCase()
  return IMAGE_TYPES.some((x) => t.startsWith(x))
}

function resolveUrl(base: string, href: string | undefined): string {
  if (!href || href.startsWith('data:')) return ''
  try {
    return new URL(href, base).href
  } catch {
    return ''
  }
}

function extractImageFromHtml(html: string, baseUrl: string): string | null {
  const $ = cheerio.load(html)
  const get = (name: string) =>
    $(`meta[property="${name}"]`).attr('content')?.trim() ||
    $(`meta[name="${name}"]`).attr('content')?.trim() ||
    ''
  const og = get('og:image') || get('twitter:image')
  if (og) return resolveUrl(baseUrl, og)
  const src = $('img[src]').first().attr('src')
  return resolveUrl(baseUrl, src) || null
}

async function fetchImageBuffer(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const res = await fetch(url, {
    headers: FETCH_HTML_HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) return null
  const contentType = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
  const baseUrl = res.url || url

  if (contentType.startsWith('text/html')) {
    const html = await res.text()
    const imgUrl = extractImageFromHtml(html, baseUrl)
    if (!imgUrl) return null
    const imgRes = await fetch(imgUrl, {
      headers: FETCH_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    })
    if (!imgRes.ok) return null
    const imgCt = (imgRes.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    if (!isImageType(imgCt)) return null
    const buf = Buffer.from(await imgRes.arrayBuffer())
    return buf.length > MAX_IMAGE_SIZE ? null : { buffer: buf, contentType: imgCt }
  }

  if (!isImageType(contentType)) return null
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length > MAX_IMAGE_SIZE) return null
  return { buffer: buf, contentType }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Chia mô tả thành nhiều dòng, gói sát chiều ngang (full nền, canh đều 2 bên). */
function wrapTitle(text: string, width: number): string[] {
  const t = text.trim()
  if (!t) return []
  const maxCharsPerLine = Math.max(40, Math.floor(width / 16))
  const words = t.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (next.length <= maxCharsPerLine) {
      line = next
    } else {
      if (line) lines.push(line)
      line = w.length <= maxCharsPerLine ? w : w.slice(0, maxCharsPerLine)
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * POST /api/image-with-title
 * Body: { imageUrl: string, description: string }
 * Server tải ảnh, giữ nguyên kích thước, chỉ vẽ dải mô tả ở dưới rồi trả về PNG.
 */
export async function POST(request: Request) {
  try {
    let body: { imageUrl?: string; description?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Body JSON không hợp lệ' }, { status: 400 })
    }
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : ''
    const description = typeof body?.description === 'string' ? body.description : ''

    if (!imageUrl) {
      return NextResponse.json({ error: 'Thiếu imageUrl' }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(imageUrl)
    } catch {
      return NextResponse.json({ error: 'imageUrl không hợp lệ' }, { status: 400 })
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Chỉ chấp nhận http/https' }, { status: 400 })
    }

    const fetched = await fetchImageBuffer(imageUrl)
    if (!fetched) {
      return NextResponse.json(
        { error: 'Không tải được ảnh từ link (hoặc link không phải ảnh/trang có ảnh)' },
        { status: 502 }
      )
    }

    const pipeline = sharp(fetched.buffer)
    const meta = await pipeline.metadata()
    const W = meta.width ?? 1200
    const H = meta.height ?? 630

    const lines = wrapTitle(description, W)
    if (lines.length === 0) {
      const out = await pipeline.png().toBuffer()
      return new NextResponse(new Uint8Array(out), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'private, no-store',
        },
      })
    }

    const paddingH = 10
    const paddingV = Math.round(W * 0.03)
    const fontSize = Math.min(30, Math.round(W * 0.028))
    const lineHeight = Math.round(fontSize * 1.35)
    const stripHeight = lines.length * lineHeight + paddingV * 2
    const stripY = H - stripHeight
    const maxLineWidth = W - 2 * paddingH

    const textX = W / 2
    const textEls = lines
      .map(
        (line, i) =>
          `<text x="${textX}" y="${stripY + paddingV + (i + 1) * lineHeight - lineHeight * 0.2}" text-anchor="middle" textLength="${maxLineWidth}" lengthAdjust="spacing" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="600" fill="#ffffff">${escapeXml(line)}</text>`
      )
      .join('')

    const svg = Buffer.from(
      `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="${stripY}" width="${W}" height="${stripHeight}" fill="rgb(54, 118, 42)"/>
        ${textEls}
      </svg>`
    )

    const overlay = await sharp(svg).png().toBuffer()

    const out = await sharp(fetched.buffer)
      .png()
      .composite([{ input: overlay, top: 0, left: 0 }])
      .png()
      .toBuffer()

    return new NextResponse(new Uint8Array(out), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi tạo ảnh'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
