/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from TuanPham.
 */

import { toast as sonnerToast, type ExternalToast } from 'sonner'

const base: ExternalToast = {
  duration: 4000,
}

export type AppToastOptions = Omit<ExternalToast, 'id'> & { id?: string }

/**
 * Toast thống nhất cho app — bọc Sonner với mặc định thời lượng / ưu tiên.
 */
export const appToast = {
  success(message: string, options?: AppToastOptions) {
    return sonnerToast.success(message, { ...base, ...options })
  },

  error(message: string, options?: AppToastOptions) {
    return sonnerToast.error(message, { ...base, duration: 6500, ...options })
  },

  warning(message: string, options?: AppToastOptions) {
    return sonnerToast.warning(message, { ...base, duration: 5000, ...options })
  },

  info(message: string, options?: AppToastOptions) {
    return sonnerToast.info(message, { ...base, ...options })
  },

  /** Thông điệp trung tính (không màu trạng thái) */
  message(title: string, options?: AppToastOptions) {
    return sonnerToast.message(title, { ...base, ...options })
  },

  loading(message: string, options?: AppToastOptions) {
    return sonnerToast.loading(message, { ...base, duration: Infinity, ...options })
  },

  promise: sonnerToast.promise,

  dismiss: sonnerToast.dismiss,
}
