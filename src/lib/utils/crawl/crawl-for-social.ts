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
  /** True nếu URL crawl là X (Twitter) — tải ảnh full (contain) cho đẹp. */
  isFromX?: boolean
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

/** Từ stop (bỏ qua khi tạo hashtag) */
const STOP_WORDS = new Set(
  (
    'và của để trong trên với cho về từ là có được tại các này đó the a an for in on at by to of with from as is are was were be been have has had do does did will would can could may might must shall should'
  ).split(/\s+/)
)

/**
 * Bỏ dấu tiếng Việt (đơn giản) để tạo hashtag gọn.
 */
function removeVietnameseTone(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

/**
 * Sinh hashtag từ chủ đề bài (title + description), không dùng cứng.
 * Lấy từ khóa chính, bỏ dấu, ghép tối đa MAX_HASHTAGS hashtag.
 */
const MAX_HASHTAGS = 5
const MIN_WORD_LENGTH = 2

function generateHashtagsFromContent(title: string, description: string): string {
  const text = `${title || ''} ${description || ''}`.toLowerCase()
  const words = text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w) && !/^\d+$/.test(w))
  const seen = new Set<string>()
  const tags: string[] = []
  for (const w of words) {
    if (tags.length >= MAX_HASHTAGS) break
    const normalized = removeVietnameseTone(w)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    tags.push('#' + normalized)
  }
  return tags.join(' ')
}

/**
 * Tạo caption Facebook và TikTok từ title, description và URL.
 * Dùng sau khi dịch nội dung sang tiếng Việt để cập nhật caption gợi ý.
 */
export function buildSuggestedCaptions(
  title: string,
  description: string,
  url: string
): { suggestedCaptionFacebook: string; suggestedCaptionTikTok: string } {
  const linkLine = url || ''
  const suggestedCaptionFacebook = [title, description, linkLine].filter(Boolean).join('\n\n')
  const shortDesc = truncate(description, TIKTOK_CAPTION_MAX)
  const hashtags = generateHashtagsFromContent(title, description)
  const suggestedCaptionTikTok = [title, shortDesc, linkLine, hashtags].filter(Boolean).join('\n')
  return {
    suggestedCaptionFacebook: truncate(suggestedCaptionFacebook, FACEBOOK_CAPTION_MAX * 2),
    suggestedCaptionTikTok,
  }
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

/** User-Agent cho Facebook crawler — Meta có thể trả og meta khi nhận bot. */
const FACEBOOK_CRAWLER_UA =
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
/** User-Agent cho X (Twitter) — có thể trả twitter/og meta cho preview. */
const TWITTER_CRAWLER_UA = 'Twitterbot/1.0'

function isFacebookUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return (
      host === 'facebook.com' ||
      host === 'www.facebook.com' ||
      host === 'fb.com' ||
      host === 'www.fb.com' ||
      host === 'fb.watch' ||
      host === 'www.fb.watch' ||
      host === 'm.facebook.com' ||
      host === 'fb.me'
    )
  } catch {
    return false
  }
}

function isXOrTwitterUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === 'twitter.com' || host === 'www.twitter.com' || host === 'x.com' || host === 'www.x.com'
  } catch {
    return false
  }
}

/** Trên Vercel, request tới X (Twitter) thường bị chặn. */
function isVercel(): boolean {
  return process.env.VERCEL === '1'
}

/** Trích tweet ID từ URL X/Twitter (ví dụ .../status/1234567890). */
function extractTweetId(url: string): string | null {
  try {
    const path = new URL(url).pathname
    const m = path.match(/\/status\/(\d+)/i)
    return m ? m[1] : null
  } catch {
    return null
  }
}

/**
 * Lấy URL ảnh đầu tiên của tweet từ Syndication API (hoạt động trên Vercel, không cần auth).
 */
