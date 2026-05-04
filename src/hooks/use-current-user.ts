/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

'use client'

import { useQuery } from '@tanstack/react-query'

export interface CurrentUser {
  id: string
  username: string
  role: 'superadmin' | 'admin'
}

async function fetchMe(): Promise<CurrentUser | null> {
  const res = await fetch('/api/auth/me')
  if (!res.ok) return null
  const data = (await res.json()) as { user: CurrentUser | null }
  return data.user
}

export function useCurrentUser() {
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isSuperAdmin: query.data?.role === 'superadmin',
  }
}
