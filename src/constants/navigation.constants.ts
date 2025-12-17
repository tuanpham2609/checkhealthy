/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import X from '@public/assets/icons/x.svg'
import Discord from '@public/assets/icons/discord.svg'
import Telegram from '@public/assets/icons/telegram.svg'
import { Navigation } from '@/types/navigation.types'

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

export const SOCIAL_LINKS = [
  {
    id: 'x',
    href: 'https://x.com/tbchatofficial',
    icon: X,
  },
  {
    id: 'telegram',
    href: 'https://t.me/TBChatGlobal',
    icon: Telegram,
  },
  {
    id: 'discord',
    href: 'https://discord.com/invite/6UHYk6k372',
    icon: Discord,
  },
]
