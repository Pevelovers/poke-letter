import { screen } from '@testing-library/react'

import * as client from '@/api/client'
import { ApiError } from '@/api/client'
import type { TreeResponse } from '@/api/types'
import { renderRoute } from '@/test/render'

describe('TreeViewPage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('트리 이름, 장식, 남은 날, 메시지 남기기 버튼을 보여 준다', async () => {
    renderRoute('/t/demoTree01')

    expect(await screen.findByRole('heading', { name: '지우의 트리' })).toBeInTheDocument()
    expect(screen.getByText('장식 13개')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(10)
    expect(screen.getByRole('link', { name: '메시지 남기기' })).toHaveAttribute(
      'href',
      '/t/demoTree01/write',
    )
    expect(await screen.findByText(/12월 25일에 열려요 · D-/)).toBeInTheDocument()
  })

  it('공개 전에는 볼만 달고, 이로치가 든 볼은 반짝인다', async () => {
    renderRoute('/t/demoTree01')

    const shinyOrnament = await screen.findByLabelText('피카츄친구의 장식 (이로치)')
    expect(shinyOrnament.querySelector('[data-shiny="true"]')).not.toBeNull()
    expect(screen.getByLabelText('이슬의 장식').querySelector('[data-shiny="true"]')).toBeNull()
    expect(screen.queryByRole('img', { name: '이상해씨' })).not.toBeInTheDocument()
  })

  it('공개 후에는 볼 대신 포켓몬을 달고, 이로치는 이로치 이미지로 보여 준다', async () => {
    localStorage.setItem('pokeletter:mock-revealed', 'true')
    renderRoute('/t/demoTree01')

    expect(await screen.findByRole('img', { name: '이상해씨' })).toBeInTheDocument()
    const shiny = screen.getByLabelText('피카츄친구의 장식 (이로치)').querySelector('img')
    expect(shiny).toHaveAttribute('src', expect.stringContaining('/shiny/'))
    expect(screen.queryByRole('img', { name: '몬스터볼' })).not.toBeInTheDocument()
  })

  it('가득 찬 트리는 버튼 대신 안내를 보여 준다', async () => {
    const original = client.apiRequest
    vi.spyOn(client, 'apiRequest').mockImplementation(async (path, options) => {
      const response = await original(path, options)
      return path.startsWith('/trees/') ? { ...(response as TreeResponse), full: true } : response
    })

    renderRoute('/t/demoTree01')

    expect(await screen.findByText('이 트리는 장식이 가득 찼어요')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '메시지 남기기' })).not.toBeInTheDocument()
  })

  it('없는 트리면 안내와 내 트리 만들기 버튼을 보여 준다', async () => {
    vi.spyOn(client, 'apiRequest').mockRejectedValue(
      new ApiError(404, { code: 'TREE_NOT_FOUND', message: '트리를 찾을 수 없어요.' }),
    )

    renderRoute('/t/noSuchTree')

    expect(
      await screen.findByRole('heading', { name: '트리를 찾을 수 없어요' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '내 트리 만들기' })).toBeInTheDocument()
  })
})
