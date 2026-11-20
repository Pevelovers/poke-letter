import { createFileRoute } from '@tanstack/react-router'

import { WritePage } from '@/pages/write/WritePage'

export const Route = createFileRoute('/t/$treeId/write/')({
  component: WriteRoute,
})

function WriteRoute() {
  const { treeId } = Route.useParams()
  const navigate = Route.useNavigate()
  return (
    <WritePage
      treeId={treeId}
      onBack={() => void navigate({ to: '/t/$treeId', params: { treeId } })}
      onSent={(result) =>
        void navigate({
          to: '/t/$treeId/sent',
          params: { treeId },
          search: {
            pokemon: result.character.name,
            shiny: result.shiny || undefined,
            ball: result.ball.ballId,
          },
          // 뒤로 가기로 빈 작성 화면에 돌아가지 않게 한다
          replace: true,
        })
      }
    />
  )
}
