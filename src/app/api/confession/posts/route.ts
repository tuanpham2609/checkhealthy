/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'
import { escapeIlikePattern, parseConfessionSort } from '@/lib/confession/feed-sort'
import { mapRowsToPosts } from '@/lib/confession/map-db-to-feed'
import { validatePostBody } from '@/lib/confession/validate'
import { VISITOR_COOKIE_NAME } from '@/lib/confession/visitor-id'

const DEFAULT_LIMIT = 25
const MAX_LIMIT = 50

const POST_SELECT = 'id, author, content, created_at, image_urls, like_count'

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Chưa cấu hình Supabase. Xem .env.example và docs/supabase-setup.md.' },
      { status: 503 }
    )
  }

  const { searchParams } = new URL(request.url)
  const pageRaw = parseInt(searchParams.get('page') || '1', 10)
  const limitRaw = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1
  const limit =
    Number.isFinite(limitRaw) && limitRaw >= 1 ? Math.min(limitRaw, MAX_LIMIT) : DEFAULT_LIMIT

  const sort = parseConfessionSort(searchParams.get('sort'))
  const qRaw = searchParams.get('q')?.trim().slice(0, 200) ?? ''
  const q = qRaw.replace(/,/g, ' ').trim()

  try {
    const supabase = createSupabaseAdmin()

    const searchPattern = q ? `%${escapeIlikePattern(q)}%` : null

    let countQuery = supabase.from('confession_posts').select('*', { count: 'exact', head: true })
    if (searchPattern) {
      countQuery = countQuery.or(`content.ilike.${searchPattern},author.ilike.${searchPattern}`)
    }

    const { count: totalCount, error: cErr } = await countQuery

    if (cErr) {
      console.error(cErr)
      return NextResponse.json({ error: 'Không đếm được bài viết' }, { status: 500 })
    }

    const total = totalCount ?? 0
    const totalPages = total === 0 ? 1 : Math.max(1, Math.ceil(total / limit))
    const safePage = Math.min(page, totalPages)

    const rangeStart = (safePage - 1) * limit
    const rangeEnd = rangeStart + limit - 1

    let dataQuery = supabase.from('confession_posts').select(POST_SELECT)
    if (searchPattern) {
      dataQuery = dataQuery.or(`content.ilike.${searchPattern},author.ilike.${searchPattern}`)
    }
    if (sort === 'likes') {
      dataQuery = dataQuery.order('like_count', { ascending: false }).order('created_at', { ascending: false })
    } else if (sort === 'oldest') {
      dataQuery = dataQuery.order('created_at', { ascending: true })
    } else {
      dataQuery = dataQuery.order('created_at', { ascending: false })
    }

    const { data: posts, error: e1 } = await dataQuery.range(rangeStart, rangeEnd)

    if (e1) {
      console.error(e1)
      return NextResponse.json({ error: 'Không đọc được bài viết' }, { status: 500 })
    }

    const postIds = (posts ?? []).map((p) => p.id)
    if (postIds.length === 0) {
      return NextResponse.json({
        posts: [],
        page: safePage,
        limit,
        total,
        totalPages,
      })
    }

    const { data: comments, error: e2 } = await supabase
      .from('confession_comments')
      .select('id, post_id, parent_id, author, content, created_at')
      .in('post_id', postIds)

    if (e2) {
      console.error(e2)
      return NextResponse.json({ error: 'Không đọc được bình luận' }, { status: 500 })
    }

    const cookieStore = await cookies()
    const visitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value
    let likedPostIds: Set<string> | undefined
    if (visitorId && postIds.length > 0) {
      const { data: likeRows } = await supabase
        .from('confession_post_likes')
        .select('post_id')
        .eq('visitor_id', visitorId)
        .in('post_id', postIds)
      likedPostIds = new Set((likeRows ?? []).map((r) => r.post_id as string))
    }

    const mapped = mapRowsToPosts(posts ?? [], comments ?? [], likedPostIds)
    return NextResponse.json({
      posts: mapped,
      page: safePage,
      limit,
      total,
      totalPages,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Chưa cấu hình Supabase' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON không hợp lệ' }, { status: 400 })
  }

  const parsed = validatePostBody(body)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  try {
    const supabase = createSupabaseAdmin()
    const { data, error } = await supabase
      .from('confession_posts')
      .insert({
        author: parsed.author,
        content: parsed.content,
        image_urls: parsed.imageUrls,
      })
      .select('id, author, content, created_at, image_urls, like_count')
      .single()

    if (error || !data) {
      console.error(error)
      return NextResponse.json({ error: 'Không tạo được bài' }, { status: 500 })
    }

    const [mapped] = mapRowsToPosts([data], [])
    return NextResponse.json({ post: mapped }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
