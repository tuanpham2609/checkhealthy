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
    title: 'Phủ Bóng Acrylic MONT MARTE chống nước (Gloss/Matte) phủ lì trên canvas, gỗ, vải',
    image: '/assets/images/products/acrylic-medium.svg',
    originalPrice: 63000,
    salePrice: 50400,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
  {
    id: '2',
    title: 'Bộ màu Nước Nén LENINGRAD (tặng hộp gỗ Nâu) - 24 Màu',
    image: '/assets/images/products/watercolor-leningrad.svg',
    originalPrice: 966800,
    salePrice: 773440,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
  {
    id: '3',
    title: 'Bìa kiếng màu, bìa kính mô hình kiến trúc, nội thất, đô thị, sa bàn',
    image: '/assets/images/products/colored-sheets.svg',
    originalPrice: 8200,
    salePrice: 6560,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
  {
    id: '4',
    title: 'Bút marker TOUCHLIIT 6 (tông Xám) diễn họa kiến trúc, đô thị, đồ án nội thất',
    image: '/assets/images/products/marker-gray.svg',
    originalPrice: 15000,
    salePrice: 12000,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
  {
    id: '5',
    title: 'Cọ vẽ đầu tròn HAND (ZBS2), ARTPOWER (ZBS2) học vẽ trang trí, màu nước',
    image: '/assets/images/products/round-brushes.svg',
    originalPrice: 37200,
    salePrice: 29760,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
  {
    id: '6',
    title: 'Bút chì phác thảo KOH I NOOR vẽ người, đầu tượng, tĩnh vật, luyện thi',
    image: '/assets/images/products/sketch-pencils.svg',
    originalPrice: 16000,
    salePrice: 12800,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
  {
    id: '7',
    title: 'Màu vẽ Acrylic MONT MARTE (Nhũ/Vàng/Bạc) custom áo, vải, gỗ, canvas',
    image: '/assets/images/products/metallic-acrylic.svg',
    originalPrice: 26000,
    salePrice: 20800,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
  {
    id: '8',
    title: 'Bút marker TOUCHLIIT 6 (số 0~120) diễn họa kiến trúc, đô thị, đồ án nội thất',
    image: '/assets/images/products/marker-set.svg',
    originalPrice: 15000,
    salePrice: 12000,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
  {
    id: '9',
    title: 'Canvas vẽ chuyên nghiệp MONT MARTE - Bộ 5 tấm (30x40cm)',
    image: '/assets/images/products/placeholder.svg',
    originalPrice: 185000,
    salePrice: 148000,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
  {
    id: '10',
    title: 'Bộ màu dầu WINSOR & NEWTON - 12 màu cơ bản cho người mới bắt đầu',
    image: '/assets/images/products/placeholder.svg',
    originalPrice: 1250000,
    salePrice: 1000000,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
  {
    id: '11',
    title: 'Giấy vẽ Canson A4 - 180gsm, 50 tờ, phù hợp màu nước và màu chì',
    image: '/assets/images/products/placeholder.svg',
    originalPrice: 95000,
    salePrice: 76000,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
  {
    id: '12',
    title: 'Bộ cọ vẽ chuyên nghiệp - 12 cây, đa dạng kích thước và hình dạng',
    image: '/assets/images/products/placeholder.svg',
    originalPrice: 320000,
    salePrice: 256000,
    discount: 20,
    badge: 'THÁNG 12 BEST SELLER',
    brand: 'ARTDOOR',
  },
] as const
