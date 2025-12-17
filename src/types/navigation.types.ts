/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import type { MessageDescriptor } from '@lingui/core'

export interface NavItem {
  readonly id: string
  readonly href: string
  readonly title: MessageDescriptor
  readonly description: MessageDescriptor
}

export interface NavSection {
  readonly id: string
  readonly title: MessageDescriptor
  readonly items: readonly NavItem[]
}

export type Navigation = readonly NavSection[]
