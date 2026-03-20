/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Map<string, string>([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Chưa cấu hình Supabase' }, { status: 503 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Multipart không hợp lệ' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Thiếu file ảnh' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Ảnh tối đa 5MB' }, { status: 400 })
  }

  const ext = ALLOWED.get(file.type)
  if (!ext) {
    return NextResponse.json({ error: 'Chỉ chấp nhận JPEG, PNG, WebP, GIF' }, { status: 400 })
  }

  const path = `posts/${randomUUID()}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())

  try {
    const supabase = createSupabaseAdmin()
    const { error: upErr } = await supabase.storage.from('confession-media').upload(path, buf, {
      contentType: file.type,
      upsert: false,
    })

    if (upErr) {
      console.error(upErr)
      return NextResponse.json({ error: 'Upload thất bại (kiểm tra bucket confession-media)' }, { status: 500 })
    }

    const { data: pub } = supabase.storage.from('confession-media').getPublicUrl(path)
    return NextResponse.json({ url: pub.publicUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
