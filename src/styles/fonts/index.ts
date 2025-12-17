/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

import { Poppins } from 'next/font/google'
import localFont from 'next/font/local'

const FONT_POPPINS = Poppins({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
})

const FONT_CLASH_DISPLAY = localFont({ src: './ClashDisplay-Variable.woff2', variable: '--font-clash-display' })

export { FONT_POPPINS, FONT_CLASH_DISPLAY }
