/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { Document, MDX } from 'contentlayer2/core'

export type MDXDocument = Document & { body: MDX }

export type MDXDocumentDate = MDXDocument & {
  date: string
}

/**
 * Omit body, _raw, _id from MDX document and return only the core content
 */
export function coreContent<T extends MDXDocument>(content: T): Omit<T, 'body' | '_raw' | '_id'> {
  const { body, _raw, _id, ...rest } = content
  return rest
}

/**
 * Omit body, _raw, _id from a list of MDX documents and returns only the core content
 * If `NODE_ENV` === "production", it will also filter out any documents with draft: true.
 */
export function allCoreContent<T extends MDXDocument>(contents: T[]): Array<Omit<T, 'body' | '_raw' | '_id'>> {
  const isProduction = process.env.NODE_ENV === 'production'
  const filtered = isProduction ? contents.filter((c) => !('draft' in c && c.draft === true)) : contents
  return filtered.map((c) => coreContent(c))
}
