import { appConfig } from '@/config/app'

import type { ErrorResponse } from './types'
import { handleMockRequest } from './mock/handlers'

export const API_BASE = '/api/v1'

/** 서버가 공통 에러 형식으로 응답했을 때 던진다 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>
  readonly retryAfterSeconds?: number

  constructor(status: number, body: ErrorResponse, retryAfterSeconds?: number) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.fields = body.fields
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | undefined>
}

/** CSRF 토큰은 Spring Security가 내려준 XSRF-TOKEN 쿠키에서 읽는다 (POL-ABU-04) */
function readXsrfToken(): string | undefined {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

function buildPath(path: string, query?: RequestOptions['query']): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value))
  }
  const search = params.toString()
  return search ? `${path}?${search}` : path
}

/**
 * API 호출의 단일 진입점. 목 모드에서는 네트워크 대신 목 핸들러가 응답한다.
 * 실패 응답은 ApiError로, 연결 실패는 fetch의 TypeError 그대로 던진다.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const url = buildPath(path, options.query)

  if (appConfig.useMockApi) {
    return handleMockRequest<T>(method, url, options.body)
  }

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  const xsrf = method === 'GET' ? undefined : readXsrfToken()
  if (xsrf) headers['X-XSRF-TOKEN'] = xsrf

  const response = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorResponse | null
    const retryAfter = Number(response.headers.get('Retry-After'))
    throw new ApiError(
      response.status,
      body ?? { code: 'INTERNAL_ERROR', message: response.statusText },
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
    )
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
