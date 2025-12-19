/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import BTC from '@public/assets/chain/BTC.svg'
import ETH from '@public/assets/chain/ETH.svg'
import TRX from '@public/assets/chain/TRX.svg'
import TBC from '@public/assets/chain/TBC.svg'
import Wallet from '@public/assets/icons/wallet.svg'
import Swap from '@public/assets/icons/swap.svg'
import Miner from '@public/assets/icons/miner.svg'
import Layers from '@public/assets/icons/layers.svg'
import USD from '@public/assets/icons/usd.svg'
import Android from '@public/assets/brands/android.svg'
import Apple from '@public/assets/brands/apple.svg'
import Appstore from '@public/assets/brands/appstore.svg'
import Windows from '@public/assets/brands/windows.svg'
import CHPlay from '@public/assets/brands/google-play.svg'
import { Chain, Download, Feature, Platform, Product, Testimonial } from '@/types/landing.types'

export const FEATURES: Feature[] = [
  {
    id: 'watercolor',
    title: 'Màu nước',
    description: 'Bộ màu nước cao cấp với độ bền màu tuyệt vời, dễ pha trộn và tạo hiệu ứng gradient mượt mà. Phù hợp cho cả người mới bắt đầu và họa sĩ chuyên nghiệp.',
    icon: Miner,
    color: 'card-chain-green',
  },
  {
    id: 'brushes',
    title: 'Cọ vẽ',
    description: 'Bộ cọ vẽ đa dạng từ cọ tròn, cọ phẳng đến cọ chi tiết. Lông cọ mềm mại, bền bỉ, giữ màu tốt. Phù hợp với mọi loại màu và kỹ thuật vẽ.',
    icon: Wallet,
    color: 'card-chain-blue-purple',
  },
  {
    id: 'canvas',
    title: 'Canvas & Giấy',
    description: 'Canvas chuyên nghiệp và giấy vẽ chất lượng cao. Độ dày phù hợp, bề mặt mịn màng, hút màu tốt. Đa dạng kích thước từ A4 đến khổ lớn.',
    icon: Swap,
    color: 'card-chain-purple',
  },
  {
    id: 'oil-paint',
    title: 'Màu dầu',
    description: 'Màu dầu cao cấp với độ bão hòa màu cao, thời gian khô linh hoạt. Dễ pha trộn, tạo lớp màu dày và hiệu ứng 3D sống động.',
    icon: Layers,
    color: 'card-chain-orange',
  },
  {
    id: 'drawing-tools',
    title: 'Dụng cụ vẽ',
    description: 'Bút chì, than chì, gôm, thước kẻ và các dụng cụ vẽ chuyên nghiệp. Chất lượng cao, bền bỉ, phù hợp cho mọi kỹ thuật vẽ và phác thảo.',
    icon: USD,
    color: 'card-chain-olive',
  },
] as const

export const CHAINS: Chain[] = [
  { id: 'WATERCOLOR', title: 'Màu nước', logo: TBC },
  { id: 'OIL', title: 'Màu dầu', logo: BTC },
  { id: 'ACRYLIC', title: 'Màu Acrylic', logo: TRX },
  { id: 'PENCIL', title: 'Bút chì màu', logo: ETH },
] as const

export const BACKGROUND_ENUM: Record<number, string> = {
  0: 'green',
  1: 'blue',
  2: 'purple',
  3: 'orange',
  4: 'olive',
}

