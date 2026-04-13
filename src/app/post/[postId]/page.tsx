/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import type { Metadata } from 'next'
import { APP_DOCUMENT_TITLE } from '@/constants/site-metadata.constants'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'
import { PostDetailClient } from './post-detail-client'

type Props = {
  params: Promise<{ postId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params

  if (!postId || !/^[0-9a-f-]{36}$/i.test(postId)) {
    return { title: { absolute: `Bài viết | ${APP_DOCUMENT_TITLE}` } }
  }

  if (!isSupabaseConfigured()) {
    return { title: { absolute: `Bài viết | ${APP_DOCUMENT_TITLE}` } }
  }

  try {
    const supabase = createSupabaseAdmin()
    const { data } = await supabase.from('confession_posts').select('author').eq('id', postId).maybeSingle()

    if (!data) {
      return { title: { absolute: `Không tìm thấy | ${APP_DOCUMENT_TITLE}` } }
    }

    const author = data.author?.trim() || 'Ẩn danh'
    return { title: { absolute: `${author} | ${APP_DOCUMENT_TITLE}` } }
  } catch {
    return { title: { absolute: `Bài viết | ${APP_DOCUMENT_TITLE}` } }
  }
}

export default async function PostDetailPage({ params }: Props) {
  const { postId } = await params
  return <PostDetailClient postId={postId} />
}
