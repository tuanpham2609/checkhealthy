/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

'use client'

import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchHolidays,
  createHoliday as apiCreate,
  deleteHoliday as apiDelete,
} from '@/lib/scheduling/api'
import { schedKeys } from '@/lib/scheduling/query-keys'

export function useHolidays() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: schedKeys.holidays(),
    queryFn: fetchHolidays,
  })

  const invalidate = useCallback(
    () => qc.invalidateQueries({ queryKey: schedKeys.holidays() }),
    [qc],
  )

  const addMutation = useMutation({
    mutationFn: (body: { date: string; label: string; recurring: boolean }) => apiCreate(body),
    onSuccess: () => void invalidate(),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => apiDelete(id),
    onSuccess: () => void invalidate(),
  })

  return {
    holidays: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    addHoliday: addMutation.mutateAsync,
    removeHoliday: removeMutation.mutateAsync,
    busy: addMutation.isPending || removeMutation.isPending,
    refresh: invalidate,
  }
}
