import { createFileRoute } from '@tanstack/react-router'

import { WritePage } from '@/pages/write/WritePage'

export const Route = createFileRoute('/t/$treeId/write/')({
  component: WriteRoute,
})

function WriteRoute() {
  const { treeId } = Route.useParams()
  return <WritePage treeId={treeId} />
}
