/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 *
 * This source code is proprietary and confidential.
 * Unauthorized copying, distribution, or modification of this file,
 * in whole or in part, is strictly prohibited without prior written consent
 * from Mythuatcmc.
 */

/**
 * YouTube Shorts Video URLs
 * 
 * Cách thêm video:
 * 1. Vào YouTube Shorts
 * 2. Click vào video bạn muốn embed
 * 3. Copy URL từ thanh địa chỉ (ví dụ: https://www.youtube.com/shorts/VIDEO_ID)
 * 4. Thêm URL vào mảng YOUTUBE_SHORTS_VIDEOS bên dưới
 * 
 * Lưu ý:
 * - Video phải là public để có thể embed
 * - Format URL: https://www.youtube.com/shorts/{videoId}
 * - Có thể thêm tối đa bao nhiêu video tùy ý
 */
export const YOUTUBE_SHORTS_VIDEOS = [
  'https://www.youtube.com/shorts/-5xnglzcrZI',
  'https://www.youtube.com/shorts/eKpD7R8Yk2M',
  'https://www.youtube.com/shorts/1EUE2Vk1F2I',
  // Thêm các video URL YouTube Shorts tại đây
  // Ví dụ:
  // 'https://www.youtube.com/shorts/VIDEO_ID',
] as const

export const YOUTUBE_SHORTS_VIDEOS_TOP = [
  'https://www.youtube.com/shorts/Sy5ao7B97zM',
  'https://www.youtube.com/shorts/EtSjKlEWMwo',
  'https://www.youtube.com/shorts/YZiyMx9Q24w',
] as const
