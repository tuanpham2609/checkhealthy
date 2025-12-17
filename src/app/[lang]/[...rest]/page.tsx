/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { allFeatures, allAbouts } from 'contentlayer/generated'
import { MdxLayoutRenderer } from '@/components/molecules/mdx-layout-renderer'
import MdxLayout from '@/components/templates/mdx-layout'
import { initLingui } from '@/i18n/initLingui'
import type { ContentType } from '@/types/content.types'
import { genPageMetadata } from '@/lib/seo'

interface DynamicPageParams {
  params: Promise<{ lang: string; rest: string[] }>
}

// Constants - valid locales (excluding pseudo locale)
const VALID_LOCALES = ['ar', 'en', 'es', 'fi', 'fr', 'pt', 'zh-hans', 'zh-hant']
const EXCLUDED_PATHS = ['.well-known']

/**
 * Create lookup maps for efficient content retrieval
 * Key format: "{type}:{lang}:{slug}" e.g., "features:en:miner"
 */
const featuresMap = new Map(allFeatures.map((f) => [`features:${f.lang}:${f.slug}`, f]))

const aboutsMap = new Map(allAbouts.map((a) => [`about:${a.lang}:${a.slug}`, a]))

/**
 * Find content by language and path segments
 * Returns the matching feature or about document, or undefined if not found
 * Uses Map lookup for O(1) performance instead of O(n) array.find()
 */
function findContentByPath(lang: string, rest: string[]) {
  if (rest[0] === 'features' && rest.length > 1) {
    return featuresMap.get(`features:${lang}:${rest[1]}`)
  }
  if (rest[0] === 'about' && rest.length > 1) {
    return aboutsMap.get(`about:${lang}:${rest[1]}`)
  }
  return undefined
}

/**
 * Generate static params for all MDX content files
 */
export async function generateStaticParams() {
  const allParams: Array<{ lang: string; rest: string[] }> = []

  // Add features
  for (const feature of allFeatures) {
    allParams.push({
      lang: feature.lang,
      rest: ['features', feature.slug],
    })
  }

  // Add about docs
  for (const about of allAbouts) {
    allParams.push({
      lang: about.lang,
      rest: ['about', about.slug],
    })
  }

  return allParams
}

/**
 * Validate if route should be handled
 */
function shouldHandleRoute(lang: string, rest: string[]): boolean {
  if (!VALID_LOCALES.includes(lang)) return false

  const firstSegment = rest[0] || ''
  if (EXCLUDED_PATHS.some((path) => firstSegment.startsWith(path))) return false

  // RSS feeds are served as static files from public/feeds/
  // Skip any feed-related paths (legacy support)
  if (firstSegment === 'feed.xml' || firstSegment.startsWith('feed-')) return false

  return true
}

/**
 * Generate metadata for the page based on content frontmatter
 */
export async function generateMetadata({ params }: DynamicPageParams): Promise<Metadata> {
  const { lang, rest } = await params

  if (!shouldHandleRoute(lang, rest)) {
    return genPageMetadata({
      title: 'TBC Wallet',
      description: 'TBC Wallet documentation and content',
      lang: 'en',
      path: '',
    })
  }

  try {
    initLingui(lang)
    const pathString = rest.join('/')
    const contentType = getContentType(rest)

    // Find content from contentlayer
    const content = findContentByPath(lang, rest)

    if (content) {
      return genPageMetadata({
        title: content.title || pathString,
        description: content.description || 'TBC Wallet documentation and content',
        lang,
        path: pathString,
        date: content.date,
        type: contentType === 'features' ? 'article' : 'website',
      })
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return genPageMetadata({
    title: 'TBC Wallet',
    description: 'TBC Wallet documentation and content',
    lang: VALID_LOCALES.includes(lang) ? lang : 'en',
    path: rest.join('/'),
  })
}

/**
 * Determine content type from path segments
 */
function getContentType(segments: readonly string[]): ContentType {
  if (segments[0] === 'about') {
    return 'about'
  }
  if (segments[0] === 'features') {
    return 'features'
  }
  return 'features'
}

/**
 * Dynamic page handler for all MDX content
 * Maps URL path to content directory structure:
 * /en/about/privacy-policy -> src/content/en/about/privacy-policy.mdx
 */
export default async function DynamicContentPage({ params }: DynamicPageParams) {
  const { lang, rest } = await params

  // Early return for invalid routes
  if (!rest || rest.length === 0 || !shouldHandleRoute(lang, rest)) {
    notFound()
  }

  initLingui(lang)

  // Find content from contentlayer
  const content = findContentByPath(lang, rest)

  if (!content) {
    notFound()
  }

  const contentType = getContentType(rest)
  const headings = (content.toc as Array<{ url: string; text: string; depth: number }>) || []

  return (
    <MdxLayout type={contentType} title={content.title} category={content.category || rest[0]} headings={headings}>
      <MdxLayoutRenderer code={content.body.code} toc={headings} />
    </MdxLayout>
  )
}
