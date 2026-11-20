import { createFileRoute } from '@tanstack/react-router'

import { BallPickerPage } from '@/pages/picker/BallPickerPage'
import { useDraft, useDraftStore } from '@/stores/messageDraft'

export const Route = createFileRoute('/t/$treeId/write/ball')({
  component: BallPickerRoute,
})

/** 고른 볼은 작성 중인 메시지에 저장하고 작성 화면으로 돌아간다 */
function BallPickerRoute() {
  const { treeId } = Route.useParams()
  const navigate = Route.useNavigate()
  const draft = useDraft(treeId)
  const update = useDraftStore((state) => state.update)
  const back = () => void navigate({ to: '..' })

  return (
    <BallPickerPage
      selectedId={draft.ballId}
      onSelect={(ball) => {
        update(treeId, { ballId: ball.ballId })
        back()
      }}
      onBack={back}
    />
  )
}
