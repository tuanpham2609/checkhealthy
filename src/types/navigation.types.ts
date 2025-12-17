/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

export interface NavItem {
  readonly id: string
  readonly href: string
  readonly title: string
  readonly description: string
}

export interface NavSection {
  readonly id: string
  readonly title: string
  readonly items: readonly NavItem[]
}

export type Navigation = readonly NavSection[]
