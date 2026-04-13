/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import type { Metadata } from 'next'
import { SITE_METADATA } from '@/constants/site-metadata.constants'
import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/admin'
import { PostDetailClient } from './post-detail-client'

type Props = {
  params: Promise<{ postId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params
  const fallbackTitle = `Bài viết | ${SITE_METADATA.titleHeader}`

  if (!postId || !/^[0-9a-f-]{36}$/i.test(postId)) {
    return { title: fallbackTitle }
  }

  if (!isSupabaseConfigured()) {
    return { title: fallbackTitle }
  }

  try {
    const supabase = createSupabaseAdmin()
    const { data } = await supabase.from('confession_posts').select('author, content').eq('id', postId).maybeSingle()

    if (!data) {
      return { title: `Không tìm thấy | ${SITE_METADATA.titleHeader}` }
    }

    return { title: `${data.author} — ${SITE_METADATA.titleHeader}` }
  } catch {
    return { title: fallbackTitle }
  }
}

export default async function PostDetailPage({ params }: Props) {
  const { postId } = await params
  return <PostDetailClient postId={postId} />
}
