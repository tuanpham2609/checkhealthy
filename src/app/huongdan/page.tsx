/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import Link from 'next/link'
import { AppLogo } from '@/components/app-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { GuideViewer } from './guide-viewer'

export const metadata: Metadata = {
  title: 'Hướng dẫn sử dụng — Phần mềm xếp lịch YHCT & PHCN',
  description:
    'Hướng dẫn chi tiết, có ảnh minh hoạ, giúp nhân viên phòng khám sử dụng phần mềm xếp lịch Y học Cổ truyền & Phục hồi chức năng.',
  robots: { index: false, follow: false },
}

// Trang tinh, cho phep Next render san.
export const dynamic = 'force-static'
export const revalidate = false

async function loadGuide(): Promise<string> {
  const filePath = path.join(process.cwd(), 'docs', 'HUONG-DAN-SU-DUNG.md')
  return fs.readFile(filePath, 'utf-8')
}

export default async function HuongDanPage() {
  const markdown = await loadGuide()

  return (
    <div className='min-h-dvh bg-gradient-to-b from-[var(--notika-green-soft)]/40 via-background to-background'>
      <header className='sticky top-0 z-30 border-b border-[var(--notika-border)] bg-background/85 backdrop-blur'>
        <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6'>
          <Link href='/huongdan' className='flex items-center gap-3 no-underline'>
            <AppLogo variant='mark' size={36} priority />
            <div className='leading-tight'>
              <div className='text-[11px] font-semibold tracking-[0.18em] text-[var(--notika-green-hover)] uppercase'>
                Tâm Thiện Tâm
              </div>
              <div className='text-sm font-semibold text-[var(--notika-text)] sm:text-[15px]'>
                Hướng dẫn sử dụng phần mềm
              </div>
            </div>
          </Link>
          <div className='flex items-center gap-2'>
            <Link
              href='/login'
              className='hidden items-center rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2 text-sm font-medium text-[var(--notika-text)] transition hover:border-[var(--notika-green)]/40 hover:bg-[var(--muted)] sm:inline-flex'
            >
              Vào phần mềm
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className='border-b border-[var(--notika-border)] bg-gradient-to-br from-white via-[var(--notika-green-soft)]/30 to-white dark:from-[var(--notika-card)] dark:via-background dark:to-background'>
        <div className='mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16'>
          <div className='flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-10'>
            <div className='shrink-0 rounded-3xl border border-[var(--notika-border)] bg-white p-4 shadow-[0_12px_30px_-18px_rgba(30,143,62,0.45)]'>
              <AppLogo variant='mark' size={72} priority />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--notika-green-soft)] px-3 py-1 text-xs font-semibold text-[var(--notika-green-hover)] dark:bg-[var(--notika-green-soft)]/20'>
                <span className='inline-block size-1.5 rounded-full bg-[var(--notika-green)]' />
                Tài liệu chính thức · v1.0
              </div>
              <h1 className='text-2xl font-bold tracking-tight text-[var(--notika-text)] sm:text-3xl md:text-4xl'>
                Hướng dẫn sử dụng phần mềm xếp lịch
                <br className='hidden sm:block' />
                <span className='text-[var(--notika-green)]'> Y học Cổ truyền &amp; Phục hồi chức năng</span>
              </h1>
              <p className='mt-3 max-w-2xl text-[15px] leading-7 text-[var(--notika-muted)]'>
                Tài liệu từng bước có ảnh chụp màn hình, dành cho nhân viên phòng khám — từ đăng nhập, nhập dữ liệu bác sĩ/KTV/máy/thủ thuật, tới chạy xếp lịch tự động và xem kết quả.
              </p>
              <div className='mt-5 flex flex-wrap gap-3'>
                <a
                  href='#1-gioi-thieu-tong-quan'
                  className='inline-flex items-center rounded-xl bg-[var(--notika-green)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--notika-green-hover)]'
                >
                  Bắt đầu đọc →
                </a>
                <Link
                  href='/login'
                  className='inline-flex items-center rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-4 py-2.5 text-sm font-semibold text-[var(--notika-text)] transition hover:border-[var(--notika-green)]/40 hover:bg-[var(--muted)]'
                >
                  Vào phần mềm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className='mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14'>
        <GuideViewer markdown={markdown} />

        <footer className='mx-auto mt-16 max-w-3xl border-t border-[var(--notika-border)] pt-6 text-center text-xs text-[var(--notika-muted)]'>
          © {new Date().getFullYear()} Phòng khám Đa khoa Tâm Thiện Tâm · Tài liệu hướng dẫn nội bộ
        </footer>
      </main>
    </div>
  )
}
