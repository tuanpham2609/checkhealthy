/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import React from 'react'

/**
 * Type definitions for Art Supply Store landing page
 */

export interface Feature {
  readonly color:
    | 'card-chain-green'
    | 'card-chain-blue-purple'
    | 'card-chain-purple'
    | 'card-chain-orange'
    | 'card-chain-olive'
  readonly id: string
  readonly title: string
  readonly description: string
  readonly icon: React.FC<React.SVGProps<SVGSVGElement>>
}

export interface Chain {
  readonly id: 'WATERCOLOR' | 'OIL' | 'ACRYLIC' | 'PENCIL' | 'TBC' | 'BTC' | 'ETH' | 'SOL' | 'TRX'
  readonly title: string
  readonly logo?: React.FC<React.SVGProps<SVGSVGElement>>
  readonly url?: string
}

export interface Platform {
  readonly id: string
  readonly title: string
  readonly images: {
    desktop: string
    mobile?: string
    tablet?: string
  }
}

export interface Testimonial {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly content: string
  readonly avatar: string
}

export interface Download {
  readonly id: string
  readonly url: string
  readonly logo?: React.FC<React.SVGProps<SVGSVGElement>>
  readonly title: string
  readonly subtitle: string
  readonly images?: {
    desktop?: string
    mobile?: string
    tablet?: string
  }
}

export interface Product {
  readonly id: string
  readonly title: string
  readonly image: string
  readonly originalPrice: number
  readonly salePrice: number
  readonly discount?: number
  readonly badge?: string
  readonly brand?: string
}
