/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

/**
 * URL gốc (chia sẻ link, metadataBase). Ưu tiên `NEXT_PUBLIC_APP_URL`;
 * trên Vercel có thể dùng `VERCEL_URL` nếu chưa set biến kia (HTTPS).
 */
function publicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  if (explicit) return explicit
  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, '')
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

const SITE_URL = publicSiteUrl()

/** Tiêu đề tab trình duyệt — chỉ dùng trong `metadata`, không gắn với phần tâm sự trên UI */
export const APP_DOCUMENT_TITLE = 'Phần mềm quản lý công việc'

/** Nội dung hiển thị trên giao diện (header tâm sự, chân trang, v.v.) */
export const SITE_METADATA = {
  titleHeader: 'Tâm sự',
  title: 'Tâm sự',
  tagline: 'Viết ẩn danh — lắng nghe, động viên',
  introParagraph:
    'Đây là chỗ để kể những điều khó nói với người ngoài, hỏi kinh nghiệm, hoặc chỉ cần một nơi để thở ra. Mong mọi người giữ không gian này tử tế và tôn trọng nhau.',
  footerMessage:
    'Mỗi câu chuyện đều đáng được trân trọng. Đăng bài ẩn danh — hãy giữ không gian này ấm áp và tôn trọng lẫn nhau.',
  siteUrl: SITE_URL,
} as const
