import type { BallView, LoginProvider } from '../types'
import { DEMO_TREE_ID, mockBalls, mockNicknames } from './fixtures'

/** 목 서버의 저장 상태. 새로고침해도 이어지도록 로컬스토리지에 둔다 */
export interface MockMessage {
  messageId: number
  nickname: string
  content: string
  characterId: number | null
  ball: BallView
  createdAt: string
}

export interface MockTree {
  treeId: string
  name: string
  ownerProvider: LoginProvider | null
  messages: MockMessage[]
}

export interface MockState {
  provider: LoginProvider | null
  trees: Record<string, MockTree>
  nextMessageId: number
}

const STORAGE_KEY = 'pokeletter:mock-db'

function demoTree(): MockTree {
  const start = Date.parse('2026-12-01T09:00:00+09:00')
  return {
    treeId: DEMO_TREE_ID,
    name: '지우의 트리',
    ownerProvider: null,
    messages: mockNicknames.map((nickname, index) => ({
      messageId: index + 1,
      nickname,
      content: '메리 크리스마스!',
      characterId: null,
      ball: mockBalls[index % mockBalls.length],
      createdAt: new Date(start + index * 3_600_000).toISOString(),
    })),
  }
}

function initialState(): MockState {
  return {
    provider: null,
    trees: { [DEMO_TREE_ID]: demoTree() },
    nextMessageId: mockNicknames.length + 1,
  }
}

let memoryState: MockState | null = null

export function loadMockState(): MockState {
  if (memoryState) return memoryState
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    memoryState = saved ? (JSON.parse(saved) as MockState) : initialState()
  } catch {
    memoryState = initialState()
  }
  return memoryState
}

export function saveMockState(state: MockState) {
  memoryState = state
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 저장소를 쓸 수 없는 환경이면 메모리에만 둔다
  }
}

/** 테스트와 개발 도구에서 목 상태를 처음으로 되돌린다 */
export function resetMockState() {
  memoryState = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 무시
  }
}

export function findOwnedTree(state: MockState): MockTree | undefined {
  if (!state.provider) return undefined
  return Object.values(state.trees).find((tree) => tree.ownerProvider === state.provider)
}
