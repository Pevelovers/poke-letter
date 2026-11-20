import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderRoute } from '@/test/render'
import { useDraftStore } from '@/stores/messageDraft'

const TREE = '/t/demoTree01/write'

/** crypto.getRandomValues가 차례로 돌려줄 값. 다 쓰면 실제 난수로 돌아간다 */
function mockRandomValues(values: number[]) {
  const original = crypto.getRandomValues.bind(crypto)
  vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
    if (values.length === 0) return original(array)
    ;(array as Uint32Array)[0] = values.shift()!
    return array
  })
}

afterEach(() => vi.restoreAllMocks())

describe('포켓몬 선택기', () => {
  it('검색하기 전에는 세대별 스타팅 포켓몬만 보여 준다', async () => {
    renderRoute(`${TREE}/pokemon`)

    expect(await screen.findByText('세대별 스타팅 포켓몬')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^이상해씨/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^브케인/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^피카츄/ })).not.toBeInTheDocument()
  })

  it('초성으로 찾아 누르면 확인 창이 뜨고, 예를 누르면 작성 화면에 반영된다', async () => {
    mockRandomValues([1]) // 이로치 꽝
    const { router } = renderRoute(`${TREE}/pokemon`)

    await userEvent.type(await screen.findByLabelText('포켓몬 이름 검색'), 'ㅍㅋㅊ')
    expect(await screen.findByText('1마리')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /피카츄/ }))

    const dialog = await screen.findByRole('alertdialog', { name: '이 아이를 맡길까?' })
    expect(within(dialog).getByText('피카츄')).toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: '예' }))

    expect(router.state.location.pathname).toBe(TREE)
    expect(await screen.findByText('피카츄')).toBeInTheDocument()
    expect(useDraftStore.getState().drafts.demoTree01).toMatchObject({
      characterId: 2500,
      shiny: false,
    })
  })

  it('확인 창에서 아니오를 누르면 선택하지 않고 선택기에 남는다', async () => {
    mockRandomValues([1])
    const { router } = renderRoute(`${TREE}/pokemon`)

    await userEvent.click(await screen.findByRole('button', { name: /^파이리/ }))
    await userEvent.click(await screen.findByRole('button', { name: '아니오' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe(`${TREE}/pokemon`)
    expect(useDraftStore.getState().drafts.demoTree01).toBeUndefined()
  })

  it('랜덤 버튼은 전체 포켓몬 중 한 마리를 골라 확인 창을 띄우고, 이로치가 당첨될 수 있다', async () => {
    // 첫 난수: 전체 54마리 중 0번(이상해씨), 둘째 난수: 50으로 나눠 0 → 이로치
    renderRoute(`${TREE}/pokemon`)
    // 목록을 받은 뒤에 랜덤 버튼이 켜진다
    await screen.findByText('세대별 스타팅 포켓몬')
    mockRandomValues([0, 0])

    await userEvent.click(
      await screen.findByRole('button', { name: '전체 포켓몬 중 랜덤으로 고르기' }),
    )

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText('색이 다른 이상해씨')).toBeInTheDocument()
    expect(within(dialog).queryByText(/이로치가 나타났어요/)).not.toBeInTheDocument()
    // 문구는 없애도 반짝임은 남긴다
    expect(dialog.querySelector('[data-shiny="true"]')).not.toBeNull()
    expect(within(dialog).getByRole('img', { name: '이상해씨' })).toHaveAttribute(
      'src',
      expect.stringContaining('/shiny/1.png'),
    )
    await userEvent.click(within(dialog).getByRole('button', { name: '예' }))

    expect(await screen.findByText('이상해씨 · 이로치')).toBeInTheDocument()
    expect(useDraftStore.getState().drafts.demoTree01).toMatchObject({
      characterId: 100,
      shiny: true,
    })
  })

  it('세대와 타입 필터를 함께 쓴다', async () => {
    renderRoute(`${TREE}/pokemon`)

    const generations = await screen.findByRole('group', { name: '세대' })
    await userEvent.click(within(generations).getByRole('button', { name: '1세대' }))
    const types = screen.getByRole('group', { name: '타입' })
    await userEvent.click(within(types).getByRole('button', { name: '얼음' }))

    expect(await screen.findByText('3마리')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '필터 초기화' }))
    expect(await screen.findByText('세대별 스타팅 포켓몬')).toBeInTheDocument()
  })

  it('찾는 포켓몬이 없으면 안내한다', async () => {
    renderRoute(`${TREE}/pokemon`)

    await userEvent.type(await screen.findByLabelText('포켓몬 이름 검색'), '디지몬')

    expect(await screen.findByText(/찾는 포켓몬이 없어요/)).toBeInTheDocument()
  })
})

describe('볼 선택기', () => {
  it('38종 중 몬스터볼이 미리 선택되어 있고, 고르면 작성 화면에 반영된다', async () => {
    const { router } = renderRoute(`${TREE}/ball`)

    expect(
      await screen.findByRole('button', { name: '몬스터볼', pressed: true }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(37)
    await userEvent.click(screen.getByRole('button', { name: '프리미어볼' }))

    expect(router.state.location.pathname).toBe(TREE)
    expect(await screen.findByText('프리미어볼')).toBeInTheDocument()
  })
})
