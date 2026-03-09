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
export const maxDuration = 30

const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' }
const MAX_CHUNK = 200

/**
 * POST /api/tts — Text to speech, trả về audio (MP3) cho đoạn text.
 * Body: { text: string }. Text dài sẽ được gửi thành nhiều request từ client.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const text = typeof body?.text === 'string' ? body.text.trim().slice(0, MAX_CHUNK) : ''
    if (!text) {
      return NextResponse.json({ error: 'Thiếu text' }, { status: 400, headers: CORS_HEADERS })
    }
    const speed = Math.min(1, Math.max(0.5, Number(body?.speed) || 0.88))
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&ttsspeed=${speed}&q=${encodeURIComponent(text)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Không lấy được giọng đọc' },
        { status: 502, headers: CORS_HEADERS }
      )
    }
    const buf = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'audio/mpeg'
    return new NextResponse(buf, {
      status: 200,
      headers: { 'Content-Type': contentType, ...CORS_HEADERS },
    })
  } catch {
    return NextResponse.json(
      { error: 'Lỗi TTS' },
      { status: 502, headers: CORS_HEADERS }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { ...CORS_HEADERS, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
  })
}
