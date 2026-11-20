import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderRoute } from '@/test/render'
import { useDraftStore } from '@/stores/messageDraft'

const TREE = '/t/demoTree01/write'

describe('포켓몬 선택기', () => {
  it('초성으로 찾아 고르면 작성 화면으로 돌아가 고른 포켓몬을 보여 준다', async () => {
    const { router } = renderRoute(`${TREE}/pokemon`)

    await userEvent.type(await screen.findByLabelText('포켓몬 이름 검색'), 'ㅍㅋㅊ')
    expect(await screen.findByText('1마리')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /피카츄/ }))

    expect(router.state.location.pathname).toBe(TREE)
    expect(await screen.findByText('피카츄')).toBeInTheDocument()
    expect(useDraftStore.getState().drafts.demoTree01.characterId).toBe(2500)
  })

  it('세대와 타입 필터를 함께 쓴다', async () => {
    renderRoute(`${TREE}/pokemon`)

    const generations = await screen.findByRole('group', { name: '세대' })
    await userEvent.click(within(generations).getByRole('button', { name: '1세대' }))
    const types = screen.getByRole('group', { name: '타입' })
    await userEvent.click(within(types).getByRole('button', { name: '얼음' }))

    expect(await screen.findByText('3마리')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '필터 초기화' }))
    expect(await screen.findByText('32마리')).toBeInTheDocument()
  })

  it('찾는 포켓몬이 없으면 안내한다', async () => {
    renderRoute(`${TREE}/pokemon`)

    await userEvent.type(await screen.findByLabelText('포켓몬 이름 검색'), '디지몬')

    expect(await screen.findByText(/찾는 포켓몬이 없어요/)).toBeInTheDocument()
  })
})

describe('볼 선택기', () => {
  it('몬스터볼이 미리 선택되어 있고, 고르면 작성 화면에 반영된다', async () => {
    const { router } = renderRoute(`${TREE}/ball`)

    expect(
      await screen.findByRole('button', { name: '몬스터볼', pressed: true }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '프리미어볼' }))

    expect(router.state.location.pathname).toBe(TREE)
    expect(await screen.findByText('프리미어볼')).toBeInTheDocument()
  })
})
