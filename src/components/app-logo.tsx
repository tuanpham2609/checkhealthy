/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

'use client'

import Image from 'next/image'
import { cn } from '@/lib/styles'

/** File logo có chữ (mark + wordmark) dùng cho variant `full` / `wordmark`. */
const LOGO_FULL_SRC = '/assets/logo-tam-thien-tam.jpg'
const LOGO_FULL_W = 1024
const LOGO_FULL_H = 458
/** File mark sạch (chỉ dấu thập), vuông — dùng cho variant `mark`. */
const LOGO_MARK_SRC = '/assets/logo-mark.jpg'
const LOGO_MARK_W = 357
const LOGO_MARK_H = 360
/** Phần "dấu thập" y tế trong ảnh full chiếm từ x=0 → ~x=330 / 1024 (ước lượng mắt). */
const MARK_FRACTION_X = 330 / LOGO_FULL_W

interface AppLogoProps {
  /**
   * - `mark`: chỉ hiện dấu thập y tế (vuông)
   * - `wordmark`: chỉ hiện phần chữ
   * - `full`: toàn bộ logo (ảnh gốc)
   */
  variant?: 'mark' | 'wordmark' | 'full'
  /** Chiều cao render (px). */
  size?: number
  className?: string
  priority?: boolean
}

/**
 * AppLogo - Logo thương hiệu Tâm Thiện Tâm (Phòng khám Đa khoa)
 *
 * File gốc là ảnh bitmap nền trắng nên phần mark/wordmark được crop bằng
 * container overflow-hidden + ảnh được scale & dịch chuyển bên trong.
 */
export function AppLogo({
  variant = 'mark',
  size,
  className,
  priority = false,
}: AppLogoProps) {
  if (variant === 'full') {
    const h = size ?? 64
    const w = Math.round((h * LOGO_FULL_W) / LOGO_FULL_H)
    return (
      <Image
        src={LOGO_FULL_SRC}
        alt='Phòng khám Đa khoa Tâm Thiện Tâm'
        width={LOGO_FULL_W}
        height={LOGO_FULL_H}
        priority={priority}
        className={cn('select-none', className)}
        style={{ height: h, width: w, objectFit: 'contain' }}
      />
    )
  }

  if (variant === 'wordmark') {
    const h = size ?? 32
    const fullW = (h * LOGO_FULL_W) / LOGO_FULL_H
    const cropLeft = Math.round(fullW * MARK_FRACTION_X)
    const displayW = Math.round(fullW - cropLeft)
    return (
      <div
        className={cn('relative overflow-hidden select-none', className)}
        style={{ height: h, width: displayW }}
        role='img'
        aria-label='Tâm Thiện Tâm — Phòng khám Đa khoa'
      >
        <Image
          src={LOGO_FULL_SRC}
          alt=''
          width={LOGO_FULL_W}
          height={LOGO_FULL_H}
          priority={priority}
          className='absolute top-0'
          style={{
            height: h,
            width: fullW,
            left: `-${cropLeft}px`,
            maxWidth: 'none',
          }}
        />
      </div>
    )
  }

  // mark: vuông, dùng file logo-mark.jpg (ảnh đã sạch, gần vuông 357×360).
  const s = size ?? 40
  return (
    <Image
      src={LOGO_MARK_SRC}
      alt='Phòng khám Đa khoa Tâm Thiện Tâm'
      width={LOGO_MARK_W}
      height={LOGO_MARK_H}
      priority={priority}
      className={cn('shrink-0 select-none', className)}
      style={{ height: s, width: s, objectFit: 'contain' }}
    />
  )
}

/**
 * Brand tile: logo mark đặt trong ô vuông mềm (gradient + border + shadow tinh tế),
 * phù hợp cho sidebar/header ở cả light & dark mode.
 */
export function AppLogoTile({
  size = 40,
  className,
  priority = false,
}: {
  size?: number
  className?: string
  priority?: boolean
}) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-2xl',
        'border border-[var(--notika-border)]',
        'bg-gradient-to-br from-white via-white to-[#f0faf2]',
        'shadow-[0_6px_14px_-8px_rgba(30,143,62,0.35),inset_0_1px_0_rgba(255,255,255,0.8)]',
        'dark:from-white dark:via-white dark:to-[#f0faf2]',
        className,
      )}
      style={{ height: size + 8, width: size + 8 }}
    >
      <AppLogo variant='mark' size={size} priority={priority} />
    </div>
  )
}
