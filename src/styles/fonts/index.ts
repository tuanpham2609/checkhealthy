/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

import { Lora, Outfit } from 'next/font/google'

/** Sans hiện đại, dễ đọc — toàn UI */
const FONT_SANS = Outfit({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
})

/** Serif ấm — tiêu đề, nhấn mạnh */
const FONT_SERIF = Lora({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
})

export { FONT_SANS, FONT_SERIF }
