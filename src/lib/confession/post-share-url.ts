/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

/**
 * URL công khai để chia sẻ bài (ưu tiên NEXT_PUBLIC_APP_URL khi deploy).
 */
export function getPostPublicUrl(postId: string): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  if (typeof window !== 'undefined') {
    const origin = env || window.location.origin
    return `${origin}/post/${postId}`
  }
  return env ? `${env}/post/${postId}` : `/post/${postId}`
}

function copyWithExecCommand(text: string): boolean {
  if (typeof document === 'undefined') return false
  const body = document.body
  if (!body) return false

  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  ta.style.top = '0'

  let ok = false
  try {
    body.appendChild(ta)
    ta.focus()
    ta.select()
    ok = document.execCommand('copy')
  } catch {
    ok = false
  } finally {
    try {
      ta.remove()
    } catch {
      /* đã gỡ hoặc không gắn vào DOM */
    }
  }
  return ok
}

/**
 * Copy link vào clipboard (Clipboard API hoặc fallback).
 */
export async function copyPostUrlToClipboard(postId: string): Promise<boolean> {
  const url = getPostPublicUrl(postId)
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      /* fallback */
    }
  }
  return copyWithExecCommand(url)
}
