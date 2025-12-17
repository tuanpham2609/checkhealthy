/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import path from 'node:path'
import type { ComputedFields } from 'contentlayer2/source-files'
import { defineDocumentType, makeSource } from 'contentlayer2/source-files'
import { slug } from 'github-slugger'
import readingTime from 'reading-time'
import rehypeCitation from 'rehype-citation'
import rehypePresetMinify from 'rehype-preset-minify'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import remarkExternalLinks from 'remark-external-links'
import { remarkAlert } from 'remark-github-blockquote-alert'

const root = process.cwd()

// Extract TOC headings from markdown
// This function mimics rehype-slug's ID generation logic to ensure TOC URLs match actual heading IDs
async function extractTocHeadings(content: string) {
  const { remark } = await import('remark')
  const { toString } = await import('mdast-util-to-string')
  const { visit } = await import('unist-util-visit')

  const allHeadings: Array<{ text: string; depth: number }> = []
  const usedIds = new Set<string>()
  const toc: Array<{ url: string; text: string; depth: number }> = []

  // First pass: collect all headings
  await remark()
    .use(() => (tree) => {
      visit(tree, 'heading', (node: any) => {
        const textContent = toString(node).replace(/<[^>]*(>|$)/g, '')
        if (textContent) {
          allHeadings.push({
            text: textContent,
            depth: node.depth,
          })
        }
      })
    })
    .process(content)

  // Second pass: generate IDs with duplicate detection (matching rehype-slug behavior)
  for (const heading of allHeadings) {
    const baseId = slug(heading.text)
    let finalId = baseId
    let counter = 0

    // If ID already exists, add suffix -1, -2, etc. (same as rehype-slug)
    while (usedIds.has(finalId)) {
      counter++
      finalId = `${baseId}-${counter}`
    }

    usedIds.add(finalId)

    // Only include h1 and h2 in TOC (depth <= 2)
    if (heading.depth <= 2) {
      toc.push({
        url: `#${finalId}`,
        text: heading.text,
        depth: heading.depth,
      })
    }
  }

  return toc
}

const computedFields: ComputedFields = {
  readingTime: { type: 'json', resolve: (doc) => readingTime(doc.body.raw) },
  lang: {
    type: 'string',
    resolve: (doc) => {
      // Extract language from flattenedPath: en/features/miner -> 'en'
      // flattenedPath format: {lang}/{category}/{slug}
      const pathParts = doc._raw.flattenedPath.split('/')
      return pathParts[0] || 'en'
    },
  },
  slug: {
    type: 'string',
    resolve: (doc) => {
      // Extract slug from flattened path: en/features/miner -> 'miner'
      const pathParts = doc._raw.flattenedPath.split('/')
      // Remove language and category, get the last part
      if (pathParts.length >= 3) {
        return pathParts[pathParts.length - 1]
      }
      return pathParts[pathParts.length - 1] || ''
    },
  },
  path: {
    type: 'string',
    resolve: (doc) => {
      // Return path without language: features/miner
      const pathParts = doc._raw.flattenedPath.split('/')
      if (pathParts.length >= 3) {
        return pathParts.slice(1).join('/')
      }
      return doc._raw.flattenedPath
    },
  },
  toc: {
    type: 'json',
    resolve: async (doc) => {
      // extractTocHeadings already filters to depth <= 2
      return await extractTocHeadings(doc.body.raw)
    },
  },
}

export const Feature = defineDocumentType(() => ({
  name: 'Feature',
  filePathPattern: '**/features/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string' },
    date: { type: 'date' },
    category: { type: 'string', default: 'features' },
  },
  computedFields: {
    ...computedFields,
  },
}))

export const About = defineDocumentType(() => ({
  name: 'About',
  filePathPattern: '**/about/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string' },
    date: { type: 'date' },
    category: { type: 'string', default: 'about' },
  },
  computedFields: {
    ...computedFields,
  },
}))

export default makeSource({
  contentDirPath: 'src/content',
  documentTypes: [Feature, About],
  disableImportAliasWarning: true,
  mdx: {
    cwd: process.cwd(),
    remarkPlugins: [
      remarkGfm,
      remarkSlug as any,
      remarkAlert,
      [
        remarkExternalLinks as any,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        },
      ],
    ],
    rehypePlugins: [
      rehypeSlug,
      // Disable rehype-autolink-headings as we handle anchor links in MDX components
      // We use custom HeadingAnchor component instead to avoid duplicate # symbols
      // [
      //   rehypeAutolinkHeadings,
      //   {
      //     behavior: 'prepend',
      //     headingProperties: {
      //       className: ['hover:[&_.heading-anchor]:opacity-100'],
      //     },
      //     content: icon,
      //   },
      // ],
      [rehypeCitation, { path: path.join(root, 'data') }],
      rehypePresetMinify,
    ],
  },
  onSuccess: async () => {
    console.info('✨ Content source generated successfully!')
  },
})
