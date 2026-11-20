import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as client from '@/api/client'
import { ApiError } from '@/api/client'
import { emptyDraft, useDraftStore } from '@/stores/messageDraft'
import { renderRoute } from '@/test/render'

const TREE_ID = 'demoTree01'
const WRITE = `/t/${TREE_ID}/write`

function setDraft(patch: Partial<typeof emptyDraft>) {
  useDraftStore.getState().update(TREE_ID, patch)
}

/** 메시지 전송 요청만 가로챈다. 나머지는 목 API로 보낸다 */
function interceptSend(handler: (body: unknown) => Promise<unknown>) {
  const original = client.apiRequest
  return vi
    .spyOn(client, 'apiRequest')
    .mockImplementation((path, options) =>
      path.endsWith('/messages') ? (handler(options?.body) as never) : original(path, options),
    )
}

describe('WritePage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('포켓몬을 고르지 않으면 보내기가 비활성되고, 랜덤을 고르면 활성된다', async () => {
    renderRoute(WRITE)

    const send = await screen.findByRole('button', { name: '보내기' })
    expect(send).toBeDisabled()
    expect(screen.getByText('포켓몬을 고르거나 랜덤을 선택해 주세요.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('checkbox', { name: /랜덤으로 보내기/ }))

    expect(send).toBeEnabled()
    // 랜덤이면 포켓몬 선택 칸을 숨긴다
    expect(screen.queryByRole('link', { name: /포켓몬을 골라 주세요/ })).not.toBeInTheDocument()
  })

  it('쓰던 내용을 복구하고, 보내면 완료 화면으로 가며 임시 저장을 지운다', async () => {
    setDraft({ nickname: '이슬', content: '메리 크리스마스!', characterId: 13300 })
    const { router } = renderRoute(WRITE)

    expect(await screen.findByLabelText('닉네임')).toHaveValue('이슬')
    expect(screen.getByText('9/500')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '보내기' }))

    expect(
      await screen.findByRole('heading', { name: '이브이와 함께 보냈어요' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(`/t/${TREE_ID}/sent`)
    expect(useDraftStore.getState().drafts[TREE_ID]).toBeUndefined()
  })

  it('랜덤으로 보내면 랜덤 선물 문구를 보여 준다', async () => {
    setDraft({ nickname: '웅이', content: '안녕', random: true })
    renderRoute(WRITE)

    await userEvent.click(await screen.findByRole('button', { name: '보내기' }))

    expect(await screen.findByRole('heading', { name: '랜덤 선물을 보냈어요' })).toBeInTheDocument()
  })

  it('닉네임과 내용이 비어 있으면 보내지 않는다', async () => {
    setDraft({ random: true })
    const send = interceptSend(async () => ({}))
    renderRoute(WRITE)

    await userEvent.click(await screen.findByRole('button', { name: '보내기' }))

    expect(screen.getByText('닉네임을 입력해 주세요.')).toBeInTheDocument()
    expect(screen.getByText('메시지를 입력해 주세요.')).toBeInTheDocument()
    expect(send).not.toHaveBeenCalledWith(expect.stringMatching(/messages$/), expect.anything())
  })

  it('욕설로 거절되면 같은 내용은 다시 보내지 않고, 고치면 마스킹 허용으로 보낸다 (POL-FLT-07)', async () => {
    setDraft({ nickname: '로켓단', content: '나쁜 말', random: true })
    const bodies: unknown[] = []
    interceptSend(async (body) => {
      bodies.push(body)
      if (bodies.length === 1) {
        throw new ApiError(422, { code: 'INAPPROPRIATE_CONTENT', message: '부적절' })
      }
      return {
        messageId: 1,
        nickname: '로켓단',
        ball: { ballId: 4, name: '몬스터볼', imageUrl: '' },
        selectionType: 'RANDOM',
        character: null,
      }
    })
    renderRoute(WRITE)
    const send = await screen.findByRole('button', { name: '보내기' })

    await userEvent.click(send)
    expect(await screen.findByRole('alert')).toHaveTextContent('전하기 어려운 표현이 있어요')
    expect(bodies).toEqual([expect.objectContaining({ allowMasking: false })])

    await userEvent.click(send)
    expect(bodies).toHaveLength(1)

    await userEvent.type(screen.getByLabelText('메시지'), '!')
    await userEvent.click(send)
    await waitFor(() => expect(bodies).toHaveLength(2))
    expect(bodies[1]).toEqual(expect.objectContaining({ allowMasking: true, content: '나쁜 말!' }))
  })

  it('너무 자주 보내면 남은 시간을 안내하고 쓰던 내용을 남긴다', async () => {
    setDraft({ nickname: '로켓단', content: '또 보냄', random: true })
    interceptSend(async () => {
      throw new ApiError(429, { code: 'TOO_MANY_REQUESTS', message: '' }, 42)
    })
    renderRoute(WRITE)

    await userEvent.click(await screen.findByRole('button', { name: '보내기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('잠시 후 다시 보내 주세요 (42초)')
    expect(screen.getByLabelText('메시지')).toHaveValue('또 보냄')
    expect(useDraftStore.getState().drafts[TREE_ID]?.content).toBe('또 보냄')
    expect(screen.getByRole('button', { name: '보내기' })).toBeEnabled()
  })
})
