/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

export type ContentType = 'features' | 'about'

export interface TocHeading {
  readonly url: string
  readonly text: string
  readonly depth: number
}

// Legacy types - kept for backward compatibility if needed
// These are now replaced by contentlayer generated types
export interface ContentMetadata {
  readonly title: string
  readonly date?: string
  readonly description?: string
  readonly category?: string
}

export interface ContentPath {
  readonly lang: string
  readonly segments: readonly string[]
}

export interface ContentResult {
  readonly content: string
  readonly data: ContentMetadata
  readonly headings: readonly TocHeading[]
}

// Re-export contentlayer types for convenience
export type { MDXDocument } from '@/lib/utils/content/contentlayer'
