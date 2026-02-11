/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import * as cheerio from 'cheerio'

export interface CrawlResult {
  url: string
  title: string
  description: string
  imageUrl: string
  siteName: string
  /** Đoạn text gợi ý để đăng Facebook (có thể copy dán) */
  suggestedCaptionFacebook: string
  /** Đoạn text gợi ý để đăng TikTok (ngắn hơn, có hashtag) */
  suggestedCaptionTikTok: string
  /** Raw Open Graph / Twitter Card nếu cần */
  raw: {
    ogTitle?: string
    ogDescription?: string
    ogImage?: string
    ogUrl?: string
    twitterTitle?: string
    twitterDescription?: string
    twitterImage?: string
  }
}

const MAX_DESCRIPTION_LENGTH = 200
const TIKTOK_CAPTION_MAX = 150
const FACEBOOK_CAPTION_MAX = 500

/**
 * Resolve URL tương đối thành absolute
 */
function resolveUrl(baseUrl: string, href: string | undefined): string {
  if (!href || href.startsWith('data:')) return ''
  try {
    return new URL(href, baseUrl).href
  } catch {
    return ''
  }
}

/**
 * Rút gọn text cho caption (bỏ xuống dòng, trim, giới hạn độ dài)
 */
function truncate(text: string, maxLen: number): string {
  const oneLine = text.replace(/\s+/g, ' ').trim()
  if (oneLine.length <= maxLen) return oneLine
  return oneLine.slice(0, maxLen - 3) + '...'
}

/** Headers giống trình duyệt để hạn chế bị chặn (ví dụ BBC, báo) */
const BROWSER_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
}

interface JsonLdArticle {
  '@type'?: string
  headline?: string
  description?: string
  image?: string | { url?: string } | Array<string | { url?: string }>
  name?: string
  url?: string
}

/**
 * Trích title, description, image từ JSON-LD (Article/NewsArticle) trong trang.
 * Nhiều site tin tức (BBC, VnExpress...) dùng schema.org trong script type="application/ld+json".
 */
function extractFromJsonLd(html: string, baseUrl: string): Partial<{ title: string; description: string; imageUrl: string }> {
  const out: Partial<{ title: string; description: string; imageUrl: string }> = {}
  const ldJsonMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  if (!ldJsonMatch) return out

  for (const block of ldJsonMatch) {
    const inner = block.replace(/<script[^>]*>([\s\S]*)<\/script>/i, '$1').trim()
    let data: JsonLdArticle | JsonLdArticle[] | null = null
    try {
      data = JSON.parse(inner) as JsonLdArticle | JsonLdArticle[]
    } catch {
      continue
    }
    const items = Array.isArray(data) ? data : [data]
    for (const item of items) {
      const type = (item['@type'] || '').toLowerCase()
      if (type !== 'article' && type !== 'newsarticle' && type !== 'webpage') continue
      if (item.headline && !out.title) out.title = String(item.headline).trim()
      if (item.description && !out.description) out.description = String(item.description).trim()
      if (item.image && !out.imageUrl) {
        const img = item.image
        const url = typeof img === 'string' ? img : Array.isArray(img) ? (img[0] && (typeof img[0] === 'string' ? img[0] : img[0]?.url)) : img?.url
        if (url) out.imageUrl = resolveUrl(baseUrl, url)
      }
      if (out.title && out.description && out.imageUrl) return out
    }
  }
  return out
}

/**
 * Crawl một URL và trích xuất dữ liệu phù hợp để đăng TikTok / Facebook.
 * Dùng meta og:, twitter: và fallback title/description.
 */
