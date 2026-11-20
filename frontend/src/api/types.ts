/**
 * API 요청·응답 타입 (docs/api/api-spec.md 기준).
 * 백엔드 springdoc이 준비되면 `pnpm api:generate`로 만든 타입으로 바꾼다.
 */

export type LoginProvider = 'google' | 'kakao' | 'naver'

export interface AppConfigResponse {
  revealAt: string
  serverTime: string
  loginProviders: LoginProvider[]
  characterPack: 'pokemon' | 'ornament'
  notice: string | null
}

export interface MeResponse {
  provider: LoginProvider
  tree: { treeId: string; name: string; messageCount: number } | null
}

export interface CreateTreeRequest {
  name: string
}

export interface CreateTreeResponse {
  treeId: string
  name: string
  shareUrl: string
}

export interface BallView {
  ballId: number
  name: string
  imageUrl: string
}

export interface Decoration {
  messageId: number
  nickname: string
  ball: BallView
  createdAt: string
}

export interface PageInfo {
  number: number
  size: number
  totalPages: number
}

export interface TreeResponse {
  treeId: string
  name: string
  isOwner: boolean
  revealed: boolean
  messageCount: number
  full: boolean
  decorations: Decoration[]
  page: PageInfo
}

export interface ErrorResponse {
  code: string
  message: string
  fields?: Record<string, string>
}
