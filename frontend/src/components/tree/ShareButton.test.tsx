import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ShareButton } from './ShareButton'

const URL = `${window.location.origin}/t/aB3dE5fG7h`

function mockPointer(coarse: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: coarse } as MediaQueryList))
}

describe('ShareButton', () => {
  let share: ReturnType<typeof vi.fn>
  let writeText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // userEvent.setup()이 클립보드를 바꾸므로 그 뒤에 스파이를 건다
    share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'share')
  })

  function renderButton() {
    const user = userEvent.setup()
    writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<ShareButton treeId="aB3dE5fG7h" treeName="지우의 트리" />)
    return user
  }

  it('PC에서는 공유 시트를 열지 않고 링크를 복사한다', async () => {
    mockPointer(false)
    const user = renderButton()

    await user.click(screen.getByRole('button', { name: '공유하기' }))

    expect(share).not.toHaveBeenCalled()
    expect(writeText).toHaveBeenCalledWith(URL)
    expect(await screen.findByText('링크를 복사했어요')).toBeInTheDocument()
  })

  it('모바일에서는 기기 공유 시트를 연다', async () => {
    mockPointer(true)
    const user = renderButton()

    await user.click(screen.getByRole('button', { name: '공유하기' }))

    expect(share).toHaveBeenCalledWith({ title: '지우의 트리에 메시지를 남겨 주세요', url: URL })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('복사가 막히면 링크를 직접 복사할 수 있게 보여 준다', async () => {
    mockPointer(false)
    const user = renderButton()
    writeText.mockRejectedValue(new DOMException('denied', 'NotAllowedError'))

    await user.click(screen.getByRole('button', { name: '공유하기' }))

    expect(await screen.findByText(/복사하지 못했어요/)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: '공유 링크' })).toHaveValue(URL)
  })
})