export async function crawlUrl(inputUrl: string): Promise<CrawlResult> {
  const normalizedUrl = inputUrl.trim()
  if (!normalizedUrl) {
    throw new Error('URL không được để trống')
  }
  let parsed: URL
  try {
    parsed = new URL(normalizedUrl)
  } catch {
    throw new Error('URL không hợp lệ')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000)

  let res: Response
  try {
    res = await fetch(normalizedUrl, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error) {
      if (err.name === 'AbortError') throw new Error('Trang trả lời quá chậm, thử lại sau.')
      if (err.cause?.toString?.().includes('403') || err.message.includes('403')) {
        throw new Error('Trang web từ chối truy cập (403). Một số site như BBC có thể chặn công cụ crawl.')
      }
    }
    throw new Error('Không thể kết nối tới URL. Kiểm tra mạng hoặc thử link khác.')
  }
  clearTimeout(timeoutId)

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Trang web từ chối truy cập (403). Một số site như BBC có thể chặn công cụ crawl.')
    }
    throw new Error(`Không thể tải trang: ${res.status} ${res.statusText}`)
  }

  const html = await res.text()
  const $ = cheerio.load(html)
  const baseUrl = res.url || normalizedUrl

  const getMeta = (selector: string) => $(selector).attr('content')?.trim() || ''
  const getMetaProperty = (name: string) =>
    $(`meta[property="${name}"]`).attr('content')?.trim() ||
    $(`meta[name="${name}"]`).attr('content')?.trim() ||
    ''

  let ogTitle = getMetaProperty('og:title')
  let ogDescription = getMetaProperty('og:description')
  let ogImage = getMetaProperty('og:image')
  const ogUrl = getMetaProperty('og:url')
  const ogSiteName = getMetaProperty('og:site_name')

  const twitterTitle = getMeta('meta[name="twitter:title"]') || getMetaProperty('twitter:title')
  const twitterDescription =
    getMeta('meta[name="twitter:description"]') || getMetaProperty('twitter:description')
  const twitterImage = getMeta('meta[name="twitter:image"]') || getMetaProperty('twitter:image')

  const jsonLd = extractFromJsonLd(html, baseUrl)
  if (jsonLd.title && !ogTitle) ogTitle = jsonLd.title
  if (jsonLd.description && !ogDescription) ogDescription = jsonLd.description
  if (jsonLd.imageUrl && !ogImage) ogImage = jsonLd.imageUrl

  const titleTag = $('title').first().text().trim()
  const metaDesc = $('meta[name="description"]').attr('content')?.trim() || ''

  const title = ogTitle || twitterTitle || jsonLd.title || titleTag || parsed.hostname
  const description = truncate(
    ogDescription || twitterDescription || jsonLd.description || metaDesc || '',
    MAX_DESCRIPTION_LENGTH
  )
  const imageUrl = resolveUrl(baseUrl, ogImage || twitterImage) || jsonLd.imageUrl || ''
  const siteName = ogSiteName || parsed.hostname.replace(/^www\./, '')
  const canonicalUrl = ogUrl || baseUrl

  const linkLine = canonicalUrl
  const suggestedCaptionFacebook = [
    title,
    description,
    linkLine,
  ]
    .filter(Boolean)
    .join('\n\n')

  const shortDesc = truncate(description, TIKTOK_CAPTION_MAX)
  const suggestedCaptionTikTok = [title, shortDesc, linkLine, '#mythuatcmc #hoacu'].filter(Boolean).join('\n')

  return {
    url: canonicalUrl,
    title,
    description,
    imageUrl,
    siteName,
    suggestedCaptionFacebook: truncate(suggestedCaptionFacebook, FACEBOOK_CAPTION_MAX * 2),
    suggestedCaptionTikTok,
    raw: {
      ogTitle: ogTitle || undefined,
      ogDescription: ogDescription || undefined,
      ogImage: ogImage ? resolveUrl(baseUrl, ogImage) : undefined,
      ogUrl: ogUrl || undefined,
      twitterTitle: twitterTitle || undefined,
      twitterDescription: twitterDescription || undefined,
      twitterImage: twitterImage ? resolveUrl(baseUrl, twitterImage) : undefined,
    },
  }
}
