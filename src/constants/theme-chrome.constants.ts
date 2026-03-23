/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

/**
 * Màu vùng chrome (status bar / tai thỏ iOS, theme-color).
 * Light: trùng header (`bg-white/90` + blur → nhìn như nền trắng), không dùng #f0f2f5 (nền body).
 * Dark: trùng `dark:bg-zinc-950/85` trên header / nền trang.
 */
export const THEME_CHROME = {
  light: '#ffffff',
  /** Cùng tông `dark:bg-zinc-950` trên confession */
  dark: '#09090b',
} as const
