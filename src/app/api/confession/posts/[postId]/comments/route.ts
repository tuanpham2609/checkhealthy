/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { NextResponse } from 'next/server'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'
import { validateCommentBody } from '@/lib/confession/validate'

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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON không hợp lệ' }, { status: 400 })
  }

  const parsed = validateCommentBody(body)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  try {
    const supabase = createSupabaseAdmin()

    const { data: post, error: pe } = await supabase.from('confession_posts').select('id').eq('id', postId).maybeSingle()
    if (pe || !post) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 })
    }

    if (parsed.parentId) {
      const { data: parent, error: ce } = await supabase
        .from('confession_comments')
        .select('id, post_id, parent_id')
        .eq('id', parsed.parentId)
        .maybeSingle()

      if (ce || !parent || parent.post_id !== postId || parent.parent_id !== null) {
        return NextResponse.json(
          { error: 'Chỉ được trả lời bình luận gốc (không trả lời lồng cấp sâu hơn)' },
          { status: 400 }
        )
      }
    }

    const { data: row, error } = await supabase
      .from('confession_comments')
      .insert({
        post_id: postId,
        parent_id: parsed.parentId,
        author: parsed.author,
        content: parsed.content,
      })
      .select('id, post_id, parent_id, author, content, created_at')
      .single()

    if (error || !row) {
      console.error(error)
      return NextResponse.json({ error: 'Không gửi được bình luận' }, { status: 500 })
    }

    return NextResponse.json(
      {
        comment: {
          id: row.id,
          postId: row.post_id,
          parentId: row.parent_id,
          author: row.author,
          content: row.content,
          createdAt: new Date(row.created_at).getTime(),
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
