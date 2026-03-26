/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { CONFESSION_PAGE_SIZE } from '@/lib/confession/constants'
import type { ConfessionSort } from '@/lib/confession/feed-sort'

export const confessionKeys = {
  all: ['confession'] as const,
  posts: () => [...confessionKeys.all, 'posts'] as const,
  postsList: (page: number, limit: number = CONFESSION_PAGE_SIZE, sort: ConfessionSort = 'newest', q = '') =>
    [...confessionKeys.posts(), 'list', { page, limit, sort, q }] as const,
  post: (postId: string) => [...confessionKeys.all, 'post', postId] as const,
}
