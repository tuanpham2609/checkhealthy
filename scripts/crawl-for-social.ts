/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 *
 * Tool crawl dữ liệu từ 1 URL để chuẩn bị đăng TikTok / Facebook.
 * Cách chạy: npx tsx scripts/crawl-for-social.ts <URL>
 * Ví dụ: npx tsx scripts/crawl-for-social.ts https://mythuatcmc.vn
 */

import { crawlUrl } from '../src/lib/utils/crawl'

const url = process.argv[2]

if (!url) {
  console.error('Cách dùng: npx tsx scripts/crawl-for-social.ts <URL>')
  console.error('Ví dụ: npx tsx scripts/crawl-for-social.ts https://mythuatcmc.vn')
  process.exit(1)
}

async function main() {
  try {
    const result = await crawlUrl(url)
    console.log(JSON.stringify(result, null, 2))
    console.log('\n--- Caption gợi ý (Facebook) ---\n')
    console.log(result.suggestedCaptionFacebook)
    console.log('\n--- Caption gợi ý (TikTok) ---\n')
    console.log(result.suggestedCaptionTikTok)
  } catch (err) {
    console.error('Lỗi:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

main()