export const PLATFORMS: Platform[] = [
  {
    id: 'online',
    title: 'Mua online',
    images: {
      desktop: '/assets/background/mobile-app.webp',
      mobile: '/assets/background/mobile-app-mobile.webp',
    },
  },
  { id: 'store', title: 'Cửa hàng', images: { desktop: '/assets/background/extension-app.webp', mobile: '' } },
  { id: 'wholesale', title: 'Bán sỉ', images: { desktop: '/assets/background/desktop-app.webp', mobile: '' } },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Nguyễn Thị Lan',
    role: 'Họa sĩ chuyên nghiệp',
    content:
      'Màu nước ở đây chất lượng tuyệt vời, độ bền màu cao và dễ pha trộn. Tôi đã sử dụng cho nhiều tác phẩm và rất hài lòng với kết quả.',
    avatar: '/assets/avatar/1.webp',
  },
  {
    id: '2',
    name: 'Trần Văn Minh',
    role: 'Sinh viên Mỹ thuật',
    content:
      'Bộ cọ vẽ đa dạng và giá cả hợp lý. Lông cọ mềm mại, giữ màu tốt. Phù hợp cho cả người mới bắt đầu như tôi.',
    avatar: '/assets/avatar/2.webp',
  },
  {
    id: '3',
    name: 'Lê Thị Hoa',
    role: 'Giáo viên Mỹ thuật',
    content:
      'Canvas và giấy vẽ ở đây chất lượng cao, học sinh của tôi rất thích. Giao hàng nhanh và đóng gói cẩn thận.',
    avatar: '/assets/avatar/3.webp',
  },
  {
    id: '4',
    name: 'Phạm Đức Anh',
    role: 'Họa sĩ tự do',
    content: 'Shop có đầy đủ các loại họa cụ từ cơ bản đến chuyên nghiệp. Nhân viên tư vấn nhiệt tình và am hiểu sản phẩm.',
    avatar: '/assets/avatar/4.webp',
  },
  {
    id: '5',
    name: 'Hoàng Thị Mai',
    role: 'Nghệ nhân vẽ tranh',
    content:
      'Màu dầu ở đây có độ bão hòa màu cao, dễ pha trộn và tạo hiệu ứng đẹp. Tôi đã mua nhiều lần và luôn hài lòng.',
    avatar: '/assets/avatar/5.webp',
  },
  {
    id: '6',
    name: 'Vũ Minh Tuấn',
    role: 'Họa sĩ minh họa',
    content:
      'Bút chì màu và dụng cụ vẽ chất lượng tốt, giá cả hợp lý. Shop thường xuyên có chương trình khuyến mãi hấp dẫn.',
    avatar: '/assets/avatar/6.webp',
  },
  {
    id: '7',
    name: 'Đỗ Thị Linh',
    role: 'Họa sĩ nghiệp dư',
    content:
      'Lần đầu mua họa cụ online và rất ấn tượng. Sản phẩm đúng như mô tả, giao hàng nhanh, đóng gói cẩn thận.',
    avatar: '/assets/avatar/7.webp',
  },
  {
    id: '8',
    name: 'Bùi Văn Hùng',
    role: 'Sinh viên Kiến trúc',
    content: 'Dụng cụ vẽ kỹ thuật đầy đủ và chất lượng. Phù hợp cho sinh viên kiến trúc như tôi cần vẽ bản vẽ kỹ thuật.',
    avatar: '/assets/avatar/8.webp',
  },
  {
    id: '9',
    name: 'Ngô Thị Hương',
    role: 'Họa sĩ chân dung',
    content:
      'Màu acrylic ở đây rất tốt, khô nhanh và bền màu. Tôi thường mua số lượng lớn và được giá ưu đãi.',
    avatar: '/assets/avatar/9.webp',
  },
  {
    id: '10',
    name: 'Lý Văn Đức',
    role: 'Họa sĩ phong cảnh',
    content:
      'Canvas khổ lớn chất lượng cao, bề mặt mịn màng. Phù hợp cho các tác phẩm phong cảnh kích thước lớn.',
    avatar: '/assets/avatar/10.webp',
  },
  {
    id: '11',
    name: 'Đinh Thị Nga',
    role: 'Giáo viên Mầm non',
    content:
      'Mua họa cụ cho lớp học, sản phẩm an toàn cho trẻ em, màu sắc đẹp và giá cả phải chăng. Các bé rất thích.',
    avatar: '/assets/avatar/11.webp',
  },
  {
    id: '12',
    name: 'Cao Văn Sơn',
    role: 'Họa sĩ graffiti',
    content: 'Màu spray và các dụng cụ vẽ đường phố đầy đủ. Chất lượng tốt, màu sắc sống động và bền.',
    avatar: '/assets/avatar/12.webp',
  },
  {
    id: '13',
    name: 'Tạ Thị Loan',
    role: 'Họa sĩ thủy mặc',
    content:
      'Giấy vẽ và mực tàu chất lượng cao, phù hợp với kỹ thuật vẽ thủy mặc truyền thống. Rất hài lòng với sản phẩm.',
    avatar: '/assets/avatar/13.webp',
  },
  {
    id: '14',
    name: 'Lưu Văn Bình',
    role: 'Họa sĩ digital',
    content:
      'Mua bảng vẽ và dụng cụ hỗ trợ cho công việc digital art. Sản phẩm chính hãng, giá tốt hơn nhiều nơi khác.',
    avatar: '/assets/avatar/14.webp',
  },
  {
    id: '15',
    name: 'Võ Thị Hạnh',
    role: 'Họa sĩ minh họa sách',
    content:
      'Bút chì màu và màu nước chất lượng tốt, phù hợp cho công việc minh họa. Màu sắc chính xác và dễ sử dụng.',
    avatar: '/assets/avatar/15.webp',
  },
  {
    id: '16',
    name: 'Dương Văn Cường',
    role: 'Họa sĩ tattoo',
    content: 'Mua màu và dụng cụ cho studio tattoo. Chất lượng chuyên nghiệp, an toàn và đáp ứng đầy đủ nhu cầu.',
    avatar: '/assets/avatar/16.webp',
  },
] as const

