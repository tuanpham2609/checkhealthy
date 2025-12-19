# Cải Tiến SEO cho Mỹ Thuật CMC

## Tổng Quan

Đã thực hiện các cải tiến SEO toàn diện để tối ưu hóa website cho công cụ tìm kiếm, đặc biệt tập trung vào sản phẩm và link Shopee.

## Các Cải Tiến Đã Thực Hiện

### 1. Structured Data (JSON-LD Schema)

#### Product Schema
- **File**: `src/components/atoms/structured-data/product-schema.tsx`
- **Mục đích**: Giúp Google hiểu thông tin sản phẩm (tên, giá, hình ảnh, link Shopee)
- **Bao gồm**:
  - Product information
  - Offer với giá và link Shopee
  - Brand information
  - Aggregate rating
  - Availability status

#### Organization Schema
- **File**: `src/components/atoms/structured-data/organization-schema.tsx`
- **Mục đích**: Xác định thông tin doanh nghiệp
- **Bao gồm**:
  - Company name, logo, description
  - Contact information
  - Social media links (Facebook, Instagram, TikTok, Shopee)

#### LocalBusiness Schema
- **File**: `src/components/atoms/structured-data/local-business-schema.tsx`
- **Mục đích**: Tối ưu cho tìm kiếm địa phương
- **Bao gồm**:
  - Store information
  - Opening hours
  - Address (có thể cấu hình)
  - Price range

#### ItemList Schema
- **File**: `src/components/atoms/structured-data/item-list-schema.tsx`
- **Mục đích**: Hiển thị danh sách sản phẩm trong kết quả tìm kiếm
- **Đã áp dụng**: Trang home với 17 sản phẩm bán chạy

#### Breadcrumb Schema
- **File**: `src/components/atoms/structured-data/breadcrumb-schema.tsx`
- **Mục đích**: Hiển thị breadcrumb trong kết quả tìm kiếm

### 2. Sitemap Optimization

- **File**: `src/app/sitemap.ts`
- **Cải tiến**:
  - Thêm các sản phẩm vào sitemap với priority cao (0.9)
  - Change frequency: weekly cho sản phẩm
  - Tự động cập nhật khi có sản phẩm mới

### 3. Robots.txt Enhancement

- **File**: `src/app/robots.ts`
- **Cải tiến**:
  - Tối ưu cho Googlebot và Bingbot
  - Cho phép crawl tất cả nội dung
  - Chặn các thư mục không cần thiết (/api/, /_next/, /admin/)

### 4. Metadata Optimization

#### Home Page
- **File**: `src/app/[lang]/page.tsx`
- **Cải tiến**:
  - Thêm keywords liên quan đến sản phẩm
  - Mô tả chi tiết hơn với mention Shopee
  - Inject structured data (Organization, LocalBusiness, ItemList)

#### SEO Helper
- **File**: `src/lib/seo.ts`
- **Cải tiến**:
  - Thêm support cho keywords
  - Tối ưu Open Graph tags
  - Tối ưu Twitter Cards
  - Robots meta tags với Googlebot settings

### 5. Site Metadata

- **File**: `src/constants/site-metadata.constants.ts`
- **Cập nhật**:
  - Description chi tiết hơn với mention Shopee
  - Cập nhật siteUrl mặc định
  - Cập nhật social links

## Cách Sử Dụng

### Thêm Structured Data cho Sản Phẩm

```tsx
import { ProductSchema } from '@/components/atoms/structured-data'

<ProductSchema product={product} />
```

### Thêm Breadcrumb

```tsx
import { BreadcrumbSchema } from '@/components/atoms/structured-data'

<BreadcrumbSchema 
  items={[
    { name: 'Trang chủ', url: '/' },
    { name: 'Sản phẩm', url: '/products' },
  ]} 
/>
```

## Lợi Ích SEO

1. **Rich Snippets**: Sản phẩm có thể hiển thị với giá, rating, và link Shopee trong kết quả tìm kiếm
2. **Better Indexing**: Structured data giúp Google hiểu rõ hơn về nội dung
3. **Local SEO**: LocalBusiness schema giúp tối ưu cho tìm kiếm địa phương
4. **Product Discovery**: ItemList schema giúp hiển thị nhiều sản phẩm trong một kết quả
5. **Social Sharing**: Open Graph và Twitter Cards tối ưu cho chia sẻ mạng xã hội

## Next Steps

1. **Google Search Console**: Submit sitemap và theo dõi performance
2. **Google Merchant Center**: Có thể submit sản phẩm nếu muốn hiển thị trong Google Shopping
3. **Content**: Thêm mô tả chi tiết hơn cho từng sản phẩm
4. **Images**: Đảm bảo tất cả hình ảnh có alt text và được optimize
5. **Internal Linking**: Tạo internal links giữa các sản phẩm liên quan

## Testing

Sử dụng các công cụ sau để test:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- [Google Search Console](https://search.google.com/search-console)
