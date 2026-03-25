/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

export interface ConfessionReply {
  id: string
  author: string
  content: string
  createdAt: number
}

export interface ConfessionComment {
  id: string
  author: string
  content: string
  createdAt: number
  replies: ConfessionReply[]
}

export interface ConfessionPost {
  id: string
  author: string
  content: string
  /** URL ảnh public (Supabase Storage) */
  imageUrls: string[]
  createdAt: number
  comments: ConfessionComment[]
  /** Số tim (server) */
  likeCount: number
  /** Đã tim (theo cookie ẩn danh), có thể thiếu trên feed nếu chưa batch */
  liked?: boolean
}
