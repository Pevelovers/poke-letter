import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as client from '@/api/client'
import { ApiError } from '@/api/client'
import { renderRoute } from '@/test/render'

describe('MyTreePage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('트리가 없으면 이름을 받아 트리를 만들고 공유 버튼을 보여 준다', async () => {
    renderRoute('/me')

    const input = await screen.findByLabelText('트리 이름을 정해 주세요')
    await userEvent.type(input, '지우의 트리')
    await userEvent.click(screen.getByRole('button', { name: '트리 만들기' }))

    expect(await screen.findByRole('heading', { name: '지우의 트리' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '공유하기' })).toBeInTheDocument()
    expect(screen.getByText('장식 0개')).toBeInTheDocument()
  })

  it('트리 이름은 20자까지만 입력된다', async () => {
    renderRoute('/me')

    const input = await screen.findByLabelText('트리 이름을 정해 주세요')
    await userEvent.type(input, '가'.repeat(25))

    expect(input).toHaveValue('가'.repeat(20))
    expect(screen.getByText('20/20')).toBeInTheDocument()
  })

  it('이름이 거절되면 안내를 보여 주고 입력한 이름은 남긴다', async () => {
    renderRoute('/me')
    const input = await screen.findByLabelText('트리 이름을 정해 주세요')
    const original = client.apiRequest
    vi.spyOn(client, 'apiRequest').mockImplementation((path, options) =>
      path === '/trees'
        ? Promise.reject(
            new ApiError(400, { code: 'INAPPROPRIATE_NAME', message: '사용할 수 없는 표현' }),
          )
        : original(path, options),
    )

    await userEvent.type(input, '나쁜 이름')
    await userEvent.click(screen.getByRole('button', { name: '트리 만들기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('사용할 수 없는 표현이 있어요')
    expect(input).toHaveValue('나쁜 이름')
  })

  it('로그아웃하면 랜딩으로 돌아간다', async () => {
    const { router } = renderRoute('/me')

    await userEvent.click(await screen.findByRole('button', { name: '로그아웃' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})
