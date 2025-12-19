/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { Facebook, Instagram } from 'lucide-react'
import { Navigation } from '@/types/navigation.types'
import { TikTokIcon } from '@/components/atoms/icons/tiktok-icon'

export const NAVIGATION_ITEMS: Navigation = [
  {
    id: 'products',
    title: 'Sản phẩm',
    items: [
      {
        id: 'watercolor',
        href: '/products/watercolor',
        title: 'Màu nước',
        description: 'Bộ màu nước cao cấp với đầy đủ màu sắc',
      },
      {
        id: 'oil-paint',
        href: '/products/oil-paint',
        title: 'Màu dầu',
        description: 'Màu dầu chuyên nghiệp cho họa sĩ',
      },
      {
        id: 'acrylic',
        href: '/products/acrylic',
        title: 'Màu Acrylic',
        description: 'Màu acrylic đa dụng, khô nhanh',
      },
      {
        id: 'brushes',
        href: '/products/brushes',
        title: 'Cọ vẽ',
        description: 'Bộ cọ vẽ đa dạng từ cơ bản đến chuyên nghiệp',
      },
      {
        id: 'canvas',
        href: '/products/canvas',
        title: 'Canvas & Giấy',
        description: 'Canvas và giấy vẽ chất lượng cao',
      },
    ],
  },
  {
    id: 'categories',
    title: 'Danh mục',
    items: [
      {
        id: 'watercolor',
        href: '/categories/watercolor',
        title: 'Màu nước',
        description: 'Bộ màu nước đầy đủ màu sắc, dễ pha trộn',
      },
      {
        id: 'brushes',
        href: '/categories/brushes',
        title: 'Cọ vẽ',
        description: 'Cọ vẽ đa dạng kích thước và loại',
      },
      {
        id: 'canvas',
        href: '/categories/canvas',
        title: 'Canvas & Giấy',
        description: 'Canvas chuyên nghiệp và giấy vẽ chất lượng',
      },
      {
        id: 'drawing-tools',
        href: '/categories/drawing-tools',
        title: 'Dụng cụ vẽ',
        description: 'Bút chì, than chì, gôm và dụng cụ vẽ',
      },
      {
        id: 'accessories',
        href: '/categories/accessories',
        title: 'Phụ kiện',
        description: 'Palette, giá vẽ, khung tranh và phụ kiện khác',
      },
    ],
  },
  {
    id: 'support',
    title: 'Hỗ trợ',
    items: [
      {
        id: 'FAQ',
        href: '/support/faq',
        title: 'Câu hỏi thường gặp',
        description: 'Tìm câu trả lời cho các câu hỏi về sản phẩm',
      },
      {
        id: 'contact-us',
        href: '/support/contact-us',
        title: 'Liên hệ',
        description: 'Liên hệ với chúng tôi để được tư vấn',
      },
    ],
  },
  {
    id: 'about',
    title: 'Về chúng tôi',
    items: [
      {
        id: 'terms-of-service',
        href: '/about/terms-of-service',
        title: 'Điều khoản dịch vụ',
        description: 'Những điều bạn cần biết khi sử dụng dịch vụ',
      },
      {
        id: 'privacy-policy',
        href: '/about/privacy-policy',
        title: 'Chính sách bảo mật',
        description: 'Chúng tôi cam kết bảo vệ thông tin của bạn',
      },
    ],
  },
]

export const HOME_SECTIONS = [
  { id: 'best-selling-top', label: 'Hot nhất', href: '#best-selling-top' },
  { id: 'youtube-shorts-top', label: 'Video Top', href: '#youtube-shorts-top' },
  { id: 'best-selling', label: 'Bán chạy', href: '#best-selling' },
  { id: 'products', label: 'Sản phẩm', href: '#products' },
  { id: 'youtube-shorts', label: 'Video', href: '#youtube-shorts' },
] as const

export const SOCIAL_LINKS = [
  {
    id: 'facebook',
    href: 'https://www.facebook.com/votanthanh.1905',
    icon: Facebook,
  },
  {
    id: 'instagram',
    href: 'https://www.instagram.com/votanthanh.art?igsh=b3l2YTEwbjZmdW11&utm_source=qr',
    icon: Instagram,
  },
  {
    id: 'tiktok',
    href: 'https://www.tiktok.com/@votanthanh.art?_r=1&_d=secCgYIASAHKAESPgo8G3o9IwCqPaVXTRGjdb090m7XUlUyOYHYs9XcW%2BFCwWiDpmz6ZPpallYYTaaVJmtwHox1awtXOP6onvncGgA%3D&_svg=1&checksum=fcd4673274fa188a2292e5b5ffcb1cc852e25df2dda87a179a0a061e43a4f44d&item_author_type=1&sec_uid=MS4wLjABAAAAKEWHGgjkgHPwCGqubUdjvqN2ysnDhFymLyCTfJG2SgZUdkKCPzhDnLufoYOkgbm-&sec_user_id=MS4wLjABAAAAKEWHGgjkgHPwCGqubUdjvqN2ysnDhFymLyCTfJG2SgZUdkKCPzhDnLufoYOkgbm-&share_app_id=1180&share_author_id=6918317911539647490&share_link_id=9B0B4A44-343E-4C1B-BA54-4E50FBC2C427&share_region=VN&share_scene=1&sharer_language=vi&social_share_type=4&source=h5_t&timestamp=1766135897&tt_from=copy&u_code=dgfm4637h4153e&ug_btm=b8727%2Cb0&user_id=6918317911539647490&utm_campaign=client_share&utm_medium=ios&utm_source=copy',
    icon: TikTokIcon,
  },
]