async function fetchXTweetImageUrl(tweetId: string): Promise<string | null> {
  try {
    const url = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&lang=en`
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 8000)
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: ac.signal })
    clearTimeout(t)
    if (!res.ok) return null
    const data = (await res.json()) as Record<string, unknown>
    const photos = data?.photos as Array<{ url?: string }> | undefined
    if (Array.isArray(photos) && photos.length > 0 && photos[0]?.url) {
      return String(photos[0].url)
    }
    const entities = data?.entities as { media?: Array<{ media_url_https?: string }> } | undefined
    const media = entities?.media ?? (data?.extended_entities as { media?: Array<{ media_url_https?: string }> } | undefined)?.media
    if (Array.isArray(media) && media.length > 0 && media[0]?.media_url_https) {
      return String(media[0].media_url_https)
    }
    return null
  } catch {
    return null
  }
}

/**
 * Fallback khi crawl X trên Vercel: dùng oEmbed API (không cần auth, ít bị chặn).
 * Trả về CrawlResult hoặc null nếu oEmbed lỗi.
 * Cố lấy ảnh từ Syndication API để hiển thị trên Vercel.
 */
async function tryXOEmbed(normalizedUrl: string): Promise<CrawlResult | null> {
  try {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(normalizedUrl)}`
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 10000)
    const res = await fetch(oembedUrl, {
      headers: { Accept: 'application/json' },
      signal: ac.signal,
    })
    clearTimeout(t)
    if (!res.ok) return null
    const data = (await res.json()) as { author_name?: string; html?: string; title?: string }
    const author = typeof data.author_name === 'string' ? data.author_name.trim() : ''
    const html = typeof data.html === 'string' ? data.html : ''
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const title = typeof data.title === 'string' && data.title.trim() ? data.title.trim() : author ? `Tweet từ ${author}` : 'X (Twitter)'
    const description = truncate(text || title, MAX_DESCRIPTION_LENGTH)
    const captions = buildSuggestedCaptions(title, description, normalizedUrl)
    let imageUrl = ''
    const tweetId = extractTweetId(normalizedUrl)
    if (tweetId) {
      const img = await fetchXTweetImageUrl(tweetId)
      if (img) imageUrl = img
    }
    return {
      url: normalizedUrl,
      title,
      description,
      imageUrl,
      siteName: author || 'X',
      isFromX: true,
      suggestedCaptionFacebook: captions.suggestedCaptionFacebook,
      suggestedCaptionTikTok: captions.suggestedCaptionTikTok,
      raw: {},
    }
  } catch {
    return null
  }
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

  const isFb = isFacebookUrl(normalizedUrl)
  const isX = isXOrTwitterUrl(normalizedUrl)
  const onVercel = isVercel()

  if (isX && onVercel) {
    const oembedResult = await tryXOEmbed(normalizedUrl)
    if (oembedResult) return oembedResult
  }

  const headers: HeadersInit =
    isFb || isX
      ? {
          ...BROWSER_HEADERS,
          'User-Agent': isFb ? FACEBOOK_CRAWLER_UA : TWITTER_CRAWLER_UA,
        }
      : BROWSER_HEADERS

  let res: Response
  try {
    res = await fetch(normalizedUrl, {
      headers,
      redirect: 'follow',
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if (isX && onVercel) {
      const fallback = await tryXOEmbed(normalizedUrl)
      if (fallback) return fallback
      throw new Error(
        'Link X (Twitter) không crawl được trên server Vercel (bị chặn). Hãy chạy app tại máy (yarn dev) để crawl link X, hoặc copy nội dung/ảnh tay.'
      )
    }
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
    if (isX && onVercel) {
      const fallback = await tryXOEmbed(normalizedUrl)
      if (fallback) return fallback
      throw new Error(
        'Link X (Twitter) không crawl được trên server Vercel (bị chặn). Hãy chạy app tại máy (yarn dev) để crawl link X, hoặc copy nội dung/ảnh tay.'
      )
    }
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

  const genericTitles = new Set([
    'facebook',
    'log in to facebook',
    'facebook - log in or sign up',
    'x',
    'twitter',
    'twitter - it\'s what\'s happening',
  ])
  const titleLower = title.toLowerCase().trim()
  if ((isFb || isX) && (genericTitles.has(titleLower) || titleLower.length < 5)) {
    if (isX && onVercel) {
      const fallback = await tryXOEmbed(normalizedUrl)
      if (fallback) return fallback
      throw new Error(
        'Link X (Twitter) không crawl được trên server Vercel (bị chặn). Hãy chạy app tại máy (yarn dev) để crawl link X, hoặc copy nội dung/ảnh tay.'
      )
    }
    const platform = isFb ? 'Facebook' : 'X (Twitter)'
    throw new Error(
      `Không lấy được nội dung bài viết từ ${platform}. Trang thường chặn bot hoặc yêu cầu đăng nhập. Bạn có thể: (1) Copy nội dung và ảnh từ bài gốc rồi dán vào caption, hoặc (2) Nếu bài share link báo khác, hãy dán link bài báo gốc để crawl.`
    )
  }

  const linkLine = canonicalUrl
  const suggestedCaptionFacebook = [
    title,
    description,
    linkLine,
  ]
    .filter(Boolean)
    .join('\n\n')

  const shortDesc = truncate(description, TIKTOK_CAPTION_MAX)
  const hashtags = generateHashtagsFromContent(title, description)
  const suggestedCaptionTikTok = [title, shortDesc, linkLine, hashtags].filter(Boolean).join('\n')

  return {
    url: canonicalUrl,
    title,
    description,
    imageUrl,
    siteName,
    isFromX: isX,
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
