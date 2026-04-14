/**
 * Copyright (c) 2025 Mythuatcmc. All rights reserved.
 */

'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { APP_DOCUMENT_TITLE } from '@/constants/app-document.constants'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Đăng nhập thất bại')
        return
      }

      router.replace('/')
    } catch {
      setError('Không thể kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-dvh items-center justify-center bg-[var(--notika-content)] px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:py-10'>
      <div className='w-full max-w-[400px]'>
        <div className='relative overflow-hidden rounded border border-[var(--notika-border)] bg-[var(--notika-card)] shadow-[0_4px_24px_rgba(0,0,0,0.08)]'>
          <div className='h-1 bg-[var(--notika-green)]' aria-hidden />
          <div className='absolute right-2 top-2 z-10 sm:right-3 sm:top-3'>
            <ThemeToggle />
          </div>
          <div className='px-5 pb-8 pt-7 sm:px-8'>
            <div className='mb-7 text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--notika-border)] bg-[#f8fafb] shadow-sm dark:bg-[var(--muted)]'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-5 w-5 text-[var(--notika-green)]'
                >
                  <rect width='18' height='11' x='3' y='11' rx='2' ry='2' />
                  <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                </svg>
              </div>
              <h1 className='text-lg font-semibold tracking-tight text-[var(--notika-text)]'>{APP_DOCUMENT_TITLE}</h1>
              <p className='mt-1 text-xs text-[var(--notika-muted)]'>Đăng nhập để vào bảng điều khiển</p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label
                  htmlFor='login-username'
                  className='mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--notika-muted)]'
                >
                  Tên đăng nhập
                </label>
                <input
                  id='login-username'
                  type='text'
                  autoComplete='username'
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='w-full rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2.5 text-sm text-[var(--notika-text)] outline-none transition placeholder:text-[var(--notika-muted)] focus:border-[var(--notika-green)] focus:ring-2 focus:ring-[var(--notika-green)]/20'
                  placeholder='admin'
                />
              </div>

              <div>
                <label
                  htmlFor='login-password'
                  className='mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--notika-muted)]'
                >
                  Mật khẩu
                </label>
                <input
                  id='login-password'
                  type='password'
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2.5 text-sm text-[var(--notika-text)] outline-none transition placeholder:text-[var(--notika-muted)] focus:border-[var(--notika-green)] focus:ring-2 focus:ring-[var(--notika-green)]/20'
                  placeholder='••••••••'
                />
              </div>

              {error && (
                <div className='rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700' role='alert'>
                  {error}
                </div>
              )}

              <button
                type='submit'
                disabled={loading}
                className='min-h-11 w-full rounded-xl border border-transparent bg-[var(--notika-green)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--notika-green-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--notika-green)] focus:ring-offset-2 focus:ring-offset-[var(--notika-content)] disabled:cursor-not-allowed disabled:opacity-60'
              >
                {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>

        <p className='mt-5 text-center text-[11px] text-[var(--notika-muted)]'>
          <a
            href='mailto:duytuanit.info@gmail.com'
            className='underline decoration-[var(--notika-muted)] underline-offset-2 hover:text-[var(--notika-green)]'
          >
            duytuanit.info@gmail.com
          </a>
        </p>
      </div>
    </div>
  )
}
