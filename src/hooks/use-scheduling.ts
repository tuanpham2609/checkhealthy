/**
 * Copyright (c) 2026 TuanPham. All rights reserved.
 */

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchContextList,
  fetchContext,
  saveContext as apiSaveContext,
  runSchedule,
  createContext as apiCreateContext,
  deleteContext as apiDeleteContext,
  putAssignments,
  patchDaysOff as apiPatchDaysOff,
} from '@/lib/scheduling/api'
import type { SchedAssignment, SchedContextPayload } from '@/lib/scheduling/types'
import { schedKeys } from '@/lib/scheduling/query-keys'

export function useScheduling() {
  const qc = useQueryClient()
  const [contextId, setContextId] = useState<string | null>(null)
  const [payload, setPayload] = useState<SchedContextPayload | null>(null)
  const [bootstrapped, setBootstrapped] = useState(false)

  const listQuery = useQuery({
    queryKey: schedKeys.lists(),
    queryFn: fetchContextList,
  })

  const contextQuery = useQuery({
    queryKey: schedKeys.context(contextId ?? '__none__'),
    queryFn: () => fetchContext(contextId!),
    enabled: !!contextId && !payload,
  })

  useEffect(() => {
    if (contextQuery.data && !payload) {
      setPayload(contextQuery.data)
    }
  }, [contextQuery.data, payload])

  useEffect(() => {
    if (bootstrapped) return
    if (!listQuery.data) return
    setBootstrapped(true)
    const latest = listQuery.data[0]
    if (latest?.id) {
      setContextId(latest.id)
    }
  }, [listQuery.data, bootstrapped])

  const loadContext = useCallback(
    async (id: string) => {
      const data = await qc.fetchQuery({
        queryKey: schedKeys.context(id),
        queryFn: () => fetchContext(id),
      })
      setPayload(data)
      setContextId(id)
    },
    [qc],
  )

  const invalidateList = useCallback(() => qc.invalidateQueries({ queryKey: schedKeys.lists() }), [qc])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!contextId || !payload) throw new Error('Không có bản lịch để lưu')
      await apiSaveContext(contextId, payload)
    },
    onSuccess: () => void invalidateList(),
  })

  const scheduleMutation = useMutation({
    mutationFn: async ({ mode, afterSave }: { mode: 'full' | 'preserve'; afterSave?: boolean }) => {
      if (!contextId || !payload) throw new Error('Không có bản lịch')
      if (!afterSave) {
        await apiSaveContext(contextId, payload)
      }
      return runSchedule(contextId, mode)
    },
    onSuccess: (data) => {
      setPayload(data.context)
      void invalidateList()
    },
  })

  const createMutation = useMutation({
    mutationFn: (body?: Record<string, unknown>) => apiCreateContext(body),
    onSuccess: async (newId) => {
      await invalidateList()
      await loadContext(newId)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteContext(id),
    onSuccess: (_data, deletedId) => {
      if (deletedId === contextId) {
        setContextId(null)
        setPayload(null)
      }
      void invalidateList()
    },
  })

  const saveAsNewMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => apiCreateContext(body),
    onSuccess: async (newId) => {
      await invalidateList()
      await loadContext(newId)
    },
  })

  const daysOffMutation = useMutation({
    mutationFn: async (next: string[]) => {
      if (!contextId) throw new Error('Không có bản lịch')
      await apiPatchDaysOff(contextId, next)
      return next
    },
    onSuccess: (next) => {
      setPayload((p) => (p ? { ...p, daysOff: next } : p))
    },
  })

  const assignmentsMutation = useMutation({
    mutationFn: async (next: SchedAssignment[]) => {
      if (!contextId) throw new Error('Không có bản lịch')
      await putAssignments(contextId, next)
      return next
    },
    onSuccess: (next) => {
      setPayload((p) => (p ? { ...p, assignments: next } : p))
    },
  })

  const busy = useMemo(
    () =>
      saveMutation.isPending ||
      scheduleMutation.isPending ||
      createMutation.isPending ||
      deleteMutation.isPending ||
      saveAsNewMutation.isPending ||
      daysOffMutation.isPending ||
      assignmentsMutation.isPending ||
      contextQuery.isFetching,
    [
      saveMutation.isPending,
      scheduleMutation.isPending,
      createMutation.isPending,
      deleteMutation.isPending,
      saveAsNewMutation.isPending,
      daysOffMutation.isPending,
      assignmentsMutation.isPending,
      contextQuery.isFetching,
    ],
  )

  const latestError = useMemo(() => {
    const e =
      listQuery.error ??
      contextQuery.error ??
      saveMutation.error ??
      scheduleMutation.error ??
      createMutation.error ??
      deleteMutation.error ??
      saveAsNewMutation.error ??
      daysOffMutation.error ??
      assignmentsMutation.error
    return e instanceof Error ? e.message : e ? String(e) : null
  }, [
    listQuery.error,
    contextQuery.error,
    saveMutation.error,
    scheduleMutation.error,
    createMutation.error,
    deleteMutation.error,
    saveAsNewMutation.error,
    daysOffMutation.error,
    assignmentsMutation.error,
  ])

  const clearErrors = useCallback(() => {
    saveMutation.reset()
    scheduleMutation.reset()
    createMutation.reset()
    deleteMutation.reset()
    saveAsNewMutation.reset()
    daysOffMutation.reset()
    assignmentsMutation.reset()
  }, [saveMutation, scheduleMutation, createMutation, deleteMutation, saveAsNewMutation, daysOffMutation, assignmentsMutation])

  return {
    contextList: listQuery.data ?? [],
    contextId,
    payload,
    setPayload,
    busy,
    error: latestError,
    clearErrors,
    bootstrapping: !bootstrapped && listQuery.isLoading,

    loadContext,
    refreshList: invalidateList,

    saveContext: () => saveMutation.mutateAsync(),
    runSchedule: (mode: 'full' | 'preserve') => scheduleMutation.mutateAsync({ mode }),
    scheduleMutation,
    createSession: () => createMutation.mutateAsync({}),
    deleteContext: (id: string) => deleteMutation.mutateAsync(id),
    saveAsNew: (body: Record<string, unknown>) => saveAsNewMutation.mutateAsync(body),
    persistDaysOff: (next: string[]) => daysOffMutation.mutateAsync(next),
    persistAssignments: (next: SchedAssignment[]) => assignmentsMutation.mutateAsync(next),
  }
}
