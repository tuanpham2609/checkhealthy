/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

export const schedKeys = {
  all: ['scheduling'] as const,
  lists: () => [...schedKeys.all, 'list'] as const,
  context: (id: string) => [...schedKeys.all, 'context', id] as const,
}
