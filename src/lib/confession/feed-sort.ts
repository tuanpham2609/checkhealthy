/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

export const CONFESSION_SORT_VALUES = ['newest', 'oldest', 'likes'] as const
export type ConfessionSort = (typeof CONFESSION_SORT_VALUES)[number]

export function parseConfessionSort(raw: string | null): ConfessionSort {
  if (raw && CONFESSION_SORT_VALUES.includes(raw as ConfessionSort)) {
    return raw as ConfessionSort
  }
  return 'newest'
}

/** Escape `%`, `_`, `\` cho pattern `ilike` (PostgreSQL) */
export function escapeIlikePattern(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}
