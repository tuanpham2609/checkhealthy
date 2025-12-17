/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { SITE_METADATA } from '../src/constants/site-metadata.constants'
import { escape } from '../src/lib/utils/content/html-escaper'

const LOCALES = ['ar', 'en', 'es', 'fi', 'fr', 'pt', 'zh-hans', 'zh-hant'] as const
const FEEDS_DIR = 'feeds'
const OUTPUT_DIR = path.join(process.cwd(), 'public', FEEDS_DIR)

interface ContentItem {
  title: string
  description?: string
  slug: string
  lang: string
  date?: string
  category: string
  body: {
    raw: string
  }
  draft?: boolean
}

interface RssItem {
  title: string
  description: string
  url: string
  pubDate: string
  category: string
}

interface RssOptions {
  title: string
  link: string
  description: string
  language: string
  feedUrl: string
  lastBuildDate: string
}

/**
 * Load contentlayer data from JSON files
 * Uses synchronous file reading for better performance in build scripts
 * @returns Object containing all features and about documents
 * @throws Error if contentlayer data is not found
 */
function loadContentlayerData(): { allFeatures: ContentItem[]; allAbouts: ContentItem[] } {
  const contentlayerPath = path.join(process.cwd(), '.contentlayer', 'generated')

  try {
    // Load Feature data
    const featuresPath = path.join(contentlayerPath, 'Feature', '_index.json')
    const featuresData = JSON.parse(readFileSync(featuresPath, 'utf-8'))
    const allFeatures: ContentItem[] = Array.isArray(featuresData) ? featuresData : []

    // Load About data
    const aboutsPath = path.join(contentlayerPath, 'About', '_index.json')
    const aboutsData = JSON.parse(readFileSync(aboutsPath, 'utf-8'))
    const allAbouts: ContentItem[] = Array.isArray(aboutsData) ? aboutsData : []

    return { allFeatures, allAbouts }
  } catch (error) {
    console.error('❌ Error loading contentlayer data.', '\n')
    console.error('Please ensure contentlayer is built first: npm run contentlayer:build', '\n')
    console.error('Error:', error, '\n')
    throw new Error('Contentlayer generated files not found. Run: npm run contentlayer:build')
  }
}

/**
 * Extract description from content body or use fallback
 * Removes markdown formatting and limits to 200 characters
 * @param content - Raw markdown content
 * @param fallback - Fallback description if content is empty
 * @returns Extracted description
 */
function extractDescription(content: string, fallback?: string): string {
  if (!content) return fallback || ''
  const firstParagraph = content
    .split('\n\n')
    .find((para) => para.trim().length > 0)
    ?.replace(/[#*_`]/g, '')
    .substring(0, 200)
  return firstParagraph || fallback || ''
}

/**
 * Convert content item to RSS item
 * @param content - Content item from contentlayer
 * @param lang - Language code
 * @returns RSS item ready for XML generation
 */
function contentToRssItem(content: ContentItem, lang: string): RssItem {
  const category = (content.category || 'features').trim()
  const pathString = `${category}/${content.slug}`
  const url = `${SITE_METADATA.siteUrl}/${lang}/${pathString}`
  const pubDate = content.date ? new Date(content.date).toUTCString() : new Date().toUTCString()
  const description = extractDescription(content.body?.raw || '', content.description)

  return {
    title: content.title || content.slug,
    description: description || '',
    url,
    pubDate,
    category,
  }
}

/**
 * Sort RSS items by date (newest first)
 * @param items - Array of RSS items
 * @returns Sorted array of RSS items
 */
function sortRssItems(items: RssItem[]): RssItem[] {
  return [...items].sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0
    return dateB - dateA
  })
}

/**
 * Generate RSS item XML string
 * Optimized with template literals for better performance
 * @param item - RSS item to convert to XML
 * @returns XML string for RSS item
 */
function generateRssItem(item: RssItem): string {
  const { title, description, url, pubDate, category } = item
  const escapedTitle = escape(title)
  const escapedDescription = description ? escape(description) : ''
  const escapedCategory = escape(category)

  return `    <item>
      <guid isPermaLink="true">${url}</guid>
      <title>${escapedTitle}</title>
      <link>${url}</link>
      ${escapedDescription ? `<description>${escapedDescription}</description>` : ''}
      <pubDate>${pubDate}</pubDate>
      <category>${escapedCategory}</category>
    </item>`
}

