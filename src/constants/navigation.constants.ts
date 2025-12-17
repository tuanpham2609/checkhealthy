/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { msg } from '@lingui/core/macro'
import X from '@public/assets/icons/x.svg'
import Discord from '@public/assets/icons/discord.svg'
import Telegram from '@public/assets/icons/telegram.svg'
import { Navigation } from '@/types/navigation.types'

export const NAVIGATION_ITEMS: Navigation = [
  {
    id: 'products',
    title: msg`Sản phẩm`,
    items: [
      {
        id: 'watercolor',
        href: '/products/watercolor',
        title: msg`Màu nước`,
        description: msg`Bộ màu nước cao cấp với đầy đủ màu sắc`,
      },
      {
        id: 'oil-paint',
        href: '/products/oil-paint',
        title: msg`Màu dầu`,
        description: msg`Màu dầu chuyên nghiệp cho họa sĩ`,
      },
      {
        id: 'acrylic',
        href: '/products/acrylic',
        title: msg`Màu Acrylic`,
        description: msg`Màu acrylic đa dụng, khô nhanh`,
      },
      {
        id: 'brushes',
        href: '/products/brushes',
        title: msg`Cọ vẽ`,
        description: msg`Bộ cọ vẽ đa dạng từ cơ bản đến chuyên nghiệp`,
      },
      {
        id: 'canvas',
        href: '/products/canvas',
        title: msg`Canvas & Giấy`,
        description: msg`Canvas và giấy vẽ chất lượng cao`,
      },
    ],
  },
  {
    id: 'categories',
    title: msg`Danh mục`,
    items: [
      {
        id: 'watercolor',
        href: '/categories/watercolor',
        title: msg`Màu nước`,
        description: msg`Bộ màu nước đầy đủ màu sắc, dễ pha trộn`,
      },
      {
        id: 'brushes',
        href: '/categories/brushes',
        title: msg`Cọ vẽ`,
        description: msg`Cọ vẽ đa dạng kích thước và loại`,
      },
      {
        id: 'canvas',
        href: '/categories/canvas',
        title: msg`Canvas & Giấy`,
        description: msg`Canvas chuyên nghiệp và giấy vẽ chất lượng`,
      },
      {
        id: 'drawing-tools',
        href: '/categories/drawing-tools',
        title: msg`Dụng cụ vẽ`,
        description: msg`Bút chì, than chì, gôm và dụng cụ vẽ`,
      },
      {
        id: 'accessories',
        href: '/categories/accessories',
        title: msg`Phụ kiện`,
        description: msg`Palette, giá vẽ, khung tranh và phụ kiện khác`,
      },
    ],
  },
  {
    id: 'support',
    title: msg`Hỗ trợ`,
    items: [
      {
        id: 'FAQ',
        href: '/support/faq',
        title: msg`Câu hỏi thường gặp`,
        description: msg`Tìm câu trả lời cho các câu hỏi về sản phẩm`,
      },
      {
        id: 'contact-us',
        href: '/support/contact-us',
        title: msg`Liên hệ`,
        description: msg`Liên hệ với chúng tôi để được tư vấn`,
      },
    ],
  },
  {
    id: 'about',
    title: msg`Về chúng tôi`,
    items: [
      {
        id: 'terms-of-service',
        href: '/about/terms-of-service',
        title: msg`Điều khoản dịch vụ`,
        description: msg`Những điều bạn cần biết khi sử dụng dịch vụ`,
      },
      {
        id: 'privacy-policy',
        href: '/about/privacy-policy',
        title: msg`Chính sách bảo mật`,
        description: msg`Chúng tôi cam kết bảo vệ thông tin của bạn`,
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
