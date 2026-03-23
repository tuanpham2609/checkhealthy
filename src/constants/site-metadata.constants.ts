/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

/**
 * URL công khai cho OG / JSON-LD / sitemap. Ưu tiên `NEXT_PUBLIC_APP_URL`;
 * trên Vercel có thể dùng `VERCEL_URL` nếu chưa set biến kia (HTTPS).
 */
function publicSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  if (explicit) return explicit
  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, '')
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

/**
 * Nội dung & SEO on-page. Xếp hạng Google phụ thuộc backlink, chất lượng nội dung, cạnh tranh từ khóa,
 * Core Web Vitals, v.v. — không có cách “đảm bảo top 1” chỉ bằng code.
 */
/** Favicon, manifest, logo Schema — `public/assets/ivf-heart-brand.png` */
const SITE_LOGO_PATH = '/assets/ivf-heart-brand.png'
/**
 * Ảnh Open Graph — `public/assets/og-share.png` (Facebook / Messenger / Zalo).
 * Thay file: cập nhật `siteOgImageWidth` / `siteOgImageHeight` cho khớp kích thước thật.
 */
const SITE_OG_IMAGE_PATH = '/assets/og-share.png'

const SITE_URL = publicSiteUrl()

export const SITE_METADATA = {
  titleHeader: 'Tâm sự IVF',
  /** Tiêu đề đầy đủ cho thẻ <title> / OG (ưu tiên ~50–60 ký tự phần nhìn thấy) */
  title: 'Tâm sự IVF — Cộng đồng chia sẻ hành trình thụ tinh trong ống nghiệm',
  author: 'Tâm sự IVF',
  /** Meta description: ~150–160 ký tự, một câu chào + lợi ích + từ khóa tự nhiên */
  description:
    'Nơi chị em ẩn danh chia sẻ tâm sự IVF: tiêm kích thích, chọc hút, chuyển phôi, chờ beta… được lắng nghe và đồng hành. Mong mỗi hành trình đều về đích — một em bé như mong ước.',
  /** Mô tả dài hơn cho đoạn giới thiệu trên trang (SEO + UX) */
  introParagraph:
    'Đây là không gian dành riêng cho những ai đang đi qua hành trình thiên sứ của đời mình : kể những điều khó nói với người ngoài, hỏi kinh nghiệm, hoặc chỉ cần một chỗ để thở ra. Chúng mình tin vào sự tử tế — và mong tất cả chị em, dù hành trình ra sao, đều được nâng đỡ và một ngày nào đó ôm em bé trong lòng, đúng như điều mình đã mơ.',
  /** Dòng phụ dưới logo trên header */
  tagline: 'Chia sẻ hành trình IVF — lắng nghe, động viên, cùng nhau bước tiếp',
  /** Chân trang thân thiện + gợi ý kỹ thuật ngắn */
  footerMessage:
    'Mỗi câu chuyện đều đáng được trân trọng. Chúc chị em luôn có thêm một chút hy vọng mỗi ngày. Đăng bài ẩn danh — hãy giữ không gian này ấm áp và tôn trọng nhau.',
  language: 'vi',
  locale: 'vi-VN',
  siteUrl: SITE_URL,
  /** Đường dẫn tương đối logo trong `public` */
  siteLogoPath: SITE_LOGO_PATH,
  /** URL tuyệt đối logo — favicon, Schema Organization */
  siteLogo: `${SITE_URL}${SITE_LOGO_PATH}`,
  /** Ảnh Open Graph / Zalo / Messenger (kích thước chuẩn link preview) */
  siteOgImagePath: SITE_OG_IMAGE_PATH,
  siteOgImage: `${SITE_URL}${SITE_OG_IMAGE_PATH}`,
  /** Kích thước thật của `og-share.png` (ảnh banner chia sẻ) */
  siteOgImageWidth: 1376,
  siteOgImageHeight: 768,
  email: 'hello@example.com',
  keywords: [
    'tâm sự IVF',
    'IVF',
    'thụ tinh trong ống nghiệm',
    'chia sẻ IVF',
    'cộng đồng IVF',
    'hành trình IVF',
    'kích thích buồng trứng',
    'chọc hút trứng',
    'chuyển phôi',
    'mang thai IVF',
    'hỗ trợ tâm lý IVF',
    'ẩn danh chia sẻ',
  ] as const,
} as const
