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

const MYMEMORY_MAX_CHARS = 500
const CHUNK_SIZE = 400

/**
 * Dịch một đoạn text sang tiếng Việt qua MyMemory API (miễn phí, không cần key).
 * Nguồn mặc định: en (English). Có thể đổi sourceLang nếu cần (es, fr, pt, zh-CN...).
 */
async function translateChunk(text: string, sourceLang: string): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed) return ''
  const params = new URLSearchParams({
    q: trimmed,
    langpair: `${sourceLang}|vi`,
  })
  const res = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`MyMemory API error: ${res.status}`)
  const data = (await res.json()) as { responseData?: { translatedText?: string }; responseStatus?: number }
  const translated = data?.responseData?.translatedText
  if (data?.responseStatus === 403) throw new Error('Giới hạn dịch miễn phí đã hết, thử lại sau.')
  if (typeof translated !== 'string') throw new Error('Không nhận được bản dịch')
  return translated.trim()
}

/**
 * Chia text thành các chunk nhỏ hơn MYMEMORY_MAX_CHARS, dịch từng chunk rồi ghép lại.
 */
async function translateLongText(text: string, sourceLang: string): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed) return ''
  if (trimmed.length <= MYMEMORY_MAX_CHARS) return translateChunk(trimmed, sourceLang)
  const chunks: string[] = []
  let remaining = trimmed
  while (remaining.length > 0) {
    let chunk = remaining.slice(0, CHUNK_SIZE)
    const lastSpace = chunk.lastIndexOf(' ')
    if (remaining.length > CHUNK_SIZE && lastSpace > CHUNK_SIZE / 2) {
      chunk = chunk.slice(0, lastSpace + 1)
    }
    remaining = remaining.slice(chunk.length).trim()
    const translated = await translateChunk(chunk, sourceLang)
    if (translated) chunks.push(translated)
  }
  return chunks.join(' ')
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const text = typeof body?.text === 'string' ? body.text.trim() : ''
    const sourceLang = typeof body?.sourceLang === 'string' && body.sourceLang ? body.sourceLang : 'en'

    if (!text) {
      return NextResponse.json(
        { error: 'Thiếu tham số text (chuỗi cần dịch)' },
        { status: 400 }
      )
    }

    const translated = await translateLongText(text, sourceLang)
    return NextResponse.json({ translated })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Dịch thất bại'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
