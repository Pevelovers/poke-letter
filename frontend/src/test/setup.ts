import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'

import { resetMockState } from '@/api/mock/db'
import { useDraftStore } from '@/stores/messageDraft'

// 라우트 코드 분할과 목 API 지연(300ms) 때문에 첫 화면이 늦게 뜰 수 있다
configure({ asyncUtilTimeout: 3000 })

// 목 API 상태와 임시 저장은 테스트마다 처음부터 시작한다
beforeEach(() => {
  localStorage.clear()
  resetMockState()
  useDraftStore.setState({ drafts: {} })
})
