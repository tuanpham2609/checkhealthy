/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'
import { mapRowsToPosts } from '@/lib/confession/map-db-to-feed'
import { VISITOR_COOKIE_NAME } from '@/lib/confession/visitor-id'

interface RouteParams {
  params: Promise<{ postId: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Chưa cấu hình Supabase' }, { status: 503 })
  }

  const { postId } = await params
  if (!postId || !/^[0-9a-f-]{36}$/i.test(postId)) {
    return NextResponse.json({ error: 'postId không hợp lệ' }, { status: 400 })
  }

  try {
    const supabase = createSupabaseAdmin()

    const { data: post, error: e1 } = await supabase
      .from('confession_posts')
      .select('id, author, content, created_at, image_urls, like_count')
      .eq('id', postId)
      .maybeSingle()

    if (e1) {
      console.error(e1)
      return NextResponse.json({ error: 'Không đọc được bài viết' }, { status: 500 })
    }
    if (!post) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
    }

    const { data: comments, error: e2 } = await supabase
      .from('confession_comments')
      .select('id, post_id, parent_id, author, content, created_at')
      .eq('post_id', postId)

    if (e2) {
      console.error(e2)
      return NextResponse.json({ error: 'Không đọc được bình luận' }, { status: 500 })
    }

    const cookieStore = await cookies()
    const visitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value
    const likedPostIds = new Set<string>()
    if (visitorId) {
      const { data: likeRow } = await supabase
        .from('confession_post_likes')
        .select('post_id')
        .eq('post_id', postId)
        .eq('visitor_id', visitorId)
        .maybeSingle()
      if (likeRow) {
        likedPostIds.add(postId)
      }
    }

    const [mapped] = mapRowsToPosts([post], comments ?? [], likedPostIds)
    return NextResponse.json({ post: mapped })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
