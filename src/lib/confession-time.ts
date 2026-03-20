/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

export function formatRelativeTime(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000)
  if (sec < 10) return 'Vừa xong'
  if (sec < 60) return `${sec} giây trước`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} ngày trước`
  return new Date(ts).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })
}
