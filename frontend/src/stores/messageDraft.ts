import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/** 작성 폼을 열면 미리 선택되는 볼: 몬스터볼 (POL-CHR-10, PokéAPI 아이템 id) */
export const DEFAULT_BALL_ID = 4

export interface MessageDraft {
  nickname: string
  content: string
  characterId: number | null
  /** 확인 창에서 당첨된 이로치 여부 (POL-CHR-12) */
  shiny: boolean
  ballId: number
}

export const emptyDraft: MessageDraft = {
  nickname: '',
  content: '',
  characterId: null,
  shiny: false,
  ballId: DEFAULT_BALL_ID,
}

interface DraftState {
  drafts: Record<string, MessageDraft>
  update: (treeId: string, patch: Partial<MessageDraft>) => void
  clear: (treeId: string) => void
}

/**
 * 트리별 작성 중인 메시지. 작성자 기기의 로컬스토리지에만 저장한다 (POL-MSG-05).
 * 저장소를 쓸 수 없는 환경에서는 메모리에만 두고 작성은 그대로 할 수 있다 (ENV-02).
 * 전송에 성공했을 때만 clear한다.
 */
export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      drafts: {},
      update: (treeId, patch) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [treeId]: { ...(state.drafts[treeId] ?? emptyDraft), ...patch },
          },
        })),
      clear: (treeId) =>
        set((state) => {
          const drafts = { ...state.drafts }
          delete drafts[treeId]
          return { drafts }
        }),
    }),
    {
      name: 'pokeletter:drafts',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ drafts: state.drafts }),
    },
  ),
)

export function useDraft(treeId: string): MessageDraft {
  return useDraftStore((state) => state.drafts[treeId] ?? emptyDraft)
}
