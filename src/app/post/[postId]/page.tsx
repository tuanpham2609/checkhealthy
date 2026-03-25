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
  const base = SITE_METADATA.siteUrl.replace(/\/$/, '')
  const fallbackTitle = `Tâm sự | ${SITE_METADATA.titleHeader}`

  if (!postId || !/^[0-9a-f-]{36}$/i.test(postId)) {
    return {
      title: fallbackTitle,
      robots: { index: false, follow: true },
    }
  }

  const canonical = `${base}/post/${postId}`

  if (!isSupabaseConfigured()) {
    return {
      title: fallbackTitle,
      alternates: { canonical },
      robots: { index: true, follow: true },
    }
  }

  try {
    const supabase = createSupabaseAdmin()
    const { data } = await supabase.from('confession_posts').select('author, content').eq('id', postId).maybeSingle()

    if (!data) {
      return {
        title: `Không tìm thấy | ${SITE_METADATA.titleHeader}`,
        alternates: { canonical },
        robots: { index: false, follow: true },
      }
    }

    const description = data.content.trim().slice(0, 160) || SITE_METADATA.description
    const title = `${data.author} — ${SITE_METADATA.titleHeader}`

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'article',
        locale: SITE_METADATA.locale,
        siteName: SITE_METADATA.titleHeader,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      robots: { index: true, follow: true },
    }
  } catch {
    return {
      title: fallbackTitle,
      alternates: { canonical },
      robots: { index: true, follow: true },
    }
  }
}

export default async function PostDetailPage({ params }: Props) {
  const { postId } = await params
  return <PostDetailClient postId={postId} />
}
