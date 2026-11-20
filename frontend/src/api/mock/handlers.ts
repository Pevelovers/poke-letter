import type {
  AppConfigResponse,
  CreateTreeRequest,
  CreateTreeResponse,
  LoginProvider,
  MeResponse,
  TreeResponse,
} from '../types'
import { findOwnedTree, loadMockState, saveMockState, type MockState } from './db'

/**
 * 백엔드가 준비되기 전에 쓰는 목 API.
 * 약속: 요청은 항상 성공(2xx)한다고 가정하고 api-spec.md 형식대로 응답한다.
 * 에러 응답 처리는 화면 테스트에서 ApiError를 직접 만들어 확인한다.
 */

const MOCK_DELAY_MS = 300
const PAGE_SIZE = 10
const MAX_MESSAGES = 200
const REVEAL_AT = '2026-12-25T00:00:00+09:00'

type Handler = (
  state: MockState,
  params: string[],
  body: unknown,
  query: URLSearchParams,
) => unknown

const routes: Array<[method: string, pattern: RegExp, handler: Handler]> = [
  [
    'GET',
    /^\/config$/,
    (): AppConfigResponse => ({
      revealAt: REVEAL_AT,
      serverTime: new Date().toISOString(),
      loginProviders: ['google', 'kakao', 'naver'],
      characterPack: 'pokemon',
      notice: null,
    }),
  ],
  [
    'GET',
    /^\/me$/,
    (state): MeResponse => {
      // 목은 항상 로그인된 것으로 응답한다. 로그인 버튼을 누르지 않았으면 카카오로 본다
      const provider = state.provider ?? 'kakao'
      const tree = findOwnedTree({ ...state, provider })
      return {
        provider,
        tree: tree
          ? { treeId: tree.treeId, name: tree.name, messageCount: tree.messages.length }
          : null,
      }
    },
  ],
  [
    'POST',
    /^\/auth\/logout$/,
    (state) => {
      saveMockState({ ...state, provider: null })
      return undefined
    },
  ],
  [
    'POST',
    /^\/trees$/,
    (state, _params, body): CreateTreeResponse => {
      const provider = state.provider ?? 'kakao'
      const existing = findOwnedTree({ ...state, provider })
      const name = (body as CreateTreeRequest).name.trim()
      const tree = existing ?? {
        treeId: randomTreeId(),
        name,
        ownerProvider: provider,
        messages: [],
      }
      saveMockState({ ...state, provider, trees: { ...state.trees, [tree.treeId]: tree } })
      return { treeId: tree.treeId, name: tree.name, shareUrl: shareUrl(tree.treeId) }
    },
  ],
  [
    'GET',
    /^\/trees\/([A-Za-z0-9]{10})$/,
    (state, [treeId], _body, query): TreeResponse => {
      const tree = state.trees[treeId] ?? {
        treeId,
        name: '친구의 트리',
        ownerProvider: null,
        messages: [],
      }
      const page = Number(query.get('page') ?? 0)
      const totalPages = Math.max(1, Math.ceil(tree.messages.length / PAGE_SIZE))
      return {
        treeId: tree.treeId,
        name: tree.name,
        isOwner: tree.ownerProvider !== null && tree.ownerProvider === state.provider,
        revealed: Date.now() >= Date.parse(REVEAL_AT),
        messageCount: tree.messages.length,
        full: tree.messages.length >= MAX_MESSAGES,
        decorations: tree.messages
          .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
          .map(({ messageId, nickname, ball, createdAt }) => ({
            messageId,
            nickname,
            ball,
            createdAt,
          })),
        page: { number: page, size: PAGE_SIZE, totalPages },
      }
    },
  ],
]

/** 목 모드에서 로그인 버튼을 누르면 OAuth 대신 이 함수가 로그인 상태를 만든다 */
export function mockLogin(provider: LoginProvider) {
  saveMockState({ ...loadMockState(), provider })
}

export async function handleMockRequest<T>(method: string, url: string, body: unknown): Promise<T> {
  const [path, search = ''] = url.split('?')
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
  for (const [routeMethod, pattern, handler] of routes) {
    const match = routeMethod === method ? pattern.exec(path) : null
    if (match) {
      const result = handler(loadMockState(), match.slice(1), body, new URLSearchParams(search))
      return structuredClone(result) as T
    }
  }
  throw new Error(`목 API에 없는 경로입니다: ${method} ${path}`)
}

function randomTreeId(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

function shareUrl(treeId: string): string {
  return `${window.location.origin}/t/${treeId}`
}