/**
 * Generate complete RSS XML feed
 * @param items - Array of RSS items
 * @param options - RSS feed options
 * @returns Complete RSS XML string
 */
function generateRss(items: RssItem[], options: RssOptions): string {
  const { title, link, description, language, feedUrl, lastBuildDate } = options
  const { email, author } = SITE_METADATA

  // Pre-escape values to avoid repeated escaping
  const escapedTitle = escape(title)
  const escapedDescription = escape(description)

  // Generate items XML in batch
  const itemsXml = items.map(generateRssItem).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapedTitle}</title>
    <link>${link}</link>
    <description>${escapedDescription}</description>
    <language>${language}</language>
    <managingEditor>${email} (${author})</managingEditor>
    <webMaster>${email} (${author})</webMaster>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`
}

/**
 * Generate RSS feed for a specific locale
 * Uses Map for O(1) lookup performance instead of O(n) filtering
 * @param lang - Language code
 * @param contentMap - Map of content items keyed by language
 * @returns RSS XML string for the locale
 */
function generateFeedForLocale(lang: string, contentMap: Map<string, ContentItem[]>): string {
  const langContent = contentMap.get(lang) || []

  // Convert content to RSS items in batch
  const contentItems: RssItem[] = langContent.map((content) => contentToRssItem(content, lang))

  // Sort by date (newest first)
  const sortedItems = sortRssItems(contentItems)
  const lastBuildDate =
    sortedItems.length > 0 && sortedItems[0].pubDate ? sortedItems[0].pubDate : new Date().toUTCString()

  const feedUrl = `${SITE_METADATA.siteUrl}/${FEEDS_DIR}/${lang}.xml`

  return generateRss(sortedItems, {
    title: `${SITE_METADATA.title} - ${lang.toUpperCase()}`,
    link: `${SITE_METADATA.siteUrl}/${lang}`,
    description: SITE_METADATA.description,
    language: lang,
    feedUrl,
    lastBuildDate,
  })
}

/**
 * Build content map by language for O(1) lookup
 * Filters out draft content and groups by language
 * @param allFeatures - All feature content items
 * @param allAbouts - All about content items
 * @returns Map of content items grouped by language
 */
function buildContentMap(allFeatures: ContentItem[], allAbouts: ContentItem[]): Map<string, ContentItem[]> {
  const contentMap = new Map<string, ContentItem[]>()

  // Initialize map for all locales
  for (const lang of LOCALES) {
    contentMap.set(lang, [])
  }

  // Add features and abouts to map
  const allContent = [...allFeatures, ...allAbouts]
  for (const content of allContent) {
    if (content.draft) continue

    const lang = content.lang
    if (contentMap.has(lang)) {
      contentMap.get(lang)!.push(content)
    }
  }

  return contentMap
}

/**
 * Main function to generate all RSS feeds
 * Generates feeds into public/feeds/{lang}.xml for better organization
 * Uses batch processing and optimized data structures for performance
 */
export async function generateRssFeeds(): Promise<void> {
  console.info('🗒️ Generating RSS feeds...', '\n')

  // Load contentlayer data
  const { allFeatures, allAbouts } = loadContentlayerData()

  // Build content map for O(1) lookup
  const contentMap = buildContentMap(allFeatures, allAbouts)

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true })

  // Generate feeds for each locale in batch
  const feedPromises: Array<{ lang: string; content: string; path: string }> = []

  for (const lang of LOCALES) {
    const feedContent = generateFeedForLocale(lang, contentMap)
    const feedPath = path.join(OUTPUT_DIR, `${lang}.xml`)
    feedPromises.push({ lang, content: feedContent, path: feedPath })
  }

  // Batch write all files
  for (const { lang, content, path: feedPath } of feedPromises) {
    writeFileSync(feedPath, content, 'utf-8')
    console.info(`✅ Generated ${FEEDS_DIR}/${lang}.xml`, '\n')
  }
  console.info(`✅ Successfully generated ${feedPromises.length} RSS feed files in ${FEEDS_DIR}/`, '\n')
}

// Run if called directly
if (require.main === module) {
  generateRssFeeds().catch((error) => {
    console.error('❌ Error generating RSS feeds:', error, '\n')
    process.exit(1)
  })
}
