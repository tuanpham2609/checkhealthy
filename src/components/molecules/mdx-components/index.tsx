/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { MDXComponents } from 'mdx/types'
import { mdxHeadings } from './headings'
import { mdxText } from './text'
import { mdxLists } from './lists'
import { mdxCode } from './code'
import { mdxTables } from './tables'
import { mdxLinks } from './links'
import { mdxImage } from './image'

/**
 * MDX Components mapping for custom rendering
 * Used by contentlayer to render MDX content with custom components
 *
 * Components are organized by category:
 * - Headings: h1-h6 with anchor links (no # symbol)
 * - Text: paragraphs, blockquotes, horizontal rules, text formatting
 * - Lists: ordered and unordered lists
 * - Code: inline code and code blocks
 * - Tables: tables with responsive wrapper
 * - Links: external links with security attributes
 * - Images: images with zoom functionality
 */
export const MDX_COMPONENTS: MDXComponents = {
  ...mdxHeadings,
  ...mdxText,
  ...mdxLists,
  ...mdxCode,
  ...mdxTables,
  ...mdxLinks,
  ...mdxImage,
} as MDXComponents
