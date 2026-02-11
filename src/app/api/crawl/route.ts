/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { NextResponse } from 'next/server'
import { crawlUrl } from '@/lib/utils/crawl'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = typeof body?.url === 'string' ? body.url.trim() : ''

    if (!url) {
      return NextResponse.json(
        { error: 'Thiếu tham số url (chuỗi)' },
        { status: 400 }
      )
    }

    const result = await crawlUrl(url)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Crawl thất bại'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
