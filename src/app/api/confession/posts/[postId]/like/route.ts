/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { NextResponse } from 'next/server'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'
import { ensureVisitorId, getVisitorIdFromRequest } from '@/lib/confession/visitor-id'

interface RouteParams {
  params: Promise<{ postId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Chưa cấu hình Supabase' }, { status: 503 })
  }

  const { postId } = await params
  if (!postId || !/^[0-9a-f-]{36}$/i.test(postId)) {
    return NextResponse.json({ error: 'postId không hợp lệ' }, { status: 400 })
  }

  const existingVid = getVisitorIdFromRequest(request)
  const { id: visitorId, setCookie } = ensureVisitorId(existingVid)

  try {
    const supabase = createSupabaseAdmin()

    const { data: postRow, error: pe } = await supabase
      .from('confession_posts')
      .select('id, like_count')
      .eq('id', postId)
      .maybeSingle()

    if (pe || !postRow) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
    }

    const currentCount = typeof postRow.like_count === 'number' ? postRow.like_count : 0

    const { data: existingLike } = await supabase
      .from('confession_post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('visitor_id', visitorId)
      .maybeSingle()

    let liked: boolean
    let nextCount: number

    if (existingLike) {
      const { error: delErr } = await supabase
        .from('confession_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('visitor_id', visitorId)
      if (delErr) {
        console.error(delErr)
        return NextResponse.json({ error: 'Không bỏ tim được' }, { status: 500 })
      }
      nextCount = Math.max(0, currentCount - 1)
      const { error: upErr } = await supabase
        .from('confession_posts')
        .update({ like_count: nextCount })
        .eq('id', postId)
      if (upErr) {
        console.error(upErr)
        return NextResponse.json({ error: 'Không cập nhật được số tim' }, { status: 500 })
      }
      liked = false
    } else {
      const { error: insErr } = await supabase.from('confession_post_likes').insert({
        post_id: postId,
        visitor_id: visitorId,
      })
      if (insErr) {
        console.error(insErr)
        return NextResponse.json({ error: 'Không ghi được tim' }, { status: 500 })
      }
      nextCount = currentCount + 1
      const { error: upErr } = await supabase
        .from('confession_posts')
        .update({ like_count: nextCount })
        .eq('id', postId)
      if (upErr) {
        console.error(upErr)
        return NextResponse.json({ error: 'Không cập nhật được số tim' }, { status: 500 })
      }
      liked = true
    }

    const headers = new Headers()
    if (setCookie) {
      headers.set('Set-Cookie', setCookie)
    }
    return NextResponse.json({ likeCount: nextCount, liked }, { headers })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
