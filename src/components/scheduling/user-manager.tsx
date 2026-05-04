/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

'use client'

import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { appToast } from '@/lib/app-toast'
import { cn } from '@/lib/styles'
import { NotikaSelect } from '@/components/scheduling/notika-select'

interface AppUser {
  id: string
  username: string
  display_name: string
  role: 'superadmin' | 'admin'
  is_active: boolean
  created_at: string
}

async function fetchUsers(): Promise<AppUser[]> {
  const res = await fetch('/api/admin/users')
  if (!res.ok) throw new Error('Lỗi tải danh sách')
  const data = (await res.json()) as { users: AppUser[] }
  return data.users
}

const inputCls = cn(
  'min-h-[2.75rem] w-full rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-3 py-2 text-sm text-[var(--notika-text)] outline-none transition',
  'placeholder:text-[var(--notika-muted)] focus:border-[var(--notika-green)] focus:ring-2 focus:ring-[var(--notika-green)]/20',
)

const btnPrimary = cn(
  'min-h-[2.75rem] rounded-xl border border-[var(--notika-green)]/30 bg-[var(--notika-green)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition',
  'hover:bg-[var(--notika-green)]/90 disabled:opacity-50',
)

const btnSecondary = cn(
  'min-h-[2.5rem] rounded-xl border border-[var(--notika-border)] bg-[var(--notika-card)] px-4 py-1.5 text-sm font-medium text-[var(--notika-text)] shadow-sm transition',
  'hover:bg-[var(--muted)] disabled:opacity-50',
)

