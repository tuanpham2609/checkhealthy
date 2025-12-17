/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { MDXDocumentDate } from './contentlayer'

/**
 * Sort posts by date (newest first)
 * Returns a new sorted array without mutating the original
 */
export function sortPosts<T extends MDXDocumentDate>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })
}
