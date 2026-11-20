import { createFileRoute } from '@tanstack/react-router'

import { TreeViewPage } from '@/pages/tree/TreeViewPage'

export const Route = createFileRoute('/t/$treeId/')({
  component: TreeViewRoute,
})

function TreeViewRoute() {
  const { treeId } = Route.useParams()
  return <TreeViewPage treeId={treeId} />
}
