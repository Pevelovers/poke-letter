import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderRoute } from '@/test/render'

describe('LandingPage', () => {
  it('서비스 소개, 공개일, 비공식 고지를 보여 준다', async () => {
    renderRoute('/')

    expect(await screen.findByRole('heading', { name: /크리스마스 메시지/ })).toBeInTheDocument()
    expect(screen.getByText(/12월 25일에 열려요/)).toBeInTheDocument()
    expect(screen.getByText('비공식 팬 프로젝트')).toBeInTheDocument()
    expect(screen.getByText(/pokeletter\.contact@gmail\.com/)).toBeInTheDocument()
  })

  it('시작 버튼을 누르면 로그인 화면으로 간다', async () => {
    const { router } = renderRoute('/')

    await userEvent.click(await screen.findByRole('link', { name: '내 트리 만들기' }))

    expect(router.state.location.pathname).toBe('/login')
  })
})
