import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderRoute } from '@/test/render'

import { EDITOR_SRC } from './EditorPage'

describe('에디터 경로', () => {
  it('/editor에서 에디터 정적 페이지를 화면 전체로 띄운다', async () => {
    renderRoute('/editor')
    const frame = await screen.findByTitle('트리 장식 에디터')
    expect(frame).toHaveAttribute('src', EDITOR_SRC)
  })
})
