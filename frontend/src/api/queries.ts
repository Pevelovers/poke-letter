import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from './client'
import type { AppConfigResponse, CreateTreeResponse, MeResponse, TreeResponse } from './types'

/** 쿼리 키를 한곳에서 관리해 무효화할 때 오타를 막는다 */
export const queryKeys = {
  config: ['config'] as const,
  me: ['me'] as const,
  tree: (treeId: string, page: number) => ['trees', treeId, page] as const,
  treeAll: (treeId: string) => ['trees', treeId] as const,
}

export const configQuery = queryOptions({
  queryKey: queryKeys.config,
  queryFn: () => apiRequest<AppConfigResponse>('/config'),
  staleTime: Infinity,
})

export const meQuery = queryOptions({
  queryKey: queryKeys.me,
  queryFn: () => apiRequest<MeResponse>('/me'),
  retry: false,
})

export const treeQuery = (treeId: string, page: number) =>
  queryOptions({
    queryKey: queryKeys.tree(treeId, page),
    queryFn: () => apiRequest<TreeResponse>(`/trees/${treeId}`, { query: { page } }),
  })

export const createTree = (name: string) =>
  apiRequest<CreateTreeResponse>('/trees', { method: 'POST', body: { name } })

export const logout = () => apiRequest<void>('/auth/logout', { method: 'POST' })