export const DOWNLOADS: Download[] = [
  {
    id: 'watercolor-set',
    logo: Appstore,
    title: 'Bộ màu nước',
    subtitle: 'Từ',
    images: {
      desktop: '/assets/brands/appstore.svg',
    },
    url: '#',
  },
  {
    id: 'brush-set',
    logo: CHPlay,
    title: 'Bộ cọ vẽ',
    subtitle: 'Từ',
    url: '#',
  },
  {
    id: 'canvas-set',
    logo: Windows,
    title: 'Bộ canvas',
    subtitle: 'Từ',
    url: '#',
  },
  {
    id: 'oil-paint-set',
    logo: Apple,
    title: 'Bộ màu dầu',
    subtitle: 'Từ',
    url: '#',
  },
]

export const BEST_SELLING_PRODUCTS: Product[] = [
  {
    id: '1',
    title: '[MYTHUATCMC] Giấy Canson Hàn A3 125gsm',
    image: '/assets/cmc/vn-11134207-820l4-mif4vdzmwlqe29@resize_w450_nl.webp',
    originalPrice: 31250,
    salePrice: 25000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-Gi%E1%BA%A5y-Canson-H%C3%A0n-A3-125gsm-i.1704932744.51553284892?extraParams=%7B%22display_model_id%22%3A415318054677%7D',
  },
  {
    id: '2',
    title: '[MYTHUATCMC] Cây nối chì gỗ / kim loại',
    image: '/assets/cmc/vn-11134207-820l4-mif4zf829s084f@resize_w450_nl.webp',
    originalPrice: 26250,
    salePrice: 21000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-C%C3%A2y-n%E1%BB%91i-ch%C3%AC-g%E1%BB%97-kim-lo%E1%BA%A1i-i.1704932744.47603318655?extraParams=%7B%22display_model_id%22%3A445318094492%7D',
  },
  {
    id: '3',
    title: '[MYTHUATCMC] Bút di chì (bộ 3 cây)',
    image: '/assets/cmc/vn-11134207-820l4-mif53gzs4kcg64@resize_w450_nl.webp',
    originalPrice: 23750,
    salePrice: 19000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-B%C3%BAt-di-ch%C3%AC-(b%E1%BB%99-3-c%C3%A2y)-i.1704932744.47803304979?extraParams=%7B%22display_model_id%22%3A315317860798%7D',
  },
  {
    id: '4',
    title: '[MYTHUATCMC] BÚT CHÌ HB xanh CONTE',
    image: '/assets/cmc/vn-11134207-820l4-mif5732c1s088d@resize_w450_nl.webp',
    originalPrice: 8750,
    salePrice: 7000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-B%C3%9AT-CH%C3%8C-HB-xanh-CONTE-i.1704932744.28543837146?extraParams=%7B%22display_model_id%22%3A425318188494%7D',
  },
  {
    id: '5',
    title: '[MYTHUATCMC] Bút gôm bấm (có sẵn 1 ruột)',
    image: '/assets/cmc/vn-11134207-820l4-mif59vb1ea6gb7@resize_w450_nl.webp',
    originalPrice: 36250,
    salePrice: 29000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-B%C3%BAt-g%C3%B4m-b%E1%BA%A5m-(c%C3%B3-s%E1%BA%B5n-1-ru%E1%BB%99t)-i.1704932744.47553314504?extraParams=%7B%22display_model_id%22%3A365317281588%7D',
  },
  {
    id: '6',
    title: '[MYTHUATCMC] Chì Tiệp vàng KOH (lẻ)',
    image: '/assets/cmc/vn-11134207-820l4-mif5bxxj5ssm67@resize_w450_nl.webp',
    originalPrice: 18750,
    salePrice: 15000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-Ch%C3%AC-Ti%E1%BB%87p-v%C3%A0ng-KOH-(l%E1%BA%BB)-i.1704932744.48353314613?extraParams=%7B%22display_model_id%22%3A425317281684%7D',
  },
  {
    id: '7',
    title: '[MYTHUATCMC] Cặp đựng/Túi đựng giấy a3',
    image: '/assets/cmc/vn-11134207-820l4-mif5epe88dtt46@resize_w450_nl.webp',
    originalPrice: 106250,
    salePrice: 85000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-C%E1%BA%B7p-%C4%91%E1%BB%B1ng-T%C3%BAi-%C4%91%E1%BB%B1ng-gi%E1%BA%A5y-a3-i.1704932744.58103298631?extraParams=%7B%22display_model_id%22%3A355317286964%7D',
  },
  {
    id: '8',
    title: '[MYTHUATCMC] Dao rọc giấy SDI 0423 lớn/nhỏ',
    image: '/assets/cmc/vn-11134207-820l4-mif5ibg39f5y94@resize_w450_nl.webp',
    originalPrice: 18750,
    salePrice: 15000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-Dao-r%E1%BB%8Dc-gi%E1%BA%A5y-SDI-0423-l%E1%BB%9Bn-nh%E1%BB%8F-i.1704932744.27493833837?extraParams=%7B%22display_model_id%22%3A340318147570%7D',
  },
  {
    id: '9',
    title: '[MYTHUATCMC] Gom Đen Hàn Quốc',
    image: '/assets/cmc/vn-11134207-820l4-mif5lgo5eex02b@resize_w450_nl.webp',
    originalPrice: 18750,
    salePrice: 15000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-Gom-%C4%90en-H%C3%A0n-Qu%E1%BB%91c-i.1704932744.55553294415?extraParams=%7B%22display_model_id%22%3A249122337592%7D',
  },
  {
    id: '10',
    title: '[Mỹ thuật CMC] Hộp màu poster pentel 12 lọ thuỷ tinh',
    image: '/assets/cmc/vn-11134207-820l4-mif5t07qgs1y0e@resize_w450_nl.webp',
    originalPrice: 568750,
    salePrice: 455000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-M%E1%BB%B9-thu%E1%BA%ADt-CMC-H%E1%BB%99p-m%C3%A0u-poster-pentel-12-l%E1%BB%8D-thu%E1%BB%B7-tinh-i.1704932744.52303294361?extraParams=%7B%22display_model_id%22%3A380317303495%7D',
  },
  {
    id: '11',
    title: '[MYTHUATCMC] Thước Dẻo 20cm WinQ',
    image: '/assets/cmc/vn-11134207-820l4-mif5zqpjasxs0d@resize_w450_nl.webp',
    originalPrice: 8750,
    salePrice: 7000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-Th%C6%B0%E1%BB%9Bc-D%E1%BA%BBo-20cm-WinQ-i.1704932744.53653300088?extraParams=%7B%22display_model_id%22%3A440317304567%7D',
  },
  {
    id: '12',
    title: '[MYTHUATCMC] Compa học sinh Maped - chì bấm (giao màu ngẫu nhiên)',
    image: '/assets/cmc/vn-11134207-820l4-mif628iehtz740@resize_w450_nl.webp',
    originalPrice: 73750,
    salePrice: 59000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-Compa-h%E1%BB%8Dc-sinh-Maped-ch%C3%AC-b%E1%BA%A5m-(giao-m%C3%A0u-ng%E1%BA%ABu-nhi%C3%AAn)-i.1704932744.54753305160?extraParams=%7B%22display_model_id%22%3A310317894829%7D',
  },
  {
    id: '13',
    title: '[Mỹ thuật CMC] Combo Hoạ cụ Chì',
    image: '/assets/cmc/vn-11134207-820l4-mif65sriww088a@resize_w450_nl.webp',
    originalPrice: 493750,
    salePrice: 395000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-M%E1%BB%B9-thu%E1%BA%ADt-CMC-Combo-Ho%E1%BA%A1-c%E1%BB%A5-Ch%C3%AC-i.1704932744.46253314854?extraParams=%7B%22display_model_id%22%3A365317313920%7D',
  },
  {
    id: '14',
    title: '[MYTHUATCMC] Kẹp Giấy',
    image: '/assets/cmc/vn-11134207-820l4-mifeirlagydd1b@resize_w450_nl.webp',
    originalPrice: 210000,
    salePrice: 168000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-K%E1%BA%B9p-Gi%E1%BA%A5y-i.1704932744.46353332714?extraParams=%7B%22display_model_id%22%3A287267237595%7D',
  },
  {
    id: '15',
    title: '[MYTHUATCMC] Bay pha màu',
    image: '/assets/cmc/vn-11134207-820l4-mifl04xsba4o6b@resize_w450_nl.webp',
    originalPrice: 25000,
    salePrice: 20000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-Bay-pha-m%C3%A0u-i.1704932744.47503322720?extraParams=%7B%22display_model_id%22%3A277267195301%7D',
  },
  {
    id: '16',
    title: '[MYTHUATCMC] Tẩy đất sét / Gôm đất sét',
    image: '/assets/cmc/3.jpg',
    originalPrice: 18750,
    salePrice: 15000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-T%E1%BA%A9y-%C4%91%E1%BA%A5t-s%C3%A9t-G%C3%B4m-%C4%91%E1%BA%A5t-s%C3%A9t-i.1704932744.56753302654?extraParams=%7B%22display_model_id%22%3A350318182249%7D',
  },
  {
    id: '17',
    title: '[MYTHUATCMC] Bảng vẽ A3',
    image: '/assets/cmc/download (2).jpg',
    originalPrice: 28750,
    salePrice: 23000,
    discount: 20,
    badge: 'BEST SELLER',
    brand: 'CMC',
    shopeeUrl: 'https://shopee.vn/-MYTHUATCMC-B%E1%BA%A3ng-v%E1%BA%BD-A3-i.1704932744.47203345460?extraParams=%7B%22display_model_id%22%3A320319309487%7D',
  },
] as const
