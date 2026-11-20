import type {
  AppConfigResponse,
  BallsResponse,
  CharactersResponse,
  CharacterView,
  CreateMessageRequest,
  CreateMessageResponse,
  CreateTreeRequest,
  CreateTreeResponse,
  LoginProvider,
  MeResponse,
  TreeResponse,
} from '../types'
import { mockCharacters } from './characters'
import { mockBalls } from './fixtures'
import {
  findOwnedTree,
  isMockRevealed,
  loadMockState,
  saveMockState,
  type MockMessage,
  type MockState,
} from './db'

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
      const revealed = isMockRevealed(REVEAL_AT)
      return {
        treeId: tree.treeId,
        name: tree.name,
        isOwner: tree.ownerProvider !== null && tree.ownerProvider === state.provider,
        revealed,
        messageCount: tree.messages.length,
        full: tree.messages.length >= MAX_MESSAGES,
        decorations: tree.messages
          .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
          .map((message) => ({
            messageId: message.messageId,
            nickname: message.nickname,
            ball: message.ball,
            shiny: message.shiny,
            // 공개 전에는 어떤 포켓몬인지 내려주지 않는다 (POL-RVL-01)
            character: revealed ? characterView(message) : null,
            createdAt: message.createdAt,
          })),
        page: { number: page, size: PAGE_SIZE, totalPages },
      }
    },
  ],
  [
    'GET',
    /^\/characters$/,
    (): CharactersResponse => ({ pack: 'pokemon', characters: mockCharacters }),
  ],
  [
    'POST',
    /^\/trees\/([A-Za-z0-9]{10})\/messages$/,
    (state, [treeId], body): CreateMessageResponse => {
      const request = body as CreateMessageRequest
      const tree = state.trees[treeId] ?? {
        treeId,
        name: '친구의 트리',
        ownerProvider: null,
        messages: [],
      }
      const ball = mockBalls.find((item) => item.ballId === request.ballId) ?? mockBalls[0]
      const message: MockMessage = {
        messageId: state.nextMessageId,
        nickname: request.nickname,
        content: request.content,
        characterId: request.characterId,
        shiny: request.shiny,
        ball,
        createdAt: new Date().toISOString(),
      }
      saveMockState({
        ...state,
        nextMessageId: state.nextMessageId + 1,
        trees: { ...state.trees, [treeId]: { ...tree, messages: [...tree.messages, message] } },
      })
      return {
        messageId: message.messageId,
        nickname: message.nickname,
        ball,
        shiny: message.shiny,
        character: characterView(message),
      }
    },
  ],
  ['GET', /^\/balls$/, (): BallsResponse => ({ pack: 'pokemon', balls: mockBalls })],
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

function characterView({ characterId, shiny }: MockMessage): CharacterView {
  const character =
    mockCharacters.find((item) => item.characterId === characterId) ?? mockCharacters[0]
  return {
    characterId: character.characterId,
    name: character.name,
    imageUrl: shiny ? character.shinyImageUrl : character.imageUrl,
  }
}