export function UserManager() {
  const qc = useQueryClient()
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchUsers,
  })

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ username: '', displayName: '', password: '', role: 'admin' as string })

  const resetForm = useCallback(() => {
    setForm({ username: '', displayName: '', password: '', role: 'admin' })
    setEditId(null)
    setShowForm(false)
  }, [])

  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        throw new Error(d.error ?? 'Lỗi tạo user')
      }
    },
    onSuccess: () => {
      appToast.success('Đã tạo tài khoản mới')
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      resetForm()
    },
    onError: (e) => appToast.error(e instanceof Error ? e.message : 'Lỗi'),
  })

  const updateMut = useMutation({
    mutationFn: async () => {
      if (!editId) return
      const body: Record<string, unknown> = { displayName: form.displayName, role: form.role }
      if (form.password) body.password = form.password
      const res = await fetch(`/api/admin/users/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        throw new Error(d.error ?? 'Lỗi cập nhật')
      }
    },
    onSuccess: () => {
      appToast.success('Đã cập nhật tài khoản')
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      resetForm()
    },
    onError: (e) => appToast.error(e instanceof Error ? e.message : 'Lỗi'),
  })

  const toggleMut = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        throw new Error(d.error ?? 'Lỗi')
      }
    },
    onSuccess: (_d, v) => {
      appToast.success(v.isActive ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản')
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (e) => appToast.error(e instanceof Error ? e.message : 'Lỗi'),
  })

  const busy = createMut.isPending || updateMut.isPending || toggleMut.isPending

  function handleEdit(u: AppUser) {
    setEditId(u.id)
    setForm({ username: u.username, displayName: u.display_name, password: '', role: u.role })
    setShowForm(true)
  }

  function handleSubmit() {
    if (editId) {
      updateMut.mutate()
    } else {
      createMut.mutate()
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-base font-bold text-[var(--notika-text)]'>Quản lý tài khoản</h3>
        {!showForm && (
          <button type='button' className={btnPrimary} onClick={() => { resetForm(); setShowForm(true) }}>
            + Tạo tài khoản
          </button>
        )}
      </div>

      {showForm && (
        <div className='rounded-2xl border border-[var(--notika-border)] bg-[#f8fafb] p-4 dark:bg-[var(--muted)]'>
          <h4 className='mb-3 text-sm font-semibold text-[var(--notika-green)]'>
            {editId ? 'Sửa tài khoản' : 'Tạo tài khoản mới'}
          </h4>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div>
              <label className='mb-1.5 block text-xs font-semibold text-[var(--notika-muted)]'>Tên đăng nhập</label>
              <input
                type='text'
                className={inputCls}
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                disabled={!!editId}
                placeholder='username'
              />
            </div>
            <div>
              <label className='mb-1.5 block text-xs font-semibold text-[var(--notika-muted)]'>Tên hiển thị</label>
              <input
                type='text'
                className={inputCls}
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder='Nguyễn Văn A'
              />
            </div>
            <div>
              <label className='mb-1.5 block text-xs font-semibold text-[var(--notika-muted)]'>
                Mật khẩu {editId ? '(để trống = giữ nguyên)' : ''}
              </label>
              <input
                type='password'
                className={inputCls}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={editId ? '••••••' : 'Ít nhất 6 ký tự'}
              />
            </div>
            <div>
              <label className='mb-1.5 block text-xs font-semibold text-[var(--notika-muted)]'>Vai trò</label>
              <NotikaSelect
                placeholder='Chọn vai trò'
                value={form.role}
                onChange={(v) => setForm((f) => ({ ...f, role: v === 'superadmin' ? 'superadmin' : 'admin' }))}
                options={[
                  { id: 'admin', label: 'Admin' },
                  { id: 'superadmin', label: 'Super Admin' },
                ]}
                aria-label='Vai trò tài khoản'
              />
            </div>
          </div>
          <div className='mt-4 flex gap-2'>
            <button type='button' className={btnPrimary} disabled={busy} onClick={handleSubmit}>
              {editId ? 'Cập nhật' : 'Tạo'}
            </button>
            <button type='button' className={btnSecondary} onClick={resetForm}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className='text-sm text-[var(--notika-muted)]'>Đang tải...</p>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-[var(--notika-border)] shadow-sm'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-[var(--notika-border)] bg-[#f3f5f7] dark:bg-[var(--muted)]'>
                <th className='px-4 py-3 text-left font-semibold text-[var(--notika-muted)]'>Tên đăng nhập</th>
                <th className='px-4 py-3 text-left font-semibold text-[var(--notika-muted)]'>Tên hiển thị</th>
                <th className='px-4 py-3 text-left font-semibold text-[var(--notika-muted)]'>Vai trò</th>
                <th className='px-4 py-3 text-center font-semibold text-[var(--notika-muted)]'>Trạng thái</th>
                <th className='px-4 py-3 text-right font-semibold text-[var(--notika-muted)]'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className='border-b border-[var(--notika-border)]/40 bg-[var(--notika-card)]'>
                  <td className='px-4 py-3 font-medium text-[var(--notika-text)]'>{u.username}</td>
                  <td className='px-4 py-3 text-[var(--notika-text)]'>{u.display_name}</td>
                  <td className='px-4 py-3'>
                    <span className={cn(
                      'inline-block rounded-lg px-2 py-0.5 text-xs font-bold',
                      u.role === 'superadmin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                    )}>
                      {u.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <span className={cn(
                      'inline-block h-2.5 w-2.5 rounded-full shadow-sm',
                      u.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600',
                    )} title={u.is_active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'} />
                  </td>
                  <td className='px-4 py-3 text-right'>
                    <div className='flex items-center justify-end gap-1.5'>
                      <button
                        type='button'
                        className='rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--notika-green)] hover:bg-[var(--notika-green-soft)] disabled:opacity-50'
                        onClick={() => handleEdit(u)}
                        disabled={busy}
                      >
                        Sửa
                      </button>
                      <button
                        type='button'
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-xs font-medium disabled:opacity-50',
                          u.is_active
                            ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
                        )}
                        onClick={() => toggleMut.mutate({ id: u.id, isActive: !u.is_active })}
                        disabled={busy}
                      >
                        {u.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
