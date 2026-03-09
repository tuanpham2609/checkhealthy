/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const FETCH_TIMEOUT_MS = 10000

const FETCH_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml']

function isImageType(ct: string): boolean {
  const t = ct.split(';')[0].trim().toLowerCase()
  return IMAGE_TYPES.some((x) => t.startsWith(x))
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'private, no-store',
}

/**
 * GET /api/image-proxy?url=... hoặc POST { imageUrl }
 * Proxy ảnh từ URL (không dùng Sharp) — client dùng blob này vẽ canvas + mô tả rồi tải về.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')?.trim()
  if (!imageUrl) {
    return NextResponse.json({ error: 'Thiếu url' }, { status: 400, headers: CORS_HEADERS })
  }
  try {
    new URL(imageUrl)
  } catch {
    return NextResponse.json({ error: 'url không hợp lệ' }, { status: 400, headers: CORS_HEADERS })
  }
  try {
    const res = await fetch(imageUrl, {
      headers: FETCH_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: `Không tải được ảnh (${res.status})` },
        { status: 502, headers: CORS_HEADERS }
      )
    }
    const contentType = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    if (!isImageType(contentType)) {
      return NextResponse.json(
        { error: 'URL không trỏ tới ảnh' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    const buf = await res.arrayBuffer()
    if (buf.byteLength > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'Ảnh quá lớn (>5MB)' },
        { status: 413, headers: CORS_HEADERS }
      )
    }
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        ...CORS_HEADERS,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi proxy ảnh'
    return NextResponse.json({ error: message }, { status: 502, headers: CORS_HEADERS })
  }
}

export async function POST(request: Request) {
  let body: { imageUrl?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON không hợp lệ' }, { status: 400, headers: CORS_HEADERS })
  }
  const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : ''
  if (!imageUrl) {
    return NextResponse.json({ error: 'Thiếu imageUrl' }, { status: 400, headers: CORS_HEADERS })
  }
  try {
    new URL(imageUrl)
  } catch {
    return NextResponse.json({ error: 'imageUrl không hợp lệ' }, { status: 400, headers: CORS_HEADERS })
  }
  try {
    const res = await fetch(imageUrl, {
      headers: FETCH_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: `Không tải được ảnh (${res.status})` },
        { status: 502, headers: CORS_HEADERS }
      )
    }
    const contentType = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    if (!isImageType(contentType)) {
      return NextResponse.json(
        { error: 'URL không trỏ tới ảnh' },
        { status: 400, headers: CORS_HEADERS }
      )
    }
    const buf = await res.arrayBuffer()
    if (buf.byteLength > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'Ảnh quá lớn (>5MB)' },
        { status: 413, headers: CORS_HEADERS }
      )
    }
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        ...CORS_HEADERS,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi proxy ảnh'
    return NextResponse.json({ error: message }, { status: 502, headers: CORS_HEADERS })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...CORS_HEADERS, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
  })
}
