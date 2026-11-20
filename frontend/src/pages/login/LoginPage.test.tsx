import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderRoute } from '@/test/render'

describe('LoginPage', () => {
  it('켜진 제공자의 로그인 버튼을 카카오부터 보여 준다', async () => {
    renderRoute('/login')

    await screen.findByRole('button', { name: '카카오로 시작하기' })
    const labels = screen.getAllByRole('button').map((button) => button.textContent)
    expect(labels).toEqual(['카카오로 시작하기', '네이버로 시작하기', '구글로 시작하기'])
  })

  it('목 모드에서 로그인하면 내 트리 화면으로 가고 제공자를 표시한다', async () => {
    const { router } = renderRoute('/login')

    await userEvent.click(await screen.findByRole('button', { name: '네이버로 시작하기' }))

    expect(router.state.location.pathname).toBe('/me')
    expect(await screen.findByText('네이버로 로그인했어요')).toBeInTheDocument()
  })
})
